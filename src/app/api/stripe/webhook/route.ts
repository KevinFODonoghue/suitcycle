// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ListingStatus, OrderStatus } from "@prisma/client";

import { serverEnvOnly } from "@/env.mjs";
import { sendOrderReceiptEmail } from "@/lib/emails/orders";
import {
  appendStatusEvent,
  buildOrderSnapshot,
  ensureOrderEvents,
  serializeOrderEvents,
} from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { recordAudit } from "@/lib/audit";
import { captureError } from "@/lib/logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listingSnapshotSelect = {
  id: true,
  title: true,
  brand: true,
  model: true,
  size: true,
  genderFit: true,
  strokeSuitability: true,
  condition: true,
  photos: true,
  description: true,
  price: true,
} as const;

async function handlePaymentIntentSucceeded(intent: Stripe.PaymentIntent) {
  const order = await prisma.order.findUnique({
    where: { paymentIntentId: intent.id },
  });

  if (!order) {
    captureError(new Error("Order missing for payment intent"), {
      paymentIntentId: intent.id,
    });
    return;
  }

  if (
    order.status === OrderStatus.paid ||
    order.status === OrderStatus.shipped ||
    order.status === OrderStatus.delivered ||
    order.status === OrderStatus.refunded
  ) {
    return;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: order.listingId },
    select: listingSnapshotSelect,
  });

  if (!listing) {
    captureError(new Error("Listing missing for paid order"), {
      listingId: order.listingId,
      orderId: order.id,
    });
    return;
  }

  const paidAt = intent.created ? new Date(intent.created * 1000) : new Date();

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const events = appendStatusEvent(
      ensureOrderEvents(order.events),
      OrderStatus.paid,
      "Payment received via Stripe",
      paidAt,
      { source: "stripe-webhook", intentId: intent.id },
    );

    const result = await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.paid,
        paidAt,
        events: serializeOrderEvents(events),
        snapshot: buildOrderSnapshot(listing, {
          buyerId: order.buyerId,
          sellerId: order.sellerId,
          price: order.price,
          appFee: order.appFee,
          currency: order.currency,
          status: OrderStatus.paid,
          shippingMode: order.shippingMode,
          shippingFee: order.shippingFee,
          trackingUrl: order.trackingUrl,
          capturedAt: paidAt,
        }),
      },
      include: {
        buyer: { select: { email: true, name: true } },
        seller: { select: { name: true } },
      },
    });

    await tx.listing.update({
      where: { id: order.listingId },
      data: { status: ListingStatus.sold },
    });

    return result;
  });

    if (updatedOrder?.buyer?.email) {
      const currency =
        typeof order.currency === "string"
          ? order.currency.toUpperCase()
          : "USD";
      try {
        await sendOrderReceiptEmail({
          buyer: {
            email: updatedOrder.buyer.email,
            name: updatedOrder.buyer.name,
          },
          sellerName: updatedOrder.seller?.name,
          orderId: updatedOrder.id,
          listingTitle: listing.title,
          currency,
          totalCents: order.price,
          feeCents: order.appFee,
        });
      } catch (emailError) {
        captureError(emailError, {
          route: "stripe:webhook",
          event: "payment_intent.succeeded",
          orderId: updatedOrder.id,
        });
      }
    }
  }

async function handlePaymentIntentCanceled(intent: Stripe.PaymentIntent) {
  const order = await prisma.order.findUnique({
    where: { paymentIntentId: intent.id },
  });

  if (!order) {
    return;
  }

  if (
    order.status === OrderStatus.canceled ||
    order.status === OrderStatus.refunded
  ) {
    return;
  }

  const canceledAt = intent.canceled_at
    ? new Date(intent.canceled_at * 1000)
    : new Date();

  const listing = await prisma.listing.findUnique({
    where: { id: order.listingId },
    select: listingSnapshotSelect,
  });

  const metadata: Record<string, unknown> = {
    source: "stripe-webhook",
    intentId: intent.id,
  };

  if (intent.cancellation_reason) {
    metadata.cancellation_reason = intent.cancellation_reason;
  }

  if (intent.last_payment_error?.message) {
    metadata.last_payment_error = intent.last_payment_error.message;
  }

  const events = appendStatusEvent(
    ensureOrderEvents(order.events),
    OrderStatus.canceled,
    "Payment canceled",
    canceledAt,
    metadata,
  );

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.canceled,
      canceledAt,
      events: serializeOrderEvents(events),
      ...(listing
        ? {
            snapshot: buildOrderSnapshot(listing, {
              buyerId: order.buyerId,
              sellerId: order.sellerId,
              price: order.price,
              appFee: order.appFee,
              currency: order.currency,
              status: OrderStatus.canceled,
              shippingMode: order.shippingMode,
              shippingFee: order.shippingFee,
              trackingUrl: order.trackingUrl,
              capturedAt: canceledAt,
            }),
          }
        : {}),
    },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    captureError(new Error("Refund missing payment intent"), {
      chargeId: charge.id,
    });
    return;
  }

  const order = await prisma.order.findUnique({
    where: { paymentIntentId },
    select: {
      id: true,
      buyerId: true,
      sellerId: true,
      status: true,
      shippingMode: true,
      shippingFee: true,
      trackingUrl: true,
      price: true,
      appFee: true,
      currency: true,
      events: true,
      listing: {
        select: listingSnapshotSelect,
      },
    },
  });

  if (!order) {
    captureError(new Error("Refunded order not found"), {
      chargeId: charge.id,
      paymentIntentId,
    });
    return;
  }

  if (order.status === OrderStatus.refunded) {
    return;
  }

  const refund = charge.refunds?.data?.[0];
  const refundedAt =
    (refund?.created ? new Date(refund.created * 1000) : undefined) ?? new Date();

  const metadata: Record<string, unknown> = {
    source: "stripe-webhook",
    chargeId: charge.id,
    paymentIntentId,
    refundId: refund?.id,
    amount: refund?.amount ?? charge.amount_refunded,
    currency: refund?.currency ?? charge.currency,
    reason: refund?.reason,
    status: refund?.status,
  };

  const events = appendStatusEvent(
    ensureOrderEvents(order.events),
    OrderStatus.refunded,
    "Payment refunded via Stripe",
    refundedAt,
    metadata,
  );

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.refunded,
      refundedAt,
      events: serializeOrderEvents(events),
      ...(order.listing
        ? {
            snapshot: buildOrderSnapshot(order.listing, {
              buyerId: order.buyerId,
              sellerId: order.sellerId,
              price: order.price,
              appFee: order.appFee,
              currency: order.currency,
              status: OrderStatus.refunded,
              shippingMode: order.shippingMode,
              shippingFee: order.shippingFee,
              trackingUrl: order.trackingUrl,
              capturedAt: refundedAt,
            }),
          }
        : {}),
    },
  });

  const actorUserId = order.sellerId ?? order.buyerId;
  if (actorUserId) {
    await recordAudit({
      actorUserId,
      action: "order.refunded",
      entityType: "order",
      entityId: order.id,
      meta: {
        paymentIntentId,
        chargeId: charge.id,
        refundId: refund?.id,
        amount: refund?.amount ?? charge.amount_refunded,
      },
    });
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  if (!serverEnvOnly.STRIPE_WEBHOOK_SECRET) {
    const message = "STRIPE_WEBHOOK_SECRET is not configured; webhook processing is disabled.";
    if (process.env.NODE_ENV !== "test") {
      console.warn(message);
    }
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      serverEnvOnly.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    captureError(error, { route: "stripe:webhook", reason: "invalid-signature" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.canceled":
      case "payment_intent.payment_failed":
        await handlePaymentIntentCanceled(data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(data.object as Stripe.Charge);
        break;
      default:
        break;
    }
  } catch (error) {
    captureError(error, { route: "stripe:webhook", eventType: type });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

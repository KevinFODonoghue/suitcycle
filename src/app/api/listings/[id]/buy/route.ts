// src/app/api/listings/[id]/buy/route.ts
import { randomUUID } from "node:crypto";

import { ListingStatus, OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { requireSession } from "@/lib/auth";
import {
  appendStatusEvent,
  buildOrderSnapshot,
  calculatePlatformFee,
  createStatusEvent,
  ensureOrderEvents,
  serializeOrderEvents,
} from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { sendOrderPlacedEmail } from "@/lib/emails/orders";
import {
  getManualShippingFlatFeeCents,
  getShippingMode,
} from "@/lib/config";
import {
  BUYER_PERK_AUTHENTICATION_FEE,
  BUYER_PERK_VERIFIED_SUITSCORE_FEE,
  SELLER_PERK_PRIORITY_BPS,
  SELLER_PERK_AUTHENTICATION_BPS,
  SELLER_PERK_VERIFIED_SUITSCORE_BPS,
} from "@/lib/price";
import { enforceRateLimit, generateRateLimitKey } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-context";
import { captureError } from "@/lib/logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: RouteParams) {
  const { id: listingId } = await params;

  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buyerId = session.user.id;
    const ip = getRequestIp(req);

    enforceRateLimit({
      identifier: generateRateLimitKey("buy-intent", session.user.id ?? ip),
      limit: 8,
      windowMs: 60_000,
    });

    // Parse buyer perk selections from request body (JSON).
    let reqBody: Record<string, unknown> = {};
    try {
      reqBody = await req.clone().json();
    } catch {
      // No body or non-JSON — buyer selected no perks, which is fine.
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
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
        status: true,
        sellerId: true,
        isAuthenticated: true,
        suitScoreVerified: true,
        sellerPerkPriority: true,
        sellerPerkAuthentication: true,
        sellerPerkVerifiedSuitscore: true,
        sellerPerkPriorityVoucherCovered: true,
        sellerPerkAuthVoucherCovered: true,
        sellerPerkSuitscoreVoucherCovered: true,
        seller: {
          select: {
            id: true,
            stripeAccountId: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== ListingStatus.active) {
      return NextResponse.json(
        { error: "Listing is not available for purchase" },
        { status: 409 },
      );
    }

    if (listing.sellerId === buyerId) {
      return NextResponse.json(
        { error: "You cannot purchase your own listing" },
        { status: 400 },
      );
    }

    const sellerAccountId = listing.seller?.stripeAccountId ?? null;
    if (!sellerAccountId) {
      return NextResponse.json(
        { error: "Seller has not finished Stripe onboarding yet" },
        { status: 400 },
      );
    }

    const shippingMode = getShippingMode();
    if (shippingMode === "shippo") {
      return NextResponse.json(
        {
          error:
            "Shippo-powered checkout is not available yet. Manual shipping is currently required.",
        },
        { status: 503 },
      );
    }
    const shippingFee =
      shippingMode === "manual" ? getManualShippingFlatFeeCents() : 0;

    const existingOrder = await prisma.order.findFirst({
      where: {
        listingId,
        buyerId,
        status: OrderStatus.pending,
      },
      orderBy: { createdAt: "desc" },
    });

    const existingOrderShippingMode =
      existingOrder?.shippingMode ?? shippingMode;
    const existingOrderShippingFee =
      typeof existingOrder?.shippingFee === "number"
        ? existingOrder.shippingFee
        : shippingFee;
    const existingOrderTrackingUrl = existingOrder?.trackingUrl ?? null;

    if (existingOrder) {
      try {
        const intent = await stripe.paymentIntents.retrieve(
          existingOrder.paymentIntentId,
        );
        if (intent.status !== "canceled" && intent.status !== "succeeded") {
          return NextResponse.json({
            orderId: existingOrder.id,
            paymentIntentId: intent.id,
            clientSecret:
              intent.client_secret ?? existingOrder.paymentIntentClientSecret,
            status: intent.status,
            reused: true,
          });
        }

        if (intent.status === "succeeded") {
          const now = new Date();
          const updatedEvents = appendStatusEvent(
            ensureOrderEvents(existingOrder.events),
            OrderStatus.paid,
            "Payment confirmed",
            now,
            { source: "checkout" },
          );

          await prisma.order.update({
            where: { id: existingOrder.id },
            data: {
              status: OrderStatus.paid,
              paidAt: now,
              events: serializeOrderEvents(updatedEvents),
              snapshot: buildOrderSnapshot(listing, {
                buyerId,
                sellerId: listing.sellerId,
                price: existingOrder.price,
                appFee: existingOrder.appFee,
                currency: existingOrder.currency,
                status: OrderStatus.paid,
                shippingMode: existingOrderShippingMode,
                shippingFee: existingOrderShippingFee,
                trackingUrl: existingOrderTrackingUrl,
                capturedAt: now,
              }),
            },
          });
          return NextResponse.json(
            { error: "Order already completed" },
            { status: 409 },
          );
        }

        const canceledAt = new Date();
        const updatedEvents = appendStatusEvent(
          ensureOrderEvents(existingOrder.events),
          OrderStatus.canceled,
          "PaymentIntent canceled by buyer",
          canceledAt,
          { source: "checkout" },
        );

        await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: OrderStatus.canceled,
            canceledAt,
            events: serializeOrderEvents(updatedEvents),
            snapshot: buildOrderSnapshot(listing, {
              buyerId,
              sellerId: listing.sellerId,
              price: existingOrder.price,
              appFee: existingOrder.appFee,
              currency: existingOrder.currency,
              status: OrderStatus.canceled,
              shippingMode: existingOrderShippingMode,
              shippingFee: existingOrderShippingFee,
              trackingUrl: existingOrderTrackingUrl,
              capturedAt: canceledAt,
            }),
          },
        });
      } catch (error) {
        if (
          !(
            error instanceof Stripe.errors.StripeError &&
            error.code === "resource_missing"
          )
        ) {
          throw error;
        }
        const canceledAt = new Date();
        const updatedEvents = appendStatusEvent(
          ensureOrderEvents(existingOrder.events),
          OrderStatus.canceled,
          "PaymentIntent no longer available",
          canceledAt,
          { source: "checkout" },
        );

        await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: OrderStatus.canceled,
            canceledAt,
            events: serializeOrderEvents(updatedEvents),
            snapshot: buildOrderSnapshot(listing, {
              buyerId,
              sellerId: listing.sellerId,
              price: existingOrder.price,
              appFee: existingOrder.appFee,
              currency: existingOrder.currency,
              status: OrderStatus.canceled,
              shippingMode: existingOrderShippingMode,
              shippingFee: existingOrderShippingFee,
              trackingUrl: existingOrderTrackingUrl,
              capturedAt: canceledAt,
            }),
          },
        });
      }
    }

    // Buyer perks — only offer if the listing doesn't already have the seller-paid version.
    const wantsPerkAuth = !!reqBody.buyerPerkAuthentication && !listing.isAuthenticated;
    const wantsPerkSuitscore = !!reqBody.buyerPerkVerifiedSuitscore && !listing.suitScoreVerified;

    // Validate and redeem buyer vouchers (no charge if valid voucher applied).
    async function redeemBuyerVoucher(
      code: unknown,
      expectedType: "authentication" | "verified_suitscore",
    ): Promise<boolean> {
      if (typeof code !== "string" || !code.trim()) return false;
      const voucher = await prisma.voucher.findUnique({ where: { code: code.trim().toUpperCase() } });
      if (!voucher || voucher.type !== expectedType || voucher.redeemedAt) return false;
      if (voucher.expiresAt && voucher.expiresAt < new Date()) return false;
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { redeemedAt: new Date(), redeemedById: buyerId },
      });
      return true;
    }

    const [authVoucherCovered, suitscoreVoucherCovered] = await Promise.all([
      wantsPerkAuth ? redeemBuyerVoucher(reqBody.buyerAuthVoucherCode, "authentication") : Promise.resolve(false),
      wantsPerkSuitscore ? redeemBuyerVoucher(reqBody.buyerSuitscoreVoucherCode, "verified_suitscore") : Promise.resolve(false),
    ]);

    const buyerPerkAuthentication = wantsPerkAuth;
    const buyerPerkVerifiedSuitscore = wantsPerkSuitscore;
    const buyerPerksFee =
      (buyerPerkAuthentication && !authVoucherCovered ? BUYER_PERK_AUTHENTICATION_FEE : 0) +
      (buyerPerkVerifiedSuitscore && !suitscoreVoucherCovered ? BUYER_PERK_VERIFIED_SUITSCORE_FEE : 0);

    // Seller perk fee percent (basis points, non-voucher-covered perks only).
    let sellerPerksBps = 0;
    if (listing.sellerPerkPriority && !listing.sellerPerkPriorityVoucherCovered) sellerPerksBps += SELLER_PERK_PRIORITY_BPS;
    if (listing.sellerPerkAuthentication && !listing.sellerPerkAuthVoucherCovered) sellerPerksBps += SELLER_PERK_AUTHENTICATION_BPS;
    if (listing.sellerPerkVerifiedSuitscore && !listing.sellerPerkSuitscoreVoucherCovered) sellerPerksBps += SELLER_PERK_VERIFIED_SUITSCORE_BPS;

    const appFee = calculatePlatformFee(listing.price);
    const totalAmount = listing.price + shippingFee + buyerPerksFee;
    const idempotencyKey = randomUUID();

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalAmount,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        application_fee_amount: appFee,
        transfer_data: {
          destination: sellerAccountId,
        },
        metadata: {
          listingId: listing.id,
          listingTitle: listing.title,
          buyerId,
          sellerId: listing.sellerId,
          shippingMode,
          shippingFee: String(shippingFee),
          buyerPerksFee: String(buyerPerksFee),
        },
        receipt_email: session.user.email ?? undefined,
      },
      { idempotencyKey },
    );

    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { error: "Stripe did not return a client secret" },
        { status: 502 },
      );
    }

    const createdAt = new Date();

    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId,
        sellerId: listing.sellerId,
        status: OrderStatus.pending,
        shippingMode,
        shippingFee,
        price: paymentIntent.amount,
        appFee,
        buyerPerkAuthentication,
        buyerPerkVerifiedSuitscore,
        buyerPerksFee,
        sellerPerksFeePercent: sellerPerksBps,
        currency: paymentIntent.currency,
        paymentIntentId: paymentIntent.id,
        paymentIntentClientSecret: paymentIntent.client_secret,
        idempotencyKey,
        events: serializeOrderEvents([
          createStatusEvent(
            OrderStatus.pending,
            "Order created, awaiting payment",
            createdAt,
            { source: "checkout" },
          ),
        ]),
        snapshot: buildOrderSnapshot(listing, {
          buyerId,
          sellerId: listing.sellerId,
          price: paymentIntent.amount,
          appFee,
          currency: paymentIntent.currency,
          status: OrderStatus.pending,
          shippingMode,
          shippingFee,
          capturedAt: createdAt,
        }),
      },
    });

    if (listing.seller?.email) {
      try {
        await sendOrderPlacedEmail({
          seller: {
            email: listing.seller.email,
            name: listing.seller.fullName,
          },
          buyerName: session.user.fullName ?? session.user.name ?? null,
          listingTitle: listing.title,
          orderId: order.id,
          totalCents: paymentIntent.amount,
        });
      } catch (error) {
        captureError(error, { context: "email:orderPlaced", listingId: listing.id, orderId: order.id });
      }
    }

    return NextResponse.json({
      orderId: order.id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      reused: false,
    });
  } catch (error) {
    captureError(error, { route: "POST /api/listings/[id]/buy" });
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode ?? 400 },
      );
    }
    return NextResponse.json(
      { error: "Unable to create PaymentIntent" },
      { status: 500 },
    );
  }
}

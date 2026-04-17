import * as React from "react";

import { serverEnvOnly } from "@/env.mjs";
import OrderDisputeEmail from "@/emails/OrderDisputeEmail";
import OrderMessageEmail from "@/emails/OrderMessageEmail";
import OrderPlacedEmail from "@/emails/OrderPlacedEmail";
import OrderReceiptEmail from "@/emails/OrderReceiptEmail";
import OrderDeliveredEmail from "@/emails/OrderDeliveredEmail";
import OrderShippedEmail from "@/emails/OrderShippedEmail";
import { formatPrice } from "@/lib/price";

import { sendEmail, SUPPORT_EMAIL } from "./resend";

type Participant = {
  email: string | null | undefined;
  name?: string | null;
};

function getBaseUrl() {
  const base = serverEnvOnly.NEXTAUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
  return base.replace(/\/$/, "");
}

function buildOrderUrl(orderId: string, suffix = "") {
  const base = getBaseUrl();
  if (!base) return undefined;
  return `${base}/orders/${orderId}${suffix}`;
}

function truncateBody(body: string, max = 280) {
  if (body.length <= max) return body;
  return `${body.slice(0, max - 1)}…`;
}

export async function sendOrderPlacedEmail({
  seller,
  buyerName,
  listingTitle,
  orderId,
  totalCents,
}: {
  seller: Participant;
  buyerName?: string | null;
  listingTitle: string;
  orderId: string;
  totalCents?: number;
}) {
  if (!seller.email) return;

  const listingUrl = buildOrderUrl(orderId);
  const totalLabel = typeof totalCents === "number" ? formatPrice(totalCents) : undefined;

  await sendEmail({
    to: seller.email,
    subject: `New SuitCycle order for ${listingTitle}`,
    react: (
      <OrderPlacedEmail
        sellerName={seller.name}
        buyerName={buyerName}
        listingTitle={listingTitle}
        orderId={orderId}
        listingUrl={listingUrl}
        totalLabel={totalLabel}
      />
    ),
    headers: {
      "X-Entity-Ref-ID": orderId,
    },
  });
}

export async function sendOrderReceiptEmail({
  buyer,
  sellerName,
  listingTitle,
  orderId,
  totalCents,
  feeCents,
  listingUrl,
  currency,
}: {
  buyer: Participant;
  sellerName?: string | null;
  listingTitle: string;
  orderId: string;
  totalCents: number;
  feeCents: number;
  listingUrl?: string;
  currency?: string;
}) {
  if (!buyer.email) return;

  const currencyOption =
    currency && typeof currency === "string"
      ? { currency: currency.toUpperCase() }
      : undefined;
  const totalLabel = formatPrice(totalCents, currencyOption);
  const feeLabel = formatPrice(feeCents, currencyOption);
  const netLabel = formatPrice(Math.max(totalCents - feeCents, 0), currencyOption);
  const orderUrl = listingUrl ?? buildOrderUrl(orderId);

  await sendEmail({
    to: buyer.email,
    subject: `Receipt for ${listingTitle}`,
    react: (
      <OrderReceiptEmail
        buyerName={buyer.name}
        sellerName={sellerName}
        listingTitle={listingTitle}
        orderId={orderId}
        listingUrl={orderUrl}
        totalLabel={totalLabel}
        feeLabel={feeLabel}
        netLabel={netLabel}
      />
    ),
    headers: {
      "X-Entity-Ref-ID": orderId,
    },
  });
}

export async function sendOrderShippedEmail({
  buyer,
  listingTitle,
  orderId,
  trackingUrl,
}: {
  buyer: Participant;
  listingTitle: string;
  orderId: string;
  trackingUrl?: string | null;
}) {
  if (!buyer.email) return;

  await sendEmail({
    to: buyer.email,
    subject: `${listingTitle} is on the way`,
    react: (
      <OrderShippedEmail
        buyerName={buyer.name}
        listingTitle={listingTitle}
        orderId={orderId}
        trackingUrl={trackingUrl}
      />
    ),
    headers: {
      "X-Entity-Ref-ID": orderId,
    },
  });
}

export async function sendOrderDeliveredEmail({
  seller,
  listingTitle,
  orderId,
  deliveredAt,
}: {
  seller: Participant;
  listingTitle: string;
  orderId: string;
  deliveredAt: Date;
}) {
  if (!seller.email) return;

  const deliveredLabel = deliveredAt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  await sendEmail({
    to: seller.email,
    subject: `Delivery confirmed for ${listingTitle}`,
    react: (
      <OrderDeliveredEmail
        sellerName={seller.name}
        listingTitle={listingTitle}
        orderId={orderId}
        deliveredLabel={deliveredLabel}
      />
    ),
    headers: {
      "X-Entity-Ref-ID": orderId,
    },
  });
}

export async function sendOrderDisputeOpenedEmail({
  recipients,
  listingTitle,
  orderId,
  openedByName,
  reason,
}: {
  recipients: Participant[];
  listingTitle: string;
  orderId: string;
  openedByName?: string | null;
  reason?: string | null;
}) {
  const to = recipients.map((recipient) => recipient.email).filter(Boolean) as string[];
  if (!to.length) return;

  await sendEmail({
    to,
    cc: SUPPORT_EMAIL,
    subject: `Dispute opened for ${listingTitle}`,
    react: (
      <OrderDisputeEmail
        recipientName={to.length === 1 ? recipients[0]?.name : undefined}
        listingTitle={listingTitle}
        orderId={orderId}
        openedByName={openedByName}
        reason={reason}
      />
    ),
    headers: {
      "X-Entity-Ref-ID": orderId,
    },
  });
}

export async function sendOrderMessageNotificationEmail({
  recipient,
  senderName,
  listingTitle,
  orderId,
  messageBody,
}: {
  recipient: Participant;
  senderName?: string | null;
  listingTitle: string;
  orderId: string;
  messageBody: string;
}) {
  if (!recipient.email) return;
  const snippet = truncateBody(messageBody, 400);
  const messagesUrl = buildOrderUrl(orderId, "/messages");

  await sendEmail({
    to: recipient.email,
    subject: `New message about ${listingTitle}`,
    react: (
      <OrderMessageEmail
        recipientName={recipient.name}
        senderName={senderName}
        listingTitle={listingTitle}
        orderId={orderId}
        messageSnippet={snippet}
        messagesUrl={messagesUrl}
      />
    ),
    headers: {
      "X-Entity-Ref-ID": orderId,
    },
  });
}

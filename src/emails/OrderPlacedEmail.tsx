import * as React from "react";

import { EmailLayout } from "@/emails/components/EmailLayout";

type OrderPlacedEmailProps = {
  sellerName?: string | null;
  buyerName?: string | null;
  listingTitle: string;
  orderId: string;
  listingUrl?: string;
  totalLabel?: string;
};

export function OrderPlacedEmail({
  sellerName,
  buyerName,
  listingTitle,
  orderId,
  listingUrl,
  totalLabel,
}: OrderPlacedEmailProps) {
  const previewText = `${listingTitle} has a new pending order.`;
  const greeting = sellerName ? `Hi ${sellerName},` : "Hi there,";
  const buyerLine = buyerName ? `${buyerName} just started checkout.` : "A buyer just started checkout.";

  return (
    <EmailLayout previewText={previewText} heading="New order placed">
      <p style={{ marginTop: 0 }}>{greeting}</p>
      <p style={{ margin: "0 0 16px 0" }}>
        {buyerLine} Keep an eye on your dashboard,once payment clears we&apos;ll let you know so you can ship the suit.
      </p>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "16px 20px",
          background: "#f8fafc",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>{listingTitle}</p>
        <p style={{ margin: "0 0 4px 0", color: "#475569" }}>Order {orderId}</p>
        {totalLabel ? (
          <p style={{ margin: 0, color: "#0f172a" }}>
            Checkout total: <strong>{totalLabel}</strong>
          </p>
        ) : null}
      </div>
      {listingUrl ? (
        <p style={{ margin: "16px 0 0 0" }}>
          <a href={listingUrl} style={{ color: "#2563eb", textDecoration: "none" }}>
            View listing
          </a>
        </p>
      ) : null}
    </EmailLayout>
  );
}

export default OrderPlacedEmail;

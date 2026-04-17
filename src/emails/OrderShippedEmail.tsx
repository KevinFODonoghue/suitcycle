import * as React from "react";

import { EmailLayout } from "@/emails/components/EmailLayout";

type OrderShippedEmailProps = {
  buyerName?: string | null;
  listingTitle: string;
  orderId: string;
  trackingUrl?: string | null;
  note?: string | null;
};

export function OrderShippedEmail({
  buyerName,
  listingTitle,
  orderId,
  trackingUrl,
  note,
}: OrderShippedEmailProps) {
  const previewText = `${listingTitle} is on the way.`;
  const greeting = buyerName ? `Hi ${buyerName},` : "Hi there,";

  return (
    <EmailLayout previewText={previewText} heading="Your suit is on the way">
      <p style={{ marginTop: 0 }}>{greeting}</p>
      <p style={{ margin: "0 0 16px 0" }}>
        The seller marked order <strong>{orderId}</strong> as shipped. Tracking details are below.
      </p>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "16px 20px",
          background: "#f1f5f9",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>{listingTitle}</p>
        {trackingUrl ? (
          <p style={{ margin: 0 }}>
            Tracking link:{" "}
            <a href={trackingUrl} style={{ color: "#2563eb", textDecoration: "none" }}>
              {trackingUrl}
            </a>
          </p>
        ) : (
          <p style={{ margin: 0 }}>The seller will add a public tracking URL shortly.</p>
        )}
      </div>
      {note ? <p style={{ margin: "16px 0 0 0" }}>{note}</p> : null}
    </EmailLayout>
  );
}

export default OrderShippedEmail;

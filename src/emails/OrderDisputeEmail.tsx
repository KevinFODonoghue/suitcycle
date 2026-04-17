import * as React from "react";

import { EmailLayout } from "@/emails/components/EmailLayout";

type OrderDisputeEmailProps = {
  recipientName?: string | null;
  listingTitle: string;
  orderId: string;
  openedByName?: string | null;
  reason?: string | null;
};

export function OrderDisputeEmail({
  recipientName,
  listingTitle,
  orderId,
  openedByName,
  reason,
}: OrderDisputeEmailProps) {
  const previewText = `A dispute was opened for ${listingTitle}.`;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";
  const opener = openedByName ? `${openedByName} opened a dispute.` : "A buyer opened a dispute.";

  return (
    <EmailLayout previewText={previewText} heading="Dispute opened">
      <p style={{ marginTop: 0 }}>{greeting}</p>
      <p style={{ margin: "0 0 16px 0" }}>
        {opener} We&apos;ll work with both parties to resolve order <strong>{orderId}</strong>.
      </p>
      <div
        style={{
          border: "1px solid #fda4af",
          borderRadius: "12px",
          padding: "16px 20px",
          background: "#fff1f2",
        }}
      >
        <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>{listingTitle}</p>
        <p style={{ margin: 0, color: "#be123c" }}>Order {orderId}</p>
      </div>
      {reason ? (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            borderRadius: "12px",
            background: "#f8fafc",
            border: "1px dashed #cbd5f5",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Buyer notes</p>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{reason}</p>
        </div>
      ) : null}
      <p style={{ margin: "16px 0 0 0" }}>
        We&apos;ll email updates as soon as there&apos;s progress. Reply to this email if you have additional
        context.
      </p>
    </EmailLayout>
  );
}

export default OrderDisputeEmail;

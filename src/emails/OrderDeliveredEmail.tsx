import * as React from "react";

import { EmailLayout } from "@/emails/components/EmailLayout";

type OrderDeliveredEmailProps = {
  sellerName?: string | null;
  listingTitle: string;
  orderId: string;
  deliveredLabel: string;
};

export function OrderDeliveredEmail({
  sellerName,
  listingTitle,
  orderId,
  deliveredLabel,
}: OrderDeliveredEmailProps) {
  const previewText = `${listingTitle} was confirmed delivered.`;
  const greeting = sellerName ? `Hi ${sellerName},` : "Hi there,";

  return (
    <EmailLayout previewText={previewText} heading="Delivery confirmed">
      <p style={{ marginTop: 0 }}>{greeting}</p>
      <p style={{ margin: "0 0 16px 0" }}>
        The buyer confirmed delivery for order <strong>{orderId}</strong>. You can now close out the
        transaction.
      </p>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "16px 20px",
          background: "#ecfccb",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>{listingTitle}</p>
        <p style={{ margin: 0, color: "#4d7c0f" }}>Delivered: {deliveredLabel}</p>
      </div>
    </EmailLayout>
  );
}

export default OrderDeliveredEmail;

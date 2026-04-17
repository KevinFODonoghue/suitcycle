import * as React from "react";

import { EmailLayout } from "@/emails/components/EmailLayout";

type OrderReceiptEmailProps = {
  buyerName?: string | null;
  sellerName?: string | null;
  listingTitle: string;
  orderId: string;
  listingUrl?: string;
  totalLabel: string;
  feeLabel: string;
  netLabel: string;
};

export function OrderReceiptEmail({
  buyerName,
  sellerName,
  listingTitle,
  orderId,
  listingUrl,
  totalLabel,
  feeLabel,
  netLabel,
}: OrderReceiptEmailProps) {
  const previewText = `You paid ${totalLabel} for ${listingTitle}.`;
  const greeting = buyerName ? `Hi ${buyerName},` : "Hi there,";

  return (
    <EmailLayout previewText={previewText} heading="Thanks for your purchase">
      <p style={{ marginTop: 0 }}>{greeting}</p>
      <p style={{ margin: "0 0 16px 0" }}>
        Here&apos;s your SuitCycle receipt for <strong>{listingTitle}</strong>.
      </p>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "20px",
          background: "#f8fafc",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Order {orderId}</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 0", color: "#475569" }}>Listing price</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{totalLabel}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", color: "#475569" }}>Platform fee</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{feeLabel}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: 600 }}>Net to seller</td>
              <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>{netLabel}</td>
            </tr>
          </tbody>
        </table>
        {sellerName ? (
          <p style={{ margin: "12px 0 0 0", color: "#475569" }}>
            Seller: <strong>{sellerName}</strong>
          </p>
        ) : null}
      </div>
      {listingUrl ? (
        <p style={{ margin: "16px 0 0 0" }}>
          <a href={listingUrl} style={{ color: "#2563eb", textDecoration: "none" }}>
            View the order timeline
          </a>
        </p>
      ) : null}
    </EmailLayout>
  );
}

export default OrderReceiptEmail;

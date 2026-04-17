import * as React from "react";

import { EmailLayout } from "@/emails/components/EmailLayout";

type OrderMessageEmailProps = {
  recipientName?: string | null;
  senderName?: string | null;
  listingTitle: string;
  orderId: string;
  messageSnippet: string;
  messagesUrl?: string;
};

export function OrderMessageEmail({
  recipientName,
  senderName,
  listingTitle,
  orderId,
  messageSnippet,
  messagesUrl,
}: OrderMessageEmailProps) {
  const previewText = `${senderName ?? "A buyer"} sent a new message about ${listingTitle}.`;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";

  return (
    <EmailLayout previewText={previewText} heading="New message on your order">
      <p style={{ marginTop: 0 }}>{greeting}</p>
      <p style={{ margin: "0 0 16px 0" }}>
        {senderName ?? "A buyer"} sent a new message about <strong>{listingTitle}</strong> (order{" "}
        {orderId}).
      </p>
      <blockquote
        style={{
          margin: "0 0 16px 0",
          padding: "16px 20px",
          borderLeft: "4px solid #2563eb",
          background: "#eff6ff",
          borderRadius: "0 12px 12px 0",
          color: "#1e293b",
          whiteSpace: "pre-wrap",
        }}
      >
        {messageSnippet}
      </blockquote>
      {messagesUrl ? (
        <p style={{ margin: 0 }}>
          <a href={messagesUrl} style={{ color: "#2563eb", textDecoration: "none" }}>
            Reply from your SuitCycle inbox
          </a>
        </p>
      ) : null}
    </EmailLayout>
  );
}

export default OrderMessageEmail;

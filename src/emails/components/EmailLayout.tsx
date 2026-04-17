import * as React from "react";

type EmailLayoutProps = {
  previewText: string;
  heading: string;
  children: React.ReactNode;
};

const outerStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  backgroundColor: "#f5f5f5",
  padding: "24px",
  color: "#111827",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "32px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const headingStyle: React.CSSProperties = {
  fontSize: "20px",
  margin: "0 0 16px 0",
  color: "#0f172a",
};

const footerStyle: React.CSSProperties = {
  marginTop: "32px",
  fontSize: "12px",
  color: "#94a3b8",
};

const preheaderStyle: React.CSSProperties = {
  display: "none",
  visibility: "hidden",
  lineHeight: "1px",
  opacity: 0,
  maxHeight: 0,
  maxWidth: 0,
  overflow: "hidden",
};

export function EmailLayout({ previewText, heading, children }: EmailLayoutProps) {
  return (
    <div style={outerStyle}>
      <div style={preheaderStyle}>{previewText}</div>
      <div style={containerStyle}>
        <h1 style={headingStyle}>{heading}</h1>
        <div>{children}</div>
        <p style={footerStyle}>This email was sent automatically by SuitCycle.</p>
      </div>
    </div>
  );
}

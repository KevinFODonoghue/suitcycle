import * as React from "react";

import { Resend } from "resend";

import { serverEnvOnly } from "@/env.mjs";

const RESEND_DISABLED_MESSAGE =
  "RESEND_API_KEY is not configured; transactional emails are disabled.";

const hasResendApiKey = Boolean(serverEnvOnly.RESEND_API_KEY);

const resendProxy = new Proxy({} as Resend, {
  get() {
    throw new Error(RESEND_DISABLED_MESSAGE);
  },
});

export const resend = hasResendApiKey
  ? new Resend(serverEnvOnly.RESEND_API_KEY!)
  : resendProxy;

export const ORDERS_FROM = "SuitCycle Orders <orders@suitcycle.com>";
export const SUPPORT_EMAIL = "support@suitcycle.com";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  headers?: Record<string, string>;
  cc?: string | string[];
  bcc?: string | string[];
};

export async function sendEmail({
  to,
  subject,
  react,
  from = ORDERS_FROM,
  headers,
  cc,
  bcc,
}: SendEmailOptions) {
  if (!hasResendApiKey) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(RESEND_DISABLED_MESSAGE);
    }
    return;
  }

  await resend.emails.send({
    from,
    to,
    subject,
    react,
    headers,
    cc,
    bcc,
  });
}

export default resend;

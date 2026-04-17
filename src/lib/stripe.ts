// src/lib/stripe.ts
import Stripe from "stripe";

import { serverEnvOnly } from "@/env.mjs";

const STRIPE_DISABLED_MESSAGE =
  "STRIPE_SECRET_KEY is not configured; Stripe features are disabled.";
const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-09-30.clover";

function createStripeClient(): Stripe {
  if (!serverEnvOnly.STRIPE_SECRET_KEY) {
    return new Proxy({} as Stripe, {
      get() {
        throw new Error(STRIPE_DISABLED_MESSAGE);
      },
    });
  }

  return new Stripe(serverEnvOnly.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
  });
}

/**
 * Shared Stripe client.
 * Uses the server-only env guard to ensure the secret key is available.
 */
export const stripe = createStripeClient();

export type StripeClient = typeof stripe;

export default stripe;

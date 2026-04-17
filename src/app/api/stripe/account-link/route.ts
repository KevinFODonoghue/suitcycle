// src/app/api/stripe/account-link/route.ts
import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { createStripeAccountOnboardingLink } from "@/lib/stripe/connect";
import { enforceRateLimit, generateRateLimitKey } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-context";
import { captureError } from "@/lib/logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getRequestIp(req);
    enforceRateLimit({
      identifier: generateRateLimitKey("api:stripeAccountLink", session.user.id ?? ip),
      limit: 3,
      windowMs: 300_000,
    });

    const { url } = await createStripeAccountOnboardingLink(session.user.id);
    return NextResponse.json({ url });
  } catch (error) {
    captureError(error, { route: "POST /api/stripe/account-link" });
    return NextResponse.json(
      { error: "Unable to create Stripe account link" },
      { status: 500 },
    );
  }
}

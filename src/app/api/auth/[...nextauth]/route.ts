// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";
import { enforceRateLimit, generateRateLimitKey, RateLimitError } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-context";

const handler = NextAuth(authOptions);

function checkRateLimit(req: Request): Response | null {
  const ip = getRequestIp(req);
  try {
    enforceRateLimit({
      identifier: generateRateLimitKey("auth", ip),
      limit: 20,
      windowMs: 60_000,
    });
    return null;
  } catch (err) {
    if (err instanceof RateLimitError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw err;
  }
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ nextauth: string[] }> },
) {
  const limited = checkRateLimit(req);
  if (limited) return limited;
  const params = await ctx.params;
  return handler(req, { params });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ nextauth: string[] }> },
) {
  const limited = checkRateLimit(req);
  if (limited) return limited;
  const params = await ctx.params;
  return handler(req, { params });
}

export const runtime = "nodejs";

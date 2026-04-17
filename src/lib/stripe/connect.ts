// src/lib/stripe/connect.ts
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/prisma";
import stripe from "@/lib/stripe";

type EnsureAccountResult = {
  accountId: string;
  account: Stripe.Account;
  created: boolean;
};

function sanitizeBaseUrl(rawUrl: string): string {
  return rawUrl.replace(/\/+$/, "");
}

function getAppBaseUrl(): string {
  return sanitizeBaseUrl(env.NEXT_PUBLIC_APP_URL);
}

export async function ensureStripeStandardAccount(userId: string): Promise<EnsureAccountResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      stripeAccountId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.email) {
    throw new Error("User is missing an email address");
  }

  if (user.stripeAccountId) {
    try {
      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      return { accountId: account.id, account, created: false };
    } catch (error) {
      if (
        error instanceof Stripe.errors.StripeError &&
        error.code === "resource_missing"
      ) {
        // fall through and create a new account
      } else {
        throw error;
      }
    }
  }

  const account = await stripe.accounts.create({
    type: "standard",
    email: user.email,
    metadata: {
      userId: user.id,
      fullName: user.fullName ?? null,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeAccountId: account.id },
  });

  return { accountId: account.id, account, created: true };
}

export async function createStripeAccountOnboardingLink(userId: string) {
  const { accountId, account, created } = await ensureStripeStandardAccount(userId);
  const baseUrl = getAppBaseUrl();

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/sell/payouts?refresh=1`,
    return_url: `${baseUrl}/sell/payouts?return=1`,
    type: "account_onboarding",
  });

  return { accountId, account, created, url: link.url };
}

export async function getUserStripeAccount(userId: string, accountId?: string) {
  let resolvedAccountId = accountId;

  if (!resolvedAccountId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true },
    });

    resolvedAccountId = user?.stripeAccountId ?? undefined;
  }

  if (!resolvedAccountId) {
    return null;
  }

  try {
    const account = await stripe.accounts.retrieve(resolvedAccountId);
    return account;
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeError &&
      error.code === "resource_missing"
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: { stripeAccountId: null },
      });
      return null;
    }
    throw error;
  }
}

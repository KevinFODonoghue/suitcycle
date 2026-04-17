import type Stripe from "stripe";

export type StripeStatusDescriptor = {
  label: string;
  description: string;
  variant: "default" | "secondary" | "destructive" | "outline";
};

export function describeStripeStatus(
  accountId: string | null | undefined,
  account: Stripe.Account | null,
): StripeStatusDescriptor {
  if (!accountId) {
    return {
      label: "Not connected",
      description: "Connect your Stripe account to receive SuitCycle payouts.",
      variant: "destructive",
    };
  }

  if (!account) {
    return {
      label: "Needs attention",
      description: "We couldn't retrieve your Stripe account. Start onboarding again to reconnect.",
      variant: "destructive",
    };
  }

  if (!account.details_submitted) {
    return {
      label: "Onboarding in progress",
      description: "Finish the Stripe flow to enable charges and payouts.",
      variant: "secondary",
    };
  }

  if (account.charges_enabled && account.payouts_enabled) {
    return {
      label: "Connected",
      description: "Stripe is ready to process SuitCycle orders and send payouts.",
      variant: "default",
    };
  }

  return {
    label: "Action required",
    description: "Stripe needs additional information before we can send payouts.",
    variant: "secondary",
  };
}

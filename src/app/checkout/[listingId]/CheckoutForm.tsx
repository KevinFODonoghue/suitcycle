"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, AlertCircle, ArrowRight, Ticket } from "lucide-react";
import {
  formatPrice,
  BUYER_PERK_AUTHENTICATION_FEE,
  BUYER_PERK_VERIFIED_SUITSCORE_FEE,
} from "@/lib/price";

// ─── PayForm ────────────────────────────────────────────────────────────────

function PayForm({ orderId, totalCents }: { orderId: string; totalCents: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?success=1`,
      },
    });

    setSubmitting(false);

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
          terms: { card: "never" },
        }}
      />

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#00B4FF] text-white font-bold text-base hover:bg-[#0066AA] transition-colors shadow-lg shadow-[#00B4FF]/20 disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            Pay {formatPrice(totalCents)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Secured by Stripe · SuitCycle never stores your card details
      </p>
    </form>
  );
}

// ─── VoucherInput ────────────────────────────────────────────────────────────

type VoucherState = {
  expanded: boolean;
  code: string;
  applying: boolean;
  applied: boolean;
  appliedCode: string;
  error: string | null;
};

const INIT_VOUCHER: VoucherState = {
  expanded: false, code: "", applying: false, applied: false, appliedCode: "", error: null,
};

function VoucherInput({
  voucherType,
  state,
  setState,
}: {
  voucherType: "authentication" | "verified_suitscore";
  state: VoucherState;
  setState: React.Dispatch<React.SetStateAction<VoucherState>>;
}) {
  async function apply() {
    const code = state.code.trim().toUpperCase();
    if (!code) return;
    setState((v) => ({ ...v, applying: true, error: null }));
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type: voucherType }),
      });
      const data = await res.json();
      if (data.valid) {
        setState((v) => ({ ...v, applying: false, applied: true, appliedCode: code, error: null }));
      } else {
        setState((v) => ({ ...v, applying: false, error: data.reason ?? "Invalid voucher" }));
      }
    } catch {
      setState((v) => ({ ...v, applying: false, error: "Could not verify voucher" }));
    }
  }

  if (state.applied) {
    return (
      <span className="text-xs text-green-700 flex items-center gap-1">
        <Ticket size={11} /> Voucher applied — free
      </span>
    );
  }

  if (!state.expanded) {
    return (
      <button
        type="button"
        onClick={() => setState((v) => ({ ...v, expanded: true }))}
        className="text-xs text-[#00B4FF] hover:underline"
      >
        Have a voucher?
      </button>
    );
  }

  return (
    <div className="mt-1.5">
      <div className="flex gap-2">
        <input
          className="flex-1 text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
          placeholder="Enter code"
          value={state.code}
          onChange={(e) => setState((v) => ({ ...v, code: e.target.value, error: null }))}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
        <button
          type="button"
          onClick={apply}
          disabled={state.applying}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors disabled:opacity-60"
        >
          {state.applying ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {state.error && <p className="mt-1 text-xs text-red-500">{state.error}</p>}
    </div>
  );
}

// ─── CheckoutForm ────────────────────────────────────────────────────────────

interface Props {
  listingId: string;
  listingPrice: number;
  shippingFee: number;
  listingIsAuthenticated: boolean;
  listingSuitScoreVerified: boolean;
  stripePublishableKey: string | null;
  initialVoucherCode?: string;
}

export function CheckoutForm({
  listingId,
  listingPrice,
  shippingFee,
  listingIsAuthenticated,
  listingSuitScoreVerified,
  stripePublishableKey,
  initialVoucherCode,
}: Props) {
  // Phase 1: perk selection. Phase 2: payment.
  const [phase, setPhase] = useState<"perks" | "payment">("perks");

  // Buyer perk selections
  const [buyerPerkAuth, setBuyerPerkAuth] = useState(false);
  const [buyerPerkSuitscore, setBuyerPerkSuitscore] = useState(false);
  const [authVoucher, setAuthVoucher] = useState<VoucherState>(INIT_VOUCHER);
  const [suitscoreVoucher, setSuitscoreVoucher] = useState<VoucherState>(INIT_VOUCHER);

  // Pre-fill voucher from URL param.
  useEffect(() => {
    if (!initialVoucherCode) return;

    async function prefill() {
      try {
        const res = await fetch("/api/vouchers/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: initialVoucherCode }),
        });
        const data = await res.json();
        if (!data.valid) return;

        const applied: VoucherState = {
          expanded: false,
          code: initialVoucherCode!,
          applying: false,
          applied: true,
          appliedCode: initialVoucherCode!,
          error: null,
        };

        if (data.type === "authentication" && !listingIsAuthenticated) {
          setBuyerPerkAuth(true);
          setAuthVoucher(applied);
        } else if (data.type === "verified_suitscore" && !listingSuitScoreVerified) {
          setBuyerPerkSuitscore(true);
          setSuitscoreVoucher(applied);
        }
      } catch {
        // Ignore — user can apply manually.
      }
    }

    prefill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Payment phase state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Offer buyer auth perk only if listing doesn't already have it
  const offerAuth = !listingIsAuthenticated;
  const offerSuitscore = !listingSuitScoreVerified;
  const hasAnyPerkToOffer = offerAuth || offerSuitscore;

  // Dynamic totals
  const buyerPerksFee =
    (buyerPerkAuth && !authVoucher.applied ? BUYER_PERK_AUTHENTICATION_FEE : 0) +
    (buyerPerkSuitscore && !suitscoreVoucher.applied ? BUYER_PERK_VERIFIED_SUITSCORE_FEE : 0);
  const total = listingPrice + shippingFee + buyerPerksFee;

  async function proceedToPayment() {
    setLoading(true);
    setInitError(null);

    try {
      const res = await fetch(`/api/listings/${listingId}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerPerkAuthentication: buyerPerkAuth,
          buyerPerkVerifiedSuitscore: buyerPerkSuitscore,
          buyerAuthVoucherCode: authVoucher.applied ? authVoucher.appliedCode : undefined,
          buyerSuitscoreVoucherCode: suitscoreVoucher.applied ? suitscoreVoucher.appliedCode : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setInitError(data.error ?? "Unable to start checkout.");
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setPhase("payment");
    } catch {
      setInitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Phase 1: perk selection ────────────────────────────────────────────────
  if (phase === "perks") {
    return (
      <div className="space-y-5">
        {/* Buyer add-ons */}
        {hasAnyPerkToOffer && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-3">
              Optional add-ons
            </p>
            <div className="space-y-3">
              {offerAuth && (
                <div className={`rounded-xl border-2 p-3.5 transition-colors ${buyerPerkAuth ? "border-[#00B4FF] bg-[#F0F9FF]" : "border-slate-100"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={buyerPerkAuth}
                      onChange={(e) => setBuyerPerkAuth(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#00B4FF]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#1A1A2E]">Add Brand Authentication</span>
                        <span className="text-xs font-bold text-[#00B4FF]">
                          {authVoucher.applied ? "Free" : `+${formatPrice(BUYER_PERK_AUTHENTICATION_FEE)}`}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        SuitCycle verifies authenticity — displayed as a badge on the listing.
                      </p>
                      {buyerPerkAuth && (
                        <div className="mt-2">
                          <VoucherInput
                            voucherType="authentication"
                            state={authVoucher}
                            setState={setAuthVoucher}
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )}

              {offerSuitscore && (
                <div className={`rounded-xl border-2 p-3.5 transition-colors ${buyerPerkSuitscore ? "border-[#00B4FF] bg-[#F0F9FF]" : "border-slate-100"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={buyerPerkSuitscore}
                      onChange={(e) => setBuyerPerkSuitscore(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#00B4FF]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#1A1A2E]">Add Verified SuitScore™</span>
                        <span className="text-xs font-bold text-[#00B4FF]">
                          {suitscoreVoucher.applied ? "Free" : `+${formatPrice(BUYER_PERK_VERIFIED_SUITSCORE_FEE)}`}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        We independently confirm the SuitScore™ grade — verified badge shown permanently.
                      </p>
                      {buyerPerkSuitscore && (
                        <div className="mt-2">
                          <VoucherInput
                            voucherType="verified_suitscore"
                            state={suitscoreVoucher}
                            setState={setSuitscoreVoucher}
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order total */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3.5 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Listing price</span>
            <span>{formatPrice(listingPrice)}</span>
          </div>
          {shippingFee > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
          )}
          {buyerPerksFee > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Add-ons</span>
              <span>+{formatPrice(buyerPerksFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[#1A1A2E] border-t border-slate-200 pt-1.5">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {initError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {initError}
          </div>
        )}

        <button
          type="button"
          onClick={proceedToPayment}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#00B4FF] text-white font-bold text-base hover:bg-[#0066AA] transition-colors shadow-lg shadow-[#00B4FF]/20 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Setting up payment…
            </>
          ) : (
            <>
              Continue to payment
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    );
  }

  // ── Phase 2: payment ───────────────────────────────────────────────────────
  if (!clientSecret || !orderId) {
    return (
      <div className="text-center py-8 text-sm text-[#64748B]">
        Something went wrong. Please go back and try again.
      </div>
    );
  }

  if (!stripePublishableKey) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Stripe is not configured. Set{" "}
        <code className="font-mono bg-amber-100 px-1 rounded">
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        </code>{" "}
        to enable payments.
      </div>
    );
  }

  const stripePromise = loadStripe(stripePublishableKey);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#00B4FF",
            colorBackground: "#ffffff",
            borderRadius: "12px",
            fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
          },
        },
      }}
    >
      <PayForm orderId={orderId} totalCents={total} />
    </Elements>
  );
}

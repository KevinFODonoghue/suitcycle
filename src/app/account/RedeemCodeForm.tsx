"use client";

import { useState } from "react";
import { Loader2, Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";

type Result =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "valid"; typeLabel: string; code: string };

export function RedeemCodeForm() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result>({ state: "idle" });

  async function check() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setResult({ state: "loading" });

    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No `type` — informational check only; validate will return whatever type it is.
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (data.valid) {
        setResult({ state: "valid", typeLabel: data.typeLabel as string, code: trimmed });
      } else {
        setResult({ state: "error", message: data.reason ?? "Invalid code." });
      }
    } catch {
      setResult({ state: "error", message: "Could not check code. Please try again." });
    }
  }

  function reset() {
    setCode("");
    setResult({ state: "idle" });
  }

  if (result.state === "valid") {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <Ticket size={16} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Valid code!</p>
              <p className="text-sm text-green-700 mt-0.5">
                This code grants <strong>{result.typeLabel}</strong>. Apply it when creating a listing
                or at checkout when buying a suit.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/sell?voucher=${encodeURIComponent(result.code)}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors"
          >
            Create a listing
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/listings"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-[#1A1A2E] hover:bg-slate-50 transition-colors"
          >
            Browse listings
            <ArrowRight size={14} />
          </Link>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-[#64748B] hover:underline"
        >
          Check a different code
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] font-mono tracking-wide uppercase placeholder:normal-case placeholder:tracking-normal"
          placeholder="e.g. SC-ABCD-EFGH"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (result.state === "error") setResult({ state: "idle" });
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          maxLength={12}
        />
        <button
          type="button"
          onClick={check}
          disabled={result.state === "loading" || !code.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0"
        >
          {result.state === "loading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            "Check code"
          )}
        </button>
      </div>

      {result.state === "error" && (
        <p className="text-sm text-red-600">{result.message}</p>
      )}
    </div>
  );
}

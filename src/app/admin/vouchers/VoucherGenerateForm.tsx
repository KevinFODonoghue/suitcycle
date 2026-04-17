"use client";

import { useState } from "react";
import { Loader2, Copy, CheckCheck } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "priority_listing",   label: "Priority Listing" },
  { value: "authentication",     label: "Brand Authentication" },
  { value: "verified_suitscore", label: "Verified SuitScore™" },
  { value: "membership_trial",   label: "Membership Trial" },
];

function inputClass() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] text-[#1A1A2E]";
}

export function VoucherGenerateForm() {
  const [type, setType] = useState("priority_listing");
  const [quantity, setQuantity] = useState("5");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 50) {
      setError("Quantity must be between 1 and 50.");
      return;
    }
    setLoading(true);
    setError(null);
    setGenerated([]);
    setCopied(false);

    try {
      const res = await fetch("/api/admin/vouchers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          quantity: qty,
          expiresAt: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed.");
        return;
      }
      setGenerated(data.codes as string[]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    await navigator.clipboard.writeText(generated.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] mb-4">
        Generate vouchers
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass()}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Quantity (1–50)</label>
          <input
            type="number"
            min="1"
            max="50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputClass()}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">Expires (optional)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
            className={inputClass()}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? "Generating…" : "Generate codes"}
      </button>

      {generated.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#1A1A2E]">
              {generated.length} code{generated.length !== 1 ? "s" : ""} generated
            </p>
            <button
              type="button"
              onClick={copyAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#00B4FF] hover:underline"
            >
              {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy all"}
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 max-h-48 overflow-y-auto">
            {generated.map((code) => (
              <div key={code} className="font-mono text-sm text-[#1A1A2E] py-0.5">
                {code}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#64748B]">
            Codes are in the database — distribute them as needed.
          </p>
        </div>
      )}
    </div>
  );
}

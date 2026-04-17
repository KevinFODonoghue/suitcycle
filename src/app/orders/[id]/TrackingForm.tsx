"use client";

import { useState } from "react";
import { Loader2, Truck } from "lucide-react";
import { saveTracking } from "./actions";

export function TrackingForm({ orderId }: { orderId: string }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await saveTracking(orderId, url);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSaved(true);
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
        <Truck size={15} />
        Tracking saved, the buyer can now track their shipment.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="url"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(null); }}
        placeholder="https://tools.usps.com/go/TrackConfirmAction..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] bg-white"
        required
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors disabled:opacity-70"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
        {loading ? "Saving…" : "Mark as shipped"}
      </button>
    </form>
  );
}

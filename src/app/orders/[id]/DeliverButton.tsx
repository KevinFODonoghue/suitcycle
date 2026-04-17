"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { confirmDelivery } from "./actions";

export function DeliverButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const result = await confirmDelivery(orderId);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
        <CheckCircle2 size={15} />
        Delivery confirmed, thanks!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-70"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
        {loading ? "Confirming…" : "Confirm delivery"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

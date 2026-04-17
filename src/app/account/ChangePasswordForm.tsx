"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update password.");
      } else {
        setSaved(true);
        setCurrent("");
        setNext("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">
          Current password
        </label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">
          New password
        </label>
        <div className="relative">
          <input
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
          />
          <button
            type="button"
            onClick={() => setShowNext((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {next.length > 0 && next.length < 8 && (
          <p className="text-xs text-red-500 mt-1">At least 8 characters required</p>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !current || next.length < 8}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : saved ? (
          <Check size={15} />
        ) : null}
        {saved ? "Password updated" : "Update password"}
      </button>
    </form>
  );
}

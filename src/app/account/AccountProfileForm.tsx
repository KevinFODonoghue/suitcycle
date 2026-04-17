"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

interface Props {
  initialData: {
    fullName: string;
    handle: string;
    bio: string;
  };
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-red-300 focus:ring-red-200 bg-red-50"
      : "border-slate-200 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] bg-white"
  }`;
}

export function AccountProfileForm({ initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          handle: form.handle.trim().toLowerCase(),
          bio: form.bio.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save profile.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
            Full name
          </label>
          <input
            className={inputClass()}
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
            Handle
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
            <input
              className={`${inputClass()} pl-8`}
              value={form.handle}
              onChange={(e) => set("handle", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="yourhandle"
              maxLength={30}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
          Bio <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          className={`${inputClass()} resize-none`}
          rows={3}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Tell buyers a little about yourself, your events, club, experience…"
          maxLength={300}
        />
        <p className="mt-1 text-xs text-slate-400 text-right">{form.bio.length}/300</p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle size={15} />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

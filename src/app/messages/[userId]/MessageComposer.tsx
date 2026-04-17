"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";

interface Props {
  toUserId: string;
  listingId: string | null;
}

export function MessageComposer({ toUserId, listingId }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  async function send() {
    const trimmed = body.trim();
    if (!trimmed || isPending) return;
    setError(null);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, body: trimmed }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to send message.");
      return;
    }

    setBody("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    startTransition(() => {
      router.refresh();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => { setBody(e.target.value); autoResize(); setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          maxLength={2000}
          disabled={isPending}
          className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] transition-colors bg-white disabled:opacity-60"
          style={{ minHeight: "42px" }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!body.trim() || isPending}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#00B4FF] text-white hover:bg-[#0066AA] transition-colors disabled:opacity-50"
          aria-label="Send message"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
      <p className="text-[10px] text-slate-400 text-right">{body.length}/2000</p>
    </div>
  );
}

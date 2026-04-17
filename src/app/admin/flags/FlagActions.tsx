"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

interface FlagActionsProps {
  flagId: string;
}

export function FlagActions({ flagId }: FlagActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function resolve() {
    const res = await fetch(`/api/admin/flags/${flagId}/resolve`, {
      method: "PATCH",
    });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  if (isPending) return <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />;

  return (
    <button
      onClick={resolve}
      className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
    >
      <CheckCircle size={13} />
      Resolve
    </button>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type ListingStatus = "draft" | "active" | "sold" | "archived";

interface ListingActionsProps {
  listingId: string;
  currentStatus: ListingStatus;
}

export function ListingActions({ listingId, currentStatus }: ListingActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function setStatus(newStatus: ListingStatus) {
    const res = await fetch(`/api/listings/${listingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  if (isPending) {
    return <Loader2 size={14} className="animate-spin text-slate-400" />;
  }

  if (currentStatus === "active") {
    return (
      <button
        onClick={() => setStatus("archived")}
        className="text-xs text-slate-500 hover:text-red-500 transition-colors font-medium"
      >
        Archive
      </button>
    );
  }

  if (currentStatus === "archived" || currentStatus === "draft") {
    return (
      <button
        onClick={() => setStatus("active")}
        className="text-xs text-[#00B4FF] hover:text-[#0066AA] transition-colors font-medium"
      >
        Activate
      </button>
    );
  }

  return null;
}

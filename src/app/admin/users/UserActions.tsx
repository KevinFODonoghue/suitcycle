"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface UserActionsProps {
  userId: string;
  currentStatus: "active" | "banned";
}

export function UserActions({ userId, currentStatus }: UserActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function toggleBan() {
    const newStatus = currentStatus === "active" ? "banned" : "active";
    const confirmed = confirm(
      newStatus === "banned"
        ? "Ban this user? They will no longer be able to sign in."
        : "Unban this user?"
    );
    if (!confirmed) return;

    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  if (isPending) return <Loader2 size={14} className="animate-spin text-slate-400" />;

  return (
    <button
      onClick={toggleBan}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
        currentStatus === "active"
          ? "text-red-500 hover:bg-red-50"
          : "text-green-600 hover:bg-green-50"
      }`}
    >
      {currentStatus === "active" ? "Ban" : "Unban"}
    </button>
  );
}

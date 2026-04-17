"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited: boolean;
}

export function FavoriteButton({ listingId, initialFavorited }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push("/login");
      return;
    }

    const next = !favorited;
    setFavorited(next);

    try {
      const res = await fetch(`/api/listings/${listingId}/favorite`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) setFavorited(!next); // revert on error
    } catch {
      setFavorited(!next);
    }

    startTransition(() => router.refresh());
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
        ${favorited
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-slate-400 hover:text-red-400 hover:bg-white"
        } shadow-sm backdrop-blur-sm`}
    >
      <Heart
        size={15}
        className="transition-transform hover:scale-110"
        fill={favorited ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}

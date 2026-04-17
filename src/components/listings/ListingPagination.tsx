"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ListingPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ListingPagination({ currentPage, totalPages }: ListingPaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
      <Link
        href={pageHref(currentPage - 1)}
        aria-disabled={currentPage === 1}
        className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
          currentPage === 1
            ? "pointer-events-none border-slate-100 text-slate-300"
            : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium border transition-colors ${
              p === currentPage
                ? "bg-[#00B4FF] text-white border-[#00B4FF]"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={pageHref(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none border-slate-100 text-slate-300"
            : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}

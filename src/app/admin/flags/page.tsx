import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Flag, ChevronRight } from "lucide-react";
import { FlagActions } from "./FlagActions";

export const metadata: Metadata = { title: "Admin, Flags" };

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminFlagsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") redirect("/");

  const { status: filterStatus, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const take = 25;
  const skip = (page - 1) * take;

  const where =
    filterStatus === "resolved"
      ? { status: "resolved" as const }
      : filterStatus === "all"
      ? {}
      : { status: "open" as const };

  const [flags, total] = await Promise.all([
    prisma.flag.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        userId: true,
        listingId: true,
        user: { select: { fullName: true, handle: true } },
        listing: { select: { brand: true, model: true } },
      },
    }),
    prisma.flag.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B4FF]/20 flex items-center justify-center">
              <Shield size={15} className="text-[#00B4FF]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Flags & Reports</h1>
              <p className="text-xs text-slate-400">{total.toLocaleString()} {filterStatus === "resolved" ? "resolved" : "open"}</p>
            </div>
          </div>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Admin
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { label: "Open", value: "" },
            { label: "Resolved", value: "resolved" },
            { label: "All", value: "all" },
          ].map(({ label, value }) => {
            const active = (filterStatus ?? "") === value;
            return (
              <Link
                key={value}
                href={`?${value ? `status=${value}` : ""}`}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#00B4FF] text-white"
                    : "bg-white border border-slate-200 text-[#64748B] hover:bg-slate-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {flags.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#64748B]">
              <Flag size={28} className="mx-auto mb-3 text-slate-300" />
              No {filterStatus === "resolved" ? "resolved" : "open"} flags.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {flags.map((flag) => (
                <div key={flag.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Flag size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E]">
                      {flag.listing
                        ? `Listing flagged: ${flag.listing.brand} ${flag.listing.model}`
                        : flag.user
                        ? `User flagged: @${flag.user.handle}`
                        : "Flag"}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{flag.reason}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400">
                        {new Date(flag.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {flag.listingId && (
                        <Link href={`/listings/${flag.listingId}`} className="text-[10px] text-[#00B4FF] hover:underline">
                          View listing →
                        </Link>
                      )}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        flag.status === "open" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                      }`}>
                        {flag.status.charAt(0).toUpperCase() + flag.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {flag.status === "open" && (
                    <FlagActions flagId={flag.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?${new URLSearchParams({ ...(filterStatus ? { status: filterStatus } : {}), page: String(page - 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 text-xs font-medium">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?${new URLSearchParams({ ...(filterStatus ? { status: filterStatus } : {}), page: String(page + 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 text-xs font-medium">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

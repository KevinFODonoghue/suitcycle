import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Ticket } from "lucide-react";
import type { VoucherType } from "@prisma/client";
import { VoucherGenerateForm } from "./VoucherGenerateForm";

export const metadata: Metadata = { title: "Admin, Vouchers" };

const TYPE_LABELS: Record<VoucherType, string> = {
  priority_listing:   "Priority Listing",
  authentication:     "Brand Authentication",
  verified_suitscore: "Verified SuitScore™",
  membership_trial:   "Membership Trial",
};

const TYPE_BADGE: Record<VoucherType, string> = {
  priority_listing:   "bg-violet-100 text-violet-700",
  authentication:     "bg-blue-100 text-blue-700",
  verified_suitscore: "bg-emerald-100 text-emerald-700",
  membership_trial:   "bg-amber-100 text-amber-700",
};

interface PageProps {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>;
}

function voucherStatus(v: { redeemedAt: Date | null; expiresAt: Date | null }): "redeemed" | "expired" | "unused" {
  if (v.redeemedAt) return "redeemed";
  if (v.expiresAt && v.expiresAt < new Date()) return "expired";
  return "unused";
}

const STATUS_BADGE: Record<string, string> = {
  unused:   "bg-green-100 text-green-700",
  redeemed: "bg-slate-100 text-slate-500",
  expired:  "bg-red-100 text-red-600",
};

export default async function AdminVouchersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") redirect("/");

  const { status: filterStatus, type: filterType, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const take = 50;
  const skip = (page - 1) * take;

  const validTypes: VoucherType[] = ["priority_listing", "authentication", "verified_suitscore", "membership_trial"];
  const validStatuses = ["unused", "redeemed", "expired"];

  // Build where clause — status filtering happens post-fetch since it's computed
  const typeWhere = filterType && validTypes.includes(filterType as VoucherType)
    ? { type: filterType as VoucherType }
    : {};

  const now = new Date();
  let statusWhere = {};
  if (filterStatus === "redeemed") {
    statusWhere = { redeemedAt: { not: null } };
  } else if (filterStatus === "expired") {
    statusWhere = { redeemedAt: null, expiresAt: { lt: now } };
  } else if (filterStatus === "unused") {
    statusWhere = {
      redeemedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    };
  }

  const where = { ...typeWhere, ...statusWhere };

  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        code: true,
        type: true,
        createdAt: true,
        expiresAt: true,
        redeemedAt: true,
        redeemedBy: { select: { fullName: true, handle: true } },
      },
    }),
    prisma.voucher.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B4FF]/20 flex items-center justify-center">
              <Ticket size={15} className="text-[#00B4FF]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Vouchers</h1>
              <p className="text-xs text-slate-400">{total.toLocaleString()} total</p>
            </div>
          </div>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Admin
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* Generate form */}
        <VoucherGenerateForm />

        {/* Filters */}
        <form method="GET" className="flex gap-3 flex-wrap">
          <select
            name="status"
            defaultValue={filterStatus ?? ""}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
          >
            <option value="">All statuses</option>
            {validStatuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={filterType ?? ""}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
          >
            <option value="">All types</option>
            {validTypes.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors"
          >
            Filter
          </button>
          {(filterStatus || filterType) && (
            <Link
              href="/admin/vouchers"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#64748B] hover:bg-slate-50 transition-colors"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {vouchers.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-[#64748B]">No vouchers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Created</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Expires</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Redeemed by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vouchers.map((v) => {
                    const status = voucherStatus(v);
                    return (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm font-semibold text-[#1A1A2E] tracking-wide">
                          {v.code}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[v.type]}`}>
                            {TYPE_LABELS[v.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">
                          {v.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">
                          {v.expiresAt
                            ? v.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[status]}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">
                          {v.redeemedBy ? (
                            <span>
                              {v.redeemedBy.fullName ?? `@${v.redeemedBy.handle}`}
                              {v.redeemedAt && (
                                <span className="block text-slate-400">
                                  {v.redeemedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({ ...(filterStatus ? { status: filterStatus } : {}), ...(filterType ? { type: filterType } : {}), page: String(page - 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 text-xs font-medium"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...(filterStatus ? { status: filterStatus } : {}), ...(filterType ? { type: filterType } : {}), page: String(page + 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 text-xs font-medium"
                >
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

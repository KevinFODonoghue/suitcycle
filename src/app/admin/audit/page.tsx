import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Activity } from "lucide-react";

export const metadata: Metadata = { title: "Admin, Audit Log" };

interface PageProps {
  searchParams: Promise<{ page?: string; action?: string }>;
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "admin") redirect("/");

  const { page: pageStr, action: actionFilter } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
  const take = 40;
  const skip = (page - 1) * take;

  const where = actionFilter ? { action: { contains: actionFilter, mode: "insensitive" as const } } : {};

  const [entries, total] = await Promise.all([
    prisma.audit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        meta: true,
        createdAt: true,
        actor: { select: { id: true, fullName: true, email: true } },
      },
    }),
    prisma.audit.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  const ACTION_COLOR: Record<string, string> = {
    ban: "bg-red-100 text-red-700",
    unban: "bg-green-100 text-green-700",
    resolve: "bg-blue-100 text-blue-700",
    flag: "bg-amber-100 text-amber-800",
    delete: "bg-red-100 text-red-700",
    create: "bg-emerald-100 text-emerald-700",
    update: "bg-slate-100 text-slate-700",
  };

  function actionBadgeClass(action: string): string {
    const key = Object.keys(ACTION_COLOR).find((k) => action.toLowerCase().includes(k));
    return key ? ACTION_COLOR[key]! : "bg-slate-100 text-slate-600";
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B4FF]/20 flex items-center justify-center">
              <Shield size={15} className="text-[#00B4FF]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Audit Log</h1>
              <p className="text-xs text-slate-400">{total.toLocaleString()} entries</p>
            </div>
          </div>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Admin
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Filter */}
        <form method="GET" className="flex items-center gap-3">
          <input
            name="action"
            defaultValue={actionFilter}
            placeholder="Filter by action…"
            className="w-full sm:max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors"
          >
            Filter
          </button>
          {actionFilter && (
            <Link href="/admin/audit" className="text-sm text-[#64748B] hover:text-[#1A1A2E]">
              Clear
            </Link>
          )}
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <Activity size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-[#64748B]">No audit entries found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {entries.map((entry) => {
                const meta = entry.meta as Record<string, unknown> | null;
                return (
                  <div key={entry.id} className="flex items-start gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${actionBadgeClass(entry.action)}`}>
                          {entry.action}
                        </span>
                        <span className="text-xs font-medium text-[#1A1A2E]">
                          {entry.entityType}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          #{entry.entityId.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">
                        by{" "}
                        <span className="font-medium text-[#1A1A2E]">
                          {entry.actor.fullName ?? entry.actor.email}
                        </span>
                      </p>
                      {meta && Object.keys(meta).length > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                          {JSON.stringify(meta)}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-xs text-slate-400">
                      {new Date(entry.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                );
              })}
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
                  href={`?${new URLSearchParams({ ...(actionFilter ? { action: actionFilter } : {}), page: String(page - 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 transition-colors text-xs font-medium"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...(actionFilter ? { action: actionFilter } : {}), page: String(page + 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#1A1A2E] hover:bg-slate-50 transition-colors text-xs font-medium"
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

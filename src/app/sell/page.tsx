import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SellForm } from "./SellForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Tech Suit",
  description: "List your pre-owned technical racing suit on SuitCycle. Takes less than 5 minutes.",
};

interface PageProps {
  searchParams: Promise<{ voucher?: string }>;
}

export default async function SellPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?next=/sell");

  const { voucher } = await searchParams;
  const initialVoucherCode = typeof voucher === "string" && voucher.trim() ? voucher.trim().toUpperCase() : undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] mb-1">List your tech suit</h1>
          <p className="text-[#64748B]">
            Takes less than 5 minutes. Your suit reaches thousands of competitive swimmers.
          </p>
        </div>
      </div>
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <SellForm initialVoucherCode={initialVoucherCode} />
      </div>
    </div>
  );
}

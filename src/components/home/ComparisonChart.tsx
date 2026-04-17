"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const rows = [
  {
    feature: "Tech suit-specific search filters",
    suitcycle: true,
    other: false,
    premium: false,
  },
  {
    feature: "Standardized condition grading",
    suitcycle: true,
    other: false,
    premium: false,
  },
  {
    feature: "Buyer protection",
    suitcycle: true,
    other: "partial",
    premium: false,
  },
  {
    feature: "Secure Stripe checkout",
    suitcycle: true,
    other: "partial",
    premium: false,
  },
  {
    feature: "Brand / size / stroke filtering",
    suitcycle: true,
    other: false,
    premium: false,
  },
  {
    feature: "Swimmer community & trust",
    suitcycle: true,
    other: false,
    premium: false,
  },
  {
    feature: "No general junk listings",
    suitcycle: true,
    other: false,
    premium: false,
  },
  {
    feature: "Suit authentication, SuitScore™ verification & priority listings",
    suitcycle: true,
    other: false,
    premium: true,
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <span className="w-7 h-7 rounded-full bg-[#22C55E]/15 flex items-center justify-center">
          <Check size={14} className="text-[#22C55E]" strokeWidth={3} />
        </span>
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex justify-center">
        <span className="w-7 h-7 rounded-full bg-[#F59E0B]/15 flex items-center justify-center">
          <Minus size={14} className="text-[#F59E0B]" strokeWidth={3} />
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className="w-7 h-7 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
        <X size={14} className="text-[#EF4444]" strokeWidth={3} />
      </span>
    </div>
  );
}

export function ComparisonChart() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E]">
            The SuitCycle advantage
          </h2>
          <p className="mt-4 text-[#64748B] max-w-xl mx-auto">
            Generic marketplaces weren&apos;t built for competitive swimmers. SuitCycle was.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
          style={{ display: "grid" }}
        >
          {/* Header */}
          <div
            className="grid bg-[#F0F7FF] border-b-2 border-slate-200"
            style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
          >
            <div className="p-3 sm:p-5" />
            <div className="p-3 sm:p-5 text-center border-l border-slate-200">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#00B4FF] mb-0.5 sm:mb-1">
                SuitCycle
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">Specialized</div>
            </div>
            <div className="p-3 sm:p-5 text-center border-l border-slate-200">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5 sm:mb-1">
                Other
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">General</div>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid border-b last:border-b-0 ${
                row.premium
                  ? "bg-[#FFFBEB] border-[#FDE68A]"
                  : i % 2 === 0
                  ? "bg-white border-slate-100"
                  : "bg-slate-50/50 border-slate-100"
              }`}
              style={{ gridTemplateColumns: "2fr 1fr 1fr" }}
            >
              <div className="p-3 sm:p-4 flex items-center gap-2 min-w-0">
                <span className="text-xs sm:text-sm text-[#1A1A2E] font-medium leading-snug break-words min-w-0">
                  {row.feature}
                </span>
                {row.premium && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide bg-[#F59E0B]/15 text-[#B45309]">
                    ✦ Perks
                  </span>
                )}
              </div>
              <div className="p-3 sm:p-4 flex items-center justify-center border-l border-slate-100">
                <Cell value={row.suitcycle} />
              </div>
              <div className="p-3 sm:p-4 flex items-center justify-center border-l border-slate-100">
                <Cell value={row.other} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-[#0A0F1A] relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0, 100, 200, 0.2) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00B4FF 1px, transparent 1px), linear-gradient(90deg, #00B4FF 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-4">
            Get started today
          </p>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Ready to swim new life
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #66D4FF 0%, #00B4FF 60%, #0066AA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              into tech suits?
            </span>
          </h2>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
            Join the only marketplace purpose-built for competitive swimwear. Browse suits that fit your event, or turn your retired gear into someone else&apos;s race day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#00B4FF] px-8 py-4 text-base font-semibold text-white hover:bg-[#0066AA] transition-colors shadow-lg shadow-[#00B4FF]/20 w-full sm:w-auto justify-center"
            >
              Browse tech suits
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sell"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
            >
              <Tag size={18} />
              List your suit
            </Link>
          </div>

          <p className="mt-8 text-xs text-slate-600">
            Free to join · Low seller fees · Stripe-secured payments
          </p>
        </motion.div>
      </div>
    </section>
  );
}

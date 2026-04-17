"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Award } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Buyer Protection",
    description:
      "Every purchase is covered. If your suit doesn't match the listing description, we work with you to resolve it, including full refunds when warranted.",
    color: "#22C55E",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "Payments are processed by Stripe and held in escrow until you confirm delivery. Your card details are never stored on our servers.",
    color: "#00B4FF",
  },
  {
    icon: Award,
    title: "SuitScore™ Standard",
    description:
      "Our 5-tier grading system gives every listing a standardized, honest condition rating. Sellers choose their tier using detailed criteria, no surprises.",
    color: "#EAB308",
  },
];

export function TrustSection() {
  return (
    <section className="py-24 bg-[#F0F7FF]">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
            Trust & safety
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E]">
            Buy with confidence
          </h2>
          <p className="mt-4 text-[#64748B] max-w-xl mx-auto">
            Every transaction is protected from payment to delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${pillar.color}18` }}
                >
                  <Icon size={28} style={{ color: pillar.color }} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-3">{pillar.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{pillar.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

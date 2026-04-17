"use client";

import { motion, type Variants } from "framer-motion";
import { Trophy, ShieldCheck, CreditCard, Users } from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Made for tech suits",
    description:
      "Not a generic marketplace. Every field, brand, size, gender fit, stroke suitability, SuitScore™, is purpose-built for competitive racing suits.",
    color: "#00B4FF",
    gradient: "from-[#00B4FF]/20 to-[#0044AA]/10",
  },
  {
    icon: Trophy,
    title: "SuitScore™ grading",
    description:
      "Our standardized 5-tier condition system gives buyers clear, consistent expectations. No guesswork from vague descriptions.",
    color: "#EAB308",
    gradient: "from-[#EAB308]/20 to-[#EAB308]/5",
    iconOverride: "⭐",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    description:
      "Stripe-powered checkout with buyer protection. Your payment is released to the seller only after you confirm your suit arrived as described.",
    color: "#6366F1",
    gradient: "from-[#6366F1]/20 to-[#6366F1]/5",
  },
  {
    icon: Users,
    title: "Swim community",
    description:
      "SuitCycle was made by swimmers, for swimmers. We believe one suit can make the difference, and no athlete should have to pay a small fortune for the competitive edge.",
    color: "#22C55E",
    gradient: "from-[#22C55E]/20 to-[#22C55E]/5",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function ValueProps() {
  return (
    <section className="py-24 bg-[#0A0F1A] relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0, 68, 170, 0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
            What sets us apart
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Built from the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #66D4FF, #00B4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              pool deck up
            </span>
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={itemVariants}
                className="glass-card rounded-2xl p-8 hover:border-white/20 transition-all group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${feat.color}1A` }}
                >
                  {feat.iconOverride ? (
                    <span className="text-2xl">{feat.iconOverride}</span>
                  ) : (
                    <Icon size={24} style={{ color: feat.color }} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-[#94A3B8] leading-relaxed text-sm">{feat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

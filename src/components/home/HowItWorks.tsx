"use client";

import { motion, type Variants } from "framer-motion";
import { Search, ShoppingBag, Waves, Tag, Truck, DollarSign } from "lucide-react";

const buyingSteps = [
  {
    icon: Search,
    step: "01",
    title: "Browse",
    description:
      "Search listings by brand, size, gender, and SuitScore™ tier. Every suit is graded using our standardized 5-tier system.",
    color: "#00B4FF",
  },
  {
    icon: ShoppingBag,
    step: "02",
    title: "Buy",
    description:
      "Secure checkout powered by Stripe. Payment is held safely until you confirm the suit matches the listing.",
    color: "#6366F1",
  },
  {
    icon: Waves,
    step: "03",
    title: "Race",
    description:
      "Your suit ships directly to you. Hit the water knowing exactly what performance level to expect.",
    color: "#22C55E",
  },
];

const sellingSteps = [
  {
    icon: Tag,
    step: "01",
    title: "List",
    description:
      "Photograph your suit, grade it using SuitScore™, set your price. The guided form takes under five minutes.",
    color: "#F59E0B",
  },
  {
    icon: Truck,
    step: "02",
    title: "Ship",
    description:
      "Once a buyer checks out, you'll get notified to ship. Package it up, we generate the label.",
    color: "#EC4899",
  },
  {
    icon: DollarSign,
    step: "03",
    title: "Earn",
    description:
      "Payment lands in your account once the buyer confirms delivery. No guesswork, no delays.",
    color: "#22C55E",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

function StepRow({ steps }: { steps: typeof buyingSteps }) {
  const ordered = steps;

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {ordered.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div key={step.step} variants={itemVariants} className="relative">
            {/* Connector line, horizontal on desktop, vertical on mobile/tablet */}
            {i < ordered.length - 1 && (
              <>
                <div className="hidden lg:block absolute top-12 left-[calc(100%+0px)] w-full h-px z-0">
                  <div className="w-full h-px border-t-2 border-dashed border-slate-200" />
                </div>
                <div className="block lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full h-6 z-0">
                  <div className="h-full border-l-2 border-dashed border-slate-200" />
                </div>
              </>
            )}

            <div className="relative z-10 rounded-2xl border border-slate-100 bg-[#F0F7FF] p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-xs font-bold tracking-widest text-slate-400 mb-4">
                STEP {step.step}
              </div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: `${step.color}18` }}
              >
                <Icon size={28} style={{ color: step.color }} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-3">{step.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E]">
            From closets to the blocks
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-0 lg:space-y-6">
          {/* Buying */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Buying
            </p>
            <StepRow steps={buyingSteps} />
          </div>

          {/* Selling */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Selling
            </p>
            <StepRow steps={sellingSteps} />
          </div>
        </div>
      </div>
    </section>
  );
}

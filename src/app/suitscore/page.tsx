import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Droplets, Zap, Tag, Trophy, Award, Flame, Shield, Dumbbell } from "lucide-react";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "SuitScore™ Grading Guide, SuitCycle",
  description:
    "The SuitCycle SuitScore™ system standardizes pre-owned tech suit condition into 5 tiers. Learn exactly what Gold, Podium, Prelim, Backup, and Practice mean before you buy or sell.",
};

const TIERS = [
  {
    id: "gold",
    label: "Gold",
    icon: Trophy,
    races: "0–2 races",
    performance: "100%",
    color: "#EAB308",
    bg: "#FEF9C3",
    border: "#EAB30840",
    textColor: "#854D0E",
    description:
      "A Gold suit is effectively race-new. It has been worn no more than twice and retains all its original compression, water repellency, and structural integrity. Indistinguishable in performance from a suit purchased off the shelf.",
    useCase:
      "Championship meets, taper races, or any swimmer who wants full-spec performance at a fraction of retail.",
    criteria: {
      label: [
        "Brand label fully visible, colors vivid, no fading or peeling",
        "Heat transfer graphics sharp with no lifting at edges",
        "Seams flat, no puckering or thread pulling",
      ],
      elasticity: [
        "Snaps back immediately when stretched, no hesitation or lag",
        "Compression uniform across the entire suit body",
        "No soft zones at hips, thighs, or torso panels",
      ],
      water: [
        "Water beads and rolls off instantly across all panels",
        "No absorption anywhere on the fabric surface",
        "Suit feels lightweight and non-waterlogged after immersion",
      ],
    },
  },
  {
    id: "podium",
    label: "Podium",
    icon: Award,
    races: "3–6 races",
    performance: "90%",
    color: "#6366F1",
    bg: "#EEF2FF",
    border: "#6366F140",
    textColor: "#3730A3",
    description:
      "A Podium suit has been raced a handful of times but retains most of its technical performance. Slight wear is visible on close inspection but compression and water repellency remain near their original levels.",
    useCase:
      "Regional championships, invitationals, big dual meets, any race where a meaningful performance advantage matters.",
    criteria: {
      label: [
        "Label slightly faded but all text remains readable",
        "Heat transfer edges may show very minor lifting at corners",
        "Seams intact with no thread pulls",
      ],
      elasticity: [
        "Returns to shape within 1–2 seconds when stretched",
        "Very slight softness detectable at seam intersections",
        "Compression feels firm throughout most of the suit",
      ],
      water: [
        "Water beads on 80–90% of the fabric surface",
        "Minor dull patches visible on close inspection",
        "Suit feels only slightly heavier than Gold after immersion",
      ],
    },
  },
  {
    id: "prelim",
    label: "Prelim",
    icon: Flame,
    races: "7–10 races",
    performance: "70–80%",
    color: "#22C55E",
    bg: "#DCFCE7",
    border: "#22C55E40",
    textColor: "#166534",
    description:
      "A Prelim suit has seen a full season or two of racing. It still provides a meaningful advantage over a practice suit, particularly in compression, but some performance has been lost. Great value for budget-conscious athletes.",
    useCase:
      "League championships, JO qualifiers, early-season invitationals, or a swimmer at their first big meet who wants a real tech suit without the Gold price tag.",
    criteria: {
      label: [
        "Label faded but still readable, brand and size identifiable",
        "Light peeling or edge lifting on heat transfer graphics",
        "Minor seam puckering at stress points (hip, shoulder, inner thigh)",
      ],
      elasticity: [
        "Takes 3–5 seconds to return to shape after stretching",
        "Moderate softness noticeable at hips and waistband",
        "Compression still present but reduced relative to Gold",
      ],
      water: [
        "Water beads on 50–75% of the surface",
        "Visible dull or saturated patches on panels",
        "Suit noticeably heavier than new after immersion",
      ],
    },
  },
  {
    id: "backup",
    label: "Backup",
    icon: Shield,
    races: "11–14 races",
    performance: "40–60%",
    color: "#F97316",
    bg: "#FFF7ED",
    border: "#F9731640",
    textColor: "#9A3412",
    description:
      "A Backup suit has been raced extensively and shows it. Compression is noticeably reduced and water repellency is significantly degraded. Still technically a tech suit, but the performance gap vs. a practice suit is narrower.",
    useCase:
      "Practice warm-ups, time trials where feel matters, relay leadoff suits, or a swimmer who needs any tech suit to qualify and has a tight budget.",
    criteria: {
      label: [
        "Label faded, possibly cracked or partially missing",
        "Heat transfer graphics cracked or large sections lifting",
        "Seam puckering visible at multiple stress points",
      ],
      elasticity: [
        "Slow return to shape, more than 5 seconds",
        "Noticeable looseness at waistband and thigh seams",
        "Compression feels significantly reduced throughout",
      ],
      water: [
        "Water beads on less than 50% of the fabric",
        "Large saturated patches across multiple panels",
        "Suit feels substantially heavier after even brief immersion",
      ],
    },
  },
  {
    id: "practice",
    label: "Practice",
    icon: Dumbbell,
    races: "15+ races",
    performance: "0–20%",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#EF444440",
    textColor: "#991B1B",
    description:
      "A Practice suit has been raced past the point of meaningful tech-suit performance. It may still fit like a tech suit but provides minimal compression or water repellency advantage over a standard training suit.",
    useCase:
      "Heavy practice sets in training, psychological confidence in a familiar suit, or a swimmer on a tight budget looking to experience the feel of a tech suit. Not recommended for competition.",
    criteria: {
      label: [
        "Label missing, completely illegible, or fully peeled",
        "Heat transfer graphics mostly or entirely gone",
        "Significant seam damage or thread pulling throughout",
      ],
      elasticity: [
        "Little to no snap-back when stretched",
        "Loose throughout with no meaningful compression feel",
        "Suit feels like a thicker training suit when worn",
      ],
      water: [
        "No water beading, fabric absorbs water immediately",
        "Suit soaks through entirely on first immersion",
        "Significantly heavier than a new suit when wet",
      ],
    },
  },
];

const criteriaIcons = [
  { key: "label" as const, icon: Tag, label: "Label & Logo" },
  { key: "elasticity" as const, icon: Zap, label: "Elasticity & Compression" },
  { key: "water" as const, icon: Droplets, label: "Water Repellency" },
];

export default function SuitScorePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0A0F1A] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, #003A6E 0%, #001A3A 45%, #0A0F1A 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EAB308]/40 bg-[#EAB308]/10 px-4 py-1.5 text-sm text-[#FDE68A] font-medium mb-6">
            <Trophy size={14} />
            SuitScore™ Official Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Know exactly what you&apos;re
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #66D4FF 0%, #00B4FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              buying or selling.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            SuitScore™ is SuitCycle&apos;s standardized condition grading system, five tiers defined by
            measurable criteria, not guesswork.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 block">
            <path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,15 1440,25 L1440,50 L0,50 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Tier overview strip */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <a
                  key={tier.id}
                  href={`#${tier.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: tier.color,
                    backgroundColor: tier.bg,
                    color: tier.textColor,
                  }}
                >
                  <Icon size={15} />
                  {tier.label}
                  <span className="opacity-70 text-xs font-normal">{tier.performance}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-14 bg-[#F0F7FF]">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-2">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-[#1A1A2E]">Grading methodology</h2>
          </div>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {criteriaIcons.map(({ icon: Icon, label, key }) => (
              <StaggerItem key={key} className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#E0F4FF] flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-[#00B4FF]" />
                </div>
                <p className="font-bold text-[#1A1A2E] text-sm">{label}</p>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {key === "label" && "Are the brand markings, graphics, and seams still clean and intact?"}
                  {key === "elasticity" && "Does the suit still snap back and hold compression when worn?"}
                  {key === "water" && "Does water still bead off the fabric, or does it soak through?"}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>
          <p className="text-center text-sm text-[#64748B] mt-6 max-w-lg mx-auto">
            Each of the five tiers is defined across all three categories. Sellers self-select the tier
            that best matches their suit, honesty is the foundation of the SuitCycle marketplace.
          </p>
          <p className="text-center text-sm text-[#64748B] mt-3 max-w-lg mx-auto">
            SuitScore™ applies equally to both age categories. 12 & Under suits are graded by the same
            physical criteria as 13 & Over suits — the only difference is that 12 & Under swimmers are
            not subject to FINA/World Aquatics approval requirements for competition.
          </p>
        </div>
      </section>

      {/* Tier detail cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          {TIERS.map((tier, i) => {
            const TierIcon = tier.icon;
            return (
              <FadeIn key={tier.id} delay={0}>
                <div
                  id={tier.id}
                  className="rounded-3xl border-2 overflow-hidden scroll-mt-24"
                  style={{ borderColor: tier.border }}
                >
                  {/* Tier header */}
                  <div
                    className="px-6 py-5 flex items-start gap-4"
                    style={{ backgroundColor: tier.bg }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${tier.color}30` }}
                    >
                      <TierIcon size={24} style={{ color: tier.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h2
                          className="text-2xl font-extrabold"
                          style={{ color: tier.textColor }}
                        >
                          {tier.label}
                        </h2>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${tier.color}25`, color: tier.textColor }}
                        >
                          {tier.races}
                        </span>
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: tier.color, color: "#fff" }}
                        >
                          {tier.performance} performance
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: tier.textColor }}>
                        {tier.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-2xl font-extrabold opacity-20 select-none hidden sm:block">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Criteria grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {criteriaIcons.map(({ icon: Icon, label, key }) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${tier.color}20` }}
                          >
                            <Icon size={14} style={{ color: tier.color }} />
                          </div>
                          <p className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wide">
                            {label}
                          </p>
                        </div>
                        <ul className="space-y-1.5">
                          {tier.criteria[key].map((criterion) => (
                            <li key={criterion} className="flex items-start gap-2 text-xs text-[#64748B] leading-relaxed">
                              <span
                                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                style={{ backgroundColor: tier.color }}
                              />
                              {criterion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Use case footer */}
                  <div className="px-6 pb-5">
                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100">
                      <p className="text-xs font-semibold text-[#1A1A2E] mb-0.5">Best for</p>
                      <p className="text-xs text-[#64748B] leading-relaxed">{tier.useCase}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Sources */}
      <section className="py-12 bg-[#F0F7FF] border-t border-slate-100">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-4 text-center">
            Sources & references
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              {
                org: "World Aquatics (FINA)",
                note: "Technical suit approval criteria and performance standards for competitive swimwear.",
              },
              {
                org: "FINIS, Inc.",
                note: "Published guidance on tech suit care, longevity, and compression retention over race cycles.",
              },
              {
                org: "USC Aquatics",
                note: "Coaching staff input on tech suit performance benchmarks from a Division I swim program.",
              },
            ].map(({ org, note }) => (
              <div key={org} className="bg-white rounded-2xl border border-slate-100 p-4">
                <p className="font-bold text-[#1A1A2E] text-sm mb-1">{org}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-5 max-w-lg mx-auto">
            SuitScore™ criteria are based on publicly available performance research and direct input from
            competitive swimmers and coaches. Tier descriptions are SuitCycle&apos;s own standardization.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-3">
            Ready to put it into practice?
          </h2>
          <p className="text-[#64748B] mb-7">
            Browse suits by SuitScore™ tier or list yours in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors"
            >
              Browse by tier <ArrowRight size={16} />
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#00B4FF] text-[#00B4FF] font-semibold hover:bg-[#F0F7FF] transition-colors"
            >
              <Tag size={18} />
              List your suit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Users, ShieldCheck, Waves, Tag } from "lucide-react";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "About SuitCycle",
  description:
    "SuitCycle was founded by a competitive swimmer who saw the gap between athletes who needed tech suits and those with suits collecting dust.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#0A0F1A] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, #003A6E 0%, #001A3A 40%, #0A0F1A 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00B4FF]/30 bg-[#00B4FF]/10 px-4 py-1.5 text-sm text-[#66D4FF] font-medium mb-8">
            <Heart size={14} className="text-[#00B4FF]" />
            Built by swimmers, for swimmers
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Swim new life into
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #66D4FF 0%, #00B4FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              tech suits
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            SuitCycle is the marketplace that connects athletes who need a competitive edge
            with those who have suits to spare.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 block">
            <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
                The vision
              </p>
              <h2 className="text-4xl font-bold text-[#1A1A2E] mb-6 leading-tight">
                Every swimmer deserves a shot at their fastest race
              </h2>
              <p className="text-[#64748B] leading-relaxed mb-4">
                A high-performance tech suit can cost $300–$600 new. For many athletes,
                especially younger swimmers, club teams on tight budgets, and families
                supporting multiple kids, that&apos;s simply out of reach.
              </p>
              <p className="text-[#64748B] leading-relaxed mb-4">
                Meanwhile, thousands of retired suits sit in gym bags and drawers, having
                raced just a handful of times, still holding most of their compression and
                water repellency. It&apos;s a mismatch that doesn&apos;t have to exist.
              </p>
              <p className="text-[#64748B] leading-relaxed font-medium">
                SuitCycle bridges that gap, so a Gold-tier suit that&apos;s seen two races
                can reach a swimmer who&apos;ll race it to the podium.
              </p>
            </FadeIn>
            <FadeIn direction="left" delay={0.1}>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-[#F0F7FF] flex items-center justify-center overflow-hidden">
                <Image
                  src="/BESTSSL_full_new.png"
                  alt="SuitCycle"
                  width={320}
                  height={320}
                  className="object-contain p-12 opacity-80"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#00B4FF] text-white rounded-2xl px-5 py-3 shadow-lg">
                <p className="text-2xl font-extrabold">$300+</p>
                <p className="text-xs text-blue-100">avg. savings vs. new</p>
              </div>
            </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* How It Started */}
      <section className="py-20 bg-[#F0F7FF]">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3 text-center">
            How it started
          </p>
          <h2 className="text-4xl font-bold text-[#1A1A2E] mb-10 text-center">
            A swimmer&apos;s idea
          </h2>

          <FadeIn>
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#00B4FF] flex items-center justify-center text-white font-extrabold text-lg shrink-0">
                K
              </div>
              <div>
                <p className="font-bold text-[#1A1A2E]">Kevin O&apos;Donoghue</p>
                <p className="text-sm text-[#64748B]">Founder · Illinois competitive swimmer</p>
              </div>
            </div>

            <blockquote className="text-[#1A1A2E] leading-relaxed space-y-4 text-lg">
              <p>
                &ldquo;Growing up swimming in Illinois, I was always aware of how many athletes didn&apos;t own a tech suit.
                Some couldn&apos;t justify the price, some were still convincing their parents, some just weren&apos;t sure
                they were &lsquo;serious enough&rsquo; to race in one yet.
              </p>
              <p>
                What struck me was the other side of that equation. So many retired swimmers had perfectly good suits
                sitting in a closet or stuffed in the bottom of a swim bag. A lot of the tech suits I knew about hadn&apos;t
                even been bought, just passed along by other swimmers. There was
                clearly no shortage of suits, just no good way to connect them with those who needed them.
              </p>
              <p>
                SuitCycle is the answer to that. There are too many great suits sitting unused in closets and swim bags,
                and too many athletes who deserve to race in one. This is about getting those suits back in the water,
                and making sure any swimmer, no matter their budget, age, or experience, can step up to the blocks
                feeling confident.&rdquo;
              </p>
            </blockquote>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
              Who we serve
            </p>
            <h2 className="text-4xl font-bold text-[#1A1A2E]">
              For every swimmer&apos;s season
            </h2>
          </div>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🏊",
                title: "Club swimmers",
                desc: "Junior and senior club athletes who race frequently and need a reliable suit without the full retail price.",
              },
              {
                icon: "🎓",
                title: "High school athletes",
                desc: "Swimmers at their first or final championship who deserve a tech suit that performs.",
              },
              {
                icon: "👨‍👩‍👧",
                title: "Parents & families",
                desc: "Families with multiple swimmers who need cost-effective solutions for each season.",
              },
              {
                icon: "🏅",
                title: "Masters swimmers",
                desc: "Adult competitive swimmers who want the edge of a tech suit at a price that makes sense.",
              },
            ].map((card) => (
              <StaggerItem key={card.title} className="rounded-2xl border border-slate-100 bg-[#F0F7FF] p-6 text-center">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-bold text-[#1A1A2E] mb-2">{card.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{card.desc}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* How SuitCycle Works */}
      <section className="py-20 bg-[#0A0F1A]">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
              How it works
            </p>
            <h2 className="text-4xl font-bold text-white">Simple. Transparent. Fair.</h2>
          </div>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buyer flow */}
            <StaggerItem className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#00B4FF]/20 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-[#00B4FF]" />
                </div>
                <h3 className="text-lg font-bold text-white">For buyers</h3>
              </div>
              <div className="space-y-4">
                {[
                  ["Search", "Filter by brand, size, gender, SuitScore™ tier, and stroke suitability."],
                  ["Trust the grade", "Every listing has a SuitScore™ tier so you know exactly what to expect before you buy."],
                  ["Checkout securely", "Pay with Stripe, your payment is held until you confirm the suit arrived as described."],
                  ["Race", "Your suit ships straight to you. Hit the water."],
                ].map(([step, desc], i) => (
                  <div key={step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00B4FF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{step}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </StaggerItem>

            {/* Seller flow */}
            <StaggerItem className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
                  <Tag size={20} className="text-[#22C55E]" />
                </div>
                <h3 className="text-lg font-bold text-white">For sellers</h3>
              </div>
              <div className="space-y-4">
                {[
                  ["List in 5 minutes", "Upload photos, select your SuitScore™ tier, set a price, and go live instantly."],
                  ["Reach the right buyers", "Swimmers searching by brand, size, and condition, not the general public."],
                  ["Get paid", "When the buyer confirms delivery, payment transfers to your Stripe account minus a 10% platform fee."],
                  ["Earn", "Turn a retired suit into cash that funds your next season."],
                ].map(([step, desc], i) => (
                  <div key={step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#22C55E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{step}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <Waves size={40} className="text-[#00B4FF] mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">
            Ready to swim new life into tech suits?
          </h2>
          <p className="text-[#64748B] mb-8">
            Join a community built on trust, honesty, and a shared love of competitive swimming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors"
            >
              Browse suits <ArrowRight size={16} />
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-[#00B4FF] text-[#00B4FF] font-semibold hover:bg-[#F0F7FF] transition-colors"
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

// Inline icons to avoid extra imports in a server component
function ShoppingCart({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function Tag({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

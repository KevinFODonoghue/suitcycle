import { Suspense } from "react";
import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import HelpClientContent from "./HelpClientContent";

export const metadata: Metadata = {
  title: "Help Center, SuitCycle",
  description:
    "Get answers about SuitScore™ grading, buyer protection, shipping, returns, and how SuitCycle works.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0A0F1A] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 100%, #003A6E 0%, #001A3A 50%, #0A0F1A 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00B4FF]/30 bg-[#00B4FF]/10 px-4 py-1.5 text-sm text-[#66D4FF] font-medium mb-6">
            <HelpCircle size={14} />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Everything you need to know about buying, selling, and grading suits on SuitCycle.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 block">
            <path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,15 1440,25 L1440,50 L0,50 Z" fill="white" />
          </svg>
        </div>
      </section>

      <Suspense fallback={null}>
        <HelpClientContent />
      </Suspense>
    </div>
  );
}

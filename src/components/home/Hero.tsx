"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0A0F1A] min-h-[92vh] flex items-center">
      {/* Base gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, #003A6E 0%, #001A3A 40%, #0A0F1A 100%)",
        }}
      />

      {/* Light rays, diagonal shafts of light filtering through water */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: "3%",  width: "16%", dur: 9,  delay: 0   },
          { left: "17%", width: "10%", dur: 12, delay: 1.8 },
          { left: "28%", width: "20%", dur: 8,  delay: 3.4 },
          { left: "48%", width: "13%", dur: 14, delay: 0.6 },
          { left: "62%", width: "18%", dur: 10, delay: 2.5 },
          { left: "79%", width: "12%", dur: 11, delay: 4.1 },
          { left: "88%", width: "22%", dur: 8,  delay: 1.2 },
        ].map((r, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: "-15%",
              left: r.left,
              width: r.width,
              height: "140%",
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(0,160,240,0.028) 18%, rgba(0,180,255,0.055) 42%, rgba(0,150,230,0.028) 72%, transparent 100%)",
              transform: "rotate(11deg)",
              transformOrigin: "top center",
              animation: `ray-pulse ${r.dur}s ease-in-out infinite alternate`,
              animationDelay: `${r.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { size: 6, left: "10%", delay: 0,   duration: 8    },
          { size: 4, left: "22%", delay: 1.5, duration: 10   },
          { size: 8, left: "38%", delay: 3,   duration: 12   },
          { size: 3, left: "55%", delay: 0.8, duration: 9    },
          { size: 5, left: "70%", delay: 2.2, duration: 11   },
          { size: 7, left: "83%", delay: 1,   duration: 13   },
          { size: 4, left: "92%", delay: 4,   duration: 8.5  },
        ].map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-[#00B4FF]/20"
            style={{
              width: b.size * 4,
              height: b.size * 4,
              left: b.left,
              bottom: "-60px",
              background: "rgba(0, 180, 255, 0.04)",
            }}
            animate={{ y: [0, -(600 + i * 80)], opacity: [0, 0.6, 0] }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Slogan */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Swim new life into tech suits.
          </p>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Your fastest suit{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #66D4FF 0%, #00B4FF 50%, #0066AA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              doesn&apos;t have to
              <br />
              be brand new.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            SuitCycle introduces a smarter way to buy and sell pre-owned technical
            racing suits with confidence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#00B4FF] px-8 py-4 text-base font-semibold text-white hover:bg-[#0066AA] transition-colors shadow-lg shadow-[#00B4FF]/20"
            >
              Browse tech suits
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Tag size={18} />
              List your suit
            </Link>
          </div>

          {/* Social proof chips */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-3 text-sm text-slate-500">
            <span>SuitScore™ grading on every listing</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-slate-500" />
            <span>Stripe-secured payments</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-slate-500" />
            <span>Built for competitive swimmers</span>
          </div>
        </motion.div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-16 block"
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="white"
          />
        </svg>
      </div>

      <style>{`
        @keyframes ray-pulse {
          0%   { opacity: 0.35; transform: rotate(11deg) scaleX(1);    }
          50%  { opacity: 1;    transform: rotate(11deg) scaleX(1.18); }
          100% { opacity: 0.45; transform: rotate(11deg) scaleX(0.88); }
        }
      `}</style>
    </section>
  );
}

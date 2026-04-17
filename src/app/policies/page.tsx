import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Truck, RotateCcw, Star, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Marketplace Policies, SuitCycle",
  description: "SuitCycle's buyer protection, shipping, returns, and conduct policies.",
};

const policies = [
  {
    icon: Shield,
    id: "buyer-protection",
    title: "Buyer Protection",
    color: "#22C55E",
    bg: "#F0FDF4",
    sections: [
      {
        heading: "What&rsquo;s covered",
        body: "Every purchase on SuitCycle is covered by Buyer Protection. If your suit doesn't arrive or is significantly not as described (wrong item, undisclosed damage, or materially different condition), you're eligible for a full refund.",
      },
      {
        heading: "How to open a dispute",
        body: "Open a dispute within 7 days of the expected delivery date from your order page. Provide photos and a clear description of the issue. SuitCycle will review within 3 business days.",
      },
      {
        heading: "What&rsquo;s not covered",
        body: "Buyer Protection does not cover buyer's remorse, minor cosmetic differences not affecting performance, or items that match their SuitScore™ grade description accurately. Off-platform transactions are not covered.",
      },
    ],
  },
  {
    icon: Truck,
    id: "shipping",
    title: "Shipping Policy",
    color: "#00B4FF",
    bg: "#F0F9FF",
    sections: [
      {
        heading: "Seller responsibilities",
        body: "Sellers must ship within 3 business days of payment confirmation. Suits must be packaged to prevent damage in transit. Sellers are responsible for providing valid tracking within the order timeline.",
      },
      {
        heading: "Shipping costs",
        body: "A flat shipping fee is added to the purchase price at checkout. This fee covers standard domestic shipping. Sellers choose their carrier; USPS, UPS, and FedEx are all accepted.",
      },
      {
        heading: "International shipping",
        body: "SuitCycle currently supports domestic US shipping only. International listings and transactions are not supported at this time.",
      },
      {
        heading: "Lost or damaged packages",
        body: "If a package is lost in transit, open a dispute and SuitCycle will work with you on a resolution. Sellers are encouraged to purchase shipping insurance for high-value suits.",
      },
    ],
  },
  {
    icon: RotateCcw,
    id: "returns",
    title: "Returns & Refunds",
    color: "#6366F1",
    bg: "#EEF2FF",
    sections: [
      {
        heading: "General policy",
        body: "All sales are final unless the item qualifies for Buyer Protection (not as described, not received). SuitCycle is a pre-owned marketplace, buyers should review the SuitScore™ grade and photos carefully before purchasing.",
      },
      {
        heading: "Seller-initiated returns",
        body: "Sellers may accept returns at their discretion. Any return agreement must be made through SuitCycle messaging so there is a record. Off-platform refunds are not facilitated by SuitCycle.",
      },
      {
        heading: "Refund timeline",
        body: "Approved refunds are processed within 5–10 business days. The refund is returned to the original payment method. Platform fees are non-refundable except in cases where the transaction is canceled before shipment.",
      },
    ],
  },
  {
    icon: Star,
    id: "suitscore",
    title: "SuitScore™ Grading Standards",
    color: "#EAB308",
    bg: "#FEFCE8",
    sections: [
      {
        heading: "Seller grading obligation",
        body: "Sellers must accurately grade their suit using the SuitScore™ system (Gold, Podium, Prelim, Backup, Practice). Deliberate misgrading is a violation of marketplace rules and may result in account suspension.",
      },
      {
        heading: "Dispute based on grading",
        body: "If a buyer believes a suit was materially misgraded (e.g., listed as Podium but condition is clearly Practice), they may dispute it. SuitCycle considers the published tier criteria when adjudicating grading disputes.",
      },
      {
        heading: "Verified SuitScore™",
        body: "Sellers can opt into SuitScore™ Verification, where a SuitCycle-certified reviewer independently grades the suit before it is listed. Verified listings display a verification badge.",
      },
    ],
  },
  {
    icon: AlertTriangle,
    id: "conduct",
    title: "Community Conduct",
    color: "#F97316",
    bg: "#FFF7ED",
    sections: [
      {
        heading: "Respect",
        body: "All users must communicate respectfully. Harassment, threats, hate speech, or discriminatory conduct of any kind will result in immediate account suspension.",
      },
      {
        heading: "Off-platform transactions",
        body: "Attempting to conduct transactions outside of SuitCycle to avoid platform fees is strictly prohibited and will result in a permanent ban. Buyers are not protected for off-platform transactions.",
      },
      {
        heading: "Reporting violations",
        body: "Use the in-app report button on any listing, review, or user to flag potential violations. Our moderation team reviews all reports within 2 business days.",
      },
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#0A0F1A] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, #003A6E 0%, #001A3A 40%, #0A0F1A 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-sm text-[#00B4FF] font-semibold uppercase tracking-widest mb-3">Policies</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            How SuitCycle works
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Clear rules for buyers and sellers, so every transaction is fair, safe, and transparent.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 block">
            <path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,15 1440,25 L1440,50 L0,50 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Quick nav */}
      <div className="bg-white border-b border-slate-100 sticky top-[64px] z-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {policies.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#00B4FF] transition-colors"
              >
                <p.icon size={14} />
                {p.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {policies.map((policy) => (
          <section key={policy.id} id={policy.id} className="scroll-mt-24">
            <div
              className="rounded-2xl p-6 mb-6 flex items-center gap-4"
              style={{ backgroundColor: policy.bg }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${policy.color}20` }}
              >
                <policy.icon size={22} style={{ color: policy.color }} />
              </div>
              <h2 className="text-2xl font-extrabold text-[#1A1A2E]">{policy.title}</h2>
            </div>

            <div className="space-y-6 pl-1">
              {policy.sections.map((s, i) => (
                <div key={i}>
                  <h3 className="text-base font-bold text-[#1A1A2E] mb-1.5"
                    dangerouslySetInnerHTML={{ __html: s.heading }}
                  />
                  <p className="text-[#374151] leading-relaxed text-sm">{s.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom links */}
      <div className="border-t border-slate-100 bg-[#F8FAFC]">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <p className="text-sm text-[#64748B] mb-4">
            Questions not answered here?
          </p>
          <Link
            href="/help"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors"
          >
            Visit the Help Center
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-[#64748B]">
            <Link href="/terms" className="hover:text-[#00B4FF] transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#00B4FF] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

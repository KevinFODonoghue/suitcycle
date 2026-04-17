"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ban,
  Mail,
  ChevronRight,
  Star,
  ChevronDown,
} from "lucide-react";

const sections = [
  {
    icon: Star,
    color: "#EAB308",
    bg: "#FEF9C3",
    id: "suitscore",
    title: "SuitScore™ Grading",
    summary:
      "Every listing uses our standardized 5-tier grading system so you always know what you're getting.",
    content: (
      <div className="space-y-3 text-sm text-[#64748B] leading-relaxed">
        <p>
          SuitScore™ is SuitCycle&apos;s proprietary grading system that standardizes how pre-owned
          tech suits are described. Instead of vague terms like &ldquo;good condition,&rdquo; every listing
          maps to one of five tiers: <strong className="text-[#1A1A2E]">Gold, Podium, Prelim, Backup,</strong> or{" "}
          <strong className="text-[#1A1A2E]">Practice</strong>.
        </p>
        <p>
          Each tier is defined by three measurable criteria: label/logo condition, elasticity and
          compression recovery, and water repellency. Sellers self-report their tier honestly, our
          community depends on it.
        </p>
        <Link
          href="/suitscore"
          className="inline-flex items-center gap-1.5 text-[#00B4FF] font-semibold hover:underline"
        >
          Read the full SuitScore™ guide <ArrowRight size={14} />
        </Link>
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    color: "#00B4FF",
    bg: "#E0F4FF",
    id: "buyer-protection",
    title: "Buyer Protection",
    summary:
      "Your payment is held securely until you confirm your suit arrived as described.",
    content: (
      <div className="space-y-3 text-sm text-[#64748B] leading-relaxed">
        <p>
          When you purchase a suit on SuitCycle, your payment is processed by Stripe and{" "}
          <strong className="text-[#1A1A2E]">held in escrow</strong>, the seller does not receive
          funds until you confirm delivery.
        </p>
        <p>
          If your suit arrives and doesn&apos;t match the listed SuitScore™ tier, you have{" "}
          <strong className="text-[#1A1A2E]">48 hours after delivery confirmation</strong> to open
          a dispute. We review photo evidence and will issue a full or partial refund if the
          listing was misrepresented.
        </p>
        <div className="bg-[#F0F7FF] rounded-xl p-4 space-y-2">
          <p className="font-semibold text-[#1A1A2E] text-xs uppercase tracking-wide">What&apos;s covered</p>
          <ul className="space-y-1.5">
            {[
              "Suit doesn't match listed SuitScore™ tier",
              "Item significantly different from photos",
              "Item not received within 14 days of tracking update",
              "Counterfeit or prohibited items",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">
          Disputes not opened within 48 hours of delivery result in automatic payment release to the seller.
          All sales are final once a dispute window closes.
        </p>
        <div className="bg-white border border-[#00B4FF]/30 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-[#1A1A2E] text-xs uppercase tracking-wide">How to open a dispute</p>
          <p>
            Go to our <strong className="text-[#1A1A2E]">Contact &amp; Support</strong> section below, select{" "}
            <strong className="text-[#1A1A2E]">&ldquo;Dispute&rdquo;</strong> as your reason, and include your order ID,
            a description of the issue, and photo evidence. Our team reviews within 3 business days.
          </p>
          <a
            href="#contact"
            onClick={() => { const el = document.getElementById("contact") as HTMLDetailsElement | null; if (el) el.open = true; }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00B4FF] hover:underline"
          >
            Open a dispute <ArrowRight size={12} />
          </a>
        </div>
      </div>
    ),
  },
  {
    icon: Truck,
    color: "#22C55E",
    bg: "#DCFCE7",
    id: "shipping",
    title: "Shipping",
    summary:
      "Sellers ship within 3 business days. Buyers track in real time.",
    content: (
      <div className="space-y-3 text-sm text-[#64748B] leading-relaxed">
        <p>
          Sellers are responsible for packaging and shipping purchased suits within{" "}
          <strong className="text-[#1A1A2E]">3 business days</strong> of order placement. A tracking
          number must be entered in the order dashboard.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "Recommended carriers",
              value: "USPS First Class, UPS Ground, FedEx Home Delivery",
            },
            {
              label: "Packaging",
              value: "Use a padded poly mailer or small box. Do not fold the suit tightly.",
            },
            {
              label: "Shipping cost",
              value: "Seller sets price; displayed at checkout. Typically $4–$9 for USPS First Class.",
            },
            {
              label: "International",
              value: "U.S. domestic only for now. International shipping coming soon.",
            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
              <p className="font-semibold text-[#1A1A2E] text-xs mb-1">{label}</p>
              <p className="text-xs leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
        <p>
          Buyers receive email notifications when a tracking number is added and when delivery is
          confirmed by the carrier.
        </p>
      </div>
    ),
  },
  {
    icon: RotateCcw,
    color: "#F97316",
    bg: "#FFF7ED",
    id: "returns",
    title: "Returns & Refunds",
    summary:
      "All sales are final, but disputes protect you if a listing is misrepresented.",
    content: (
      <div className="space-y-3 text-sm text-[#64748B] leading-relaxed">
        <p>
          SuitCycle does not support buyer-initiated returns after the dispute window closes. All
          sales are considered final once you confirm delivery or the 48-hour window expires.
        </p>
        <p>
          <strong className="text-[#1A1A2E]">Refunds are issued in these cases:</strong>
        </p>
        <ul className="space-y-1.5">
          {[
            "Successful dispute: suit doesn't match listed SuitScore™ tier",
            "Item not received: tracking shows no movement for 10+ days",
            "Seller cancels before shipping: full refund automatically issued",
            "Prohibited item identified: full refund + account action",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          Refunds are returned to your original payment method within 5–10 business days via Stripe.
        </p>
        <p>
          To submit a dispute, go to our <strong className="text-[#1A1A2E]">Contact &amp; Support</strong> section,
          select <strong className="text-[#1A1A2E]">&ldquo;Dispute&rdquo;</strong> as your reason, and include your
          order ID and photo evidence.{" "}
          <a
            href="#contact"
            onClick={() => { const el = document.getElementById("contact") as HTMLDetailsElement | null; if (el) el.open = true; }}
            className="text-[#00B4FF] font-semibold hover:underline"
          >
            Open a dispute →
          </a>
        </p>
      </div>
    ),
  },
  {
    icon: Ban,
    color: "#EF4444",
    bg: "#FEF2F2",
    id: "prohibited",
    title: "Prohibited Items",
    summary:
      "Only pre-owned tech suits in honest condition. No banned suits, replicas, or misrepresentation.",
    content: (
      <div className="space-y-3 text-sm text-[#64748B] leading-relaxed">
        <p>The following items may not be listed on SuitCycle:</p>
        <ul className="space-y-1.5">
          {[
            "Counterfeit or replica tech suits (e.g., fake Arena, Speedo, TYR)",
            "Suits that have been chemically treated or altered",
            "Suits listed under an incorrect SuitScore™ tier (misrepresentation)",
            "FINA/World Aquatics-banned suits from any era",
            "Non-swimwear items of any kind",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p>
          Violations result in immediate listing removal and may result in account suspension. If
          you spot a listing that violates these rules, use the &ldquo;Report&rdquo; button on any listing page.
        </p>
      </div>
    ),
  },
];

function openSection(id: string) {
  const el = document.getElementById(id) as HTMLDetailsElement | null;
  if (el) el.open = true;
}

export default function HelpClientContent() {
  const searchParams = useSearchParams();
  const preReason = searchParams.get("reason");
  const preOrderId = searchParams.get("orderId") ?? "";
  const defaultSubject = preReason === "dispute" ? "Dispute" : "";

  useEffect(() => {
    if (preReason === "dispute") {
      const el = document.getElementById("contact") as HTMLDetailsElement | null;
      if (el) {
        el.open = true;
        requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Quick nav */}
      <section className="bg-white border-b border-slate-100 sticky top-[64px] z-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => openSection(s.id)}
                className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#00B4FF] transition-colors"
              >
                <s.icon size={14} />
                {s.title}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => openSection("contact")}
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F0F7FF] hover:text-[#00B4FF] transition-colors"
            >
              <Mail size={14} />
              Contact
            </a>
          </div>
        </div>
      </section>

      {/* Sections, accordion */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-3">
          {sections.map((s, i) => (
            <details
              key={s.id}
              id={s.id}
              className="group rounded-2xl border border-slate-100 overflow-hidden scroll-mt-28 shadow-sm"
              open={i === 0}
            >
              <summary
                className="flex items-center gap-4 p-5 sm:p-6 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden"
                style={{ backgroundColor: s.bg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  <s.icon size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-[#1A1A2E]">{s.title}</h2>
                  <p className="text-sm text-[#64748B] mt-0.5 leading-snug">{s.summary}</p>
                </div>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="p-5 sm:p-6 bg-white border-t border-slate-100">{s.content}</div>
            </details>
          ))}

          {/* Contact form */}
          <details
            id="contact"
            className="group rounded-2xl border border-slate-100 overflow-hidden scroll-mt-28 shadow-sm"
          >
            <summary className="flex items-center gap-4 p-5 sm:p-6 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden bg-[#F0F7FF]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#00B4FF]">
                <Mail size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[#1A1A2E]">Contact & Support</h2>
                <p className="text-sm text-[#64748B] mt-0.5 leading-snug">
                  Can&apos;t find what you&apos;re looking for? We typically respond within 24 hours.
                </p>
              </div>
              <ChevronDown
                size={18}
                className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="p-5 sm:p-6 bg-white border-t border-slate-100">
              <ContactForm defaultSubject={defaultSubject} defaultOrderId={preOrderId} />
            </div>
          </details>
        </div>
      </section>

      {/* SuitScore CTA */}
      <section className="py-14 bg-[#F0F7FF]">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00B4FF] mb-3">
            Still have questions?
          </p>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-4">
            Read the full SuitScore™ guide
          </h2>
          <p className="text-[#64748B] mb-6 max-w-lg mx-auto">
            Detailed criteria for every tier, grading methodology, and what to expect at each
            performance level, written for buyers and sellers alike.
          </p>
          <Link
            href="/suitscore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00B4FF] text-white font-semibold hover:bg-[#0066AA] transition-colors"
          >
            Open SuitScore™ Guide <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

function ContactForm({
  defaultSubject = "",
  defaultOrderId = "",
}: {
  defaultSubject?: string;
  defaultOrderId?: string;
}) {
  const [subject, setSubject] = useState(defaultSubject);
  const isDispute = subject === "Dispute";

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-[#1A1A2E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-colors";

  return (
    <form
      action="mailto:support@suitcycle.shop"
      method="GET"
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5" htmlFor="help-name">
            Name
          </label>
          <input
            id="help-name"
            name="name"
            type="text"
            placeholder="Your name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5" htmlFor="help-email">
            Email
          </label>
          <input
            id="help-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5" htmlFor="help-subject">
          Reason
        </label>
        <select
          id="help-subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="">Select a reason…</option>
          <option value="Dispute">Dispute</option>
          <option value="Order not received">Order not received</option>
          <option value="SuitScore™ grading question">SuitScore™ grading question</option>
          <option value="Account or login issue">Account or login issue</option>
          <option value="Listing removed">Listing removed</option>
          <option value="Payment or refund">Payment or refund</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {isDispute && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5" htmlFor="help-order-id">
              Order ID <span className="text-red-500">*</span>
            </label>
            <input
              id="help-order-id"
              name="orderId"
              type="text"
              defaultValue={defaultOrderId}
              placeholder="Your 8-character order ID"
              required
              className={inputClass}
            />
          </div>
          <p className="text-xs text-amber-800">
            <strong>Photo evidence required.</strong> Please attach photos showing the issue to the email that opens. At least one photo is required for dispute review.
          </p>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5" htmlFor="help-message">
          {isDispute ? "Describe the issue" : "Message"}
        </label>
        <textarea
          id="help-message"
          name="body"
          rows={5}
          placeholder={
            isDispute
              ? "Describe how the suit differs from the listing (SuitScore tier, photos, condition). Include your order ID if not filled above."
              : "Describe your issue or question in detail…"
          }
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-slate-500">
          Or email us at{" "}
          <a href="mailto:support@suitcycle.shop" className="text-[#00B4FF] hover:underline">
            support@suitcycle.shop
          </a>
        </p>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors"
        >
          {isDispute ? "Submit dispute" : "Send message"} <ArrowRight size={14} />
        </button>
      </div>
    </form>
  );
}

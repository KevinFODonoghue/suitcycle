import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { getArticle, getTopicById, HELP_ARTICLES } from "@/lib/help/articles";

interface PageProps {
  params: Promise<{ topic: string; slug: string }>;
}

export async function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ topic: a.topicId, slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic, slug } = await params;
  const article = getArticle(topic, slug);
  if (!article) return {};
  return {
    title: `${article.title}, SuitCycle Help`,
    description: article.summary,
  };
}

const ARTICLE_BODY: Record<string, React.ReactNode> = {
  "returns-refund-policy": (
    <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
      <p>SuitCycle operates on an <strong className="text-[#1A1A2E]">all sales final</strong> policy by default. However, buyer protection covers you when a listing is misrepresented.</p>
      <h3 className="font-bold text-[#1A1A2E]">When refunds are issued</h3>
      <ul className="space-y-2">
        {["Suit doesn't match the listed SuitScore™ tier — open a dispute within 48 hours of delivery confirmation.", "Item not received — if tracking shows no movement for 10+ business days, open a dispute.", "Seller cancels before shipping — a full refund is issued automatically.", "Prohibited or counterfeit item identified — full refund and account action taken."].map((item) => (
          <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] mt-1.5 shrink-0" />{item}</li>
        ))}
      </ul>
      <p>Refunds are returned to your original payment method within 5–10 business days via Stripe.</p>
      <div className="bg-[#F0F7FF] border border-[#00B4FF]/30 rounded-xl p-4 space-y-2">
        <p className="font-semibold text-[#1A1A2E] text-xs uppercase tracking-wide">How to open a dispute</p>
        <p>Go to our <strong className="text-[#1A1A2E]">Contact page</strong>, select <strong className="text-[#1A1A2E]">&ldquo;Dispute&rdquo;</strong> as your reason, and include your order ID, a description of the issue, and photo evidence. Our team reviews disputes within 3 business days.</p>
        <Link
          href="/help?reason=dispute#contact"
          className="inline-flex items-center gap-1 text-[#00B4FF] font-semibold hover:underline"
        >
          Open a dispute →
        </Link>
      </div>
    </div>
  ),
  "shipping-policy": (
    <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
      <p>Sellers must ship within <strong className="text-[#1A1A2E]">3 business days</strong> of order placement and enter a valid tracking number in the order dashboard.</p>
      <h3 className="font-bold text-[#1A1A2E]">Carrier guidelines</h3>
      <ul className="space-y-2">
        {["Use USPS First Class, UPS Ground, or FedEx Home Delivery.", "Package in a padded poly mailer or small box, do not fold the suit tightly.", "Domestic U.S. shipping only at this time.", "Typical cost: $4–$9 via USPS First Class."].map((item) => (
          <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] mt-1.5 shrink-0" />{item}</li>
        ))}
      </ul>
      <p>Buyers receive notifications when tracking is added and when delivery is confirmed by the carrier.</p>
    </div>
  ),
  "buyer-protection-policy": (
    <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
      <p>When you purchase on SuitCycle, your payment is processed by Stripe and <strong className="text-[#1A1A2E]">held in escrow</strong>, the seller does not receive funds until you confirm delivery.</p>
      <h3 className="font-bold text-[#1A1A2E]">What&apos;s covered</h3>
      <ul className="space-y-2">
        {["Suit doesn't match the listed SuitScore™ tier.", "Item significantly different from listing photos.", "Item not received: tracking shows no movement for 10+ days.", "Counterfeit or prohibited items."].map((item) => (
          <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] mt-1.5 shrink-0" />{item}</li>
        ))}
      </ul>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-semibold text-amber-800 text-xs mb-1">Important deadline</p>
        <p className="text-amber-700 text-xs">You must open a dispute within <strong>48 hours of confirming delivery</strong>. After that, payment is automatically released to the seller and the sale is final.</p>
      </div>
      <div className="bg-[#F0F7FF] border border-[#00B4FF]/30 rounded-xl p-4 space-y-3">
        <p className="font-semibold text-[#1A1A2E] text-xs uppercase tracking-wide">How to open a dispute</p>
        <p>Navigate to our <strong className="text-[#1A1A2E]">Contact page</strong>, select <strong className="text-[#1A1A2E]">&ldquo;Dispute&rdquo;</strong> as your reason, and include:</p>
        <ul className="space-y-1.5">
          {["Your order ID", "A description of the issue", "Photo evidence showing the discrepancy"].map((item) => (
            <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] mt-1.5 shrink-0" />{item}</li>
          ))}
        </ul>
        <p className="text-xs text-[#64748B]">Our team reviews all disputes within 3 business days and issues refunds for valid claims.</p>
        <Link
          href="/help?reason=dispute#contact"
          className="inline-flex items-center gap-1 text-[#00B4FF] font-semibold hover:underline"
        >
          Open a dispute →
        </Link>
      </div>
    </div>
  ),
  "seller-guidelines": (
    <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
      <p>Every seller on SuitCycle agrees to the following standards when creating a listing.</p>
      <ul className="space-y-2">
        {["Grade your suit honestly using the SuitScore™ system. Misrepresentation results in disputes and account action.", "Provide clear, accurate photos that match the suit's actual condition.", "Ship within 3 business days and provide a valid tracking number.", "Only list pre-owned tech suits, no new with tags, non-swimwear, or counterfeit items.", "Respond promptly to buyer questions via messages."].map((item) => (
          <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00B4FF] mt-1.5 shrink-0" />{item}</li>
        ))}
      </ul>
      <p>Repeated violations or failed disputes may result in listing removal or account suspension.</p>
    </div>
  ),
  "prohibited-items-and-content": (
    <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
      <p>The following may not be listed on SuitCycle under any circumstances:</p>
      <ul className="space-y-2">
        {["Counterfeit or replica tech suits.", "Suits that have been chemically treated or structurally altered.", "Suits listed under an inaccurate SuitScore™ tier.", "FINA/World Aquatics-banned suits.", "Suits with missing or illegible brand labels listed above Backup tier.", "Non-swimwear items.", "New suits with retail tags, SuitCycle is pre-owned only."].map((item) => (
          <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />{item}</li>
        ))}
      </ul>
      <p>Use the &quot;Report&quot; button on any listing to flag suspected violations.</p>
    </div>
  ),
  "how-to-buy-on-suitcycle": (
    <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
      <ol className="space-y-3 list-none">
        {[
          ["Browse listings", "Use filters to narrow by brand, size, SuitScore™ tier, gender fit, stroke suitability, and price."],
          ["Review the listing", "Check photos carefully, read the SuitScore™ tier explanation, and message the seller if you have questions."],
          ["Checkout", "Payment is processed securely by Stripe. Your funds are held in escrow until delivery."],
          ["Receive your suit", "Confirm delivery in your order dashboard. You have 48 hours to open a dispute if something is wrong."],
          ["Leave a review", "After confirming delivery, you can leave a seller review to help the community."],
        ].map(([title, desc], i) => (
          <li key={title} className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#00B4FF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            <div><p className="font-semibold text-[#1A1A2E]">{title}</p><p>{desc}</p></div>
          </li>
        ))}
      </ol>
    </div>
  ),
  "how-to-sell-on-suitcycle": (
    <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
      <ol className="space-y-3 list-none">
        {[
          ["Create an account", "Sign up and connect your Stripe account under Account → Settings to receive payouts."],
          ["List your suit", "Go to Sell, upload photos, fill in brand/model/size, select your SuitScore™ tier, and set your price."],
          ["Wait for a buyer", "Your listing is visible to all buyers. You'll be notified when a purchase is made."],
          ["Ship within 3 days", "Package your suit carefully, ship with tracking, and enter the tracking URL in your order dashboard."],
          ["Get paid", "Once the buyer confirms delivery, funds are released to your Stripe account (minus the 10% platform fee)."],
        ].map(([title, desc], i) => (
          <li key={title} className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#00B4FF] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            <div><p className="font-semibold text-[#1A1A2E]">{title}</p><p>{desc}</p></div>
          </li>
        ))}
      </ol>
    </div>
  ),
  "suitscore-grading-guide": (
    <div className="space-y-4 text-sm text-[#64748B] leading-relaxed">
      <p>SuitScore™ is SuitCycle&apos;s standardized 5-tier grading system so every listing means the same thing to every buyer.</p>
      {[
        { tier: "Gold", emoji: "🥇", desc: "Near-new condition. Worn 1–3 times, full compression, pristine labels." },
        { tier: "Podium", emoji: "🏅", desc: "Light use, excellent compression, minor signs of wear." },
        { tier: "Prelim", emoji: "🎽", desc: "Moderate use, good compression, visible but not distracting wear." },
        { tier: "Backup", emoji: "🔄", desc: "Heavy use, reduced compression. Functional but past peak performance." },
        { tier: "Practice", emoji: "💦", desc: "Training/practice use only. Significant wear, low compression." },
      ].map(({ tier, emoji, desc }) => (
        <div key={tier} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
          <span className="text-xl">{emoji}</span>
          <div><p className="font-bold text-[#1A1A2E]">{tier}</p><p className="text-xs">{desc}</p></div>
        </div>
      ))}
      <Link href="/suitscore" className="inline-flex items-center gap-1 text-[#00B4FF] font-semibold hover:underline">
        Read the full SuitScore™ guide →
      </Link>
    </div>
  ),
};

const FAQ_ANSWERS: Record<string, string> = {
  "order-never-arrives": "If your order shows no tracking movement for 10+ business days after the expected delivery window, open a dispute through our Contact page. Select \"Dispute\" as your reason, include your order ID and a description of the situation. SuitCycle will investigate and issue a refund if the item is confirmed lost.",
  "return-doesnt-fit": "SuitCycle does not support buyer-initiated returns for fit issues, all sales are final after the dispute window closes. We strongly recommend messaging the seller before purchase if you have sizing questions.",
  "seller-ship-deadline": "Sellers have 3 business days from the time of purchase to ship and enter a tracking number. If a seller fails to ship within this window, you may cancel the order for a full refund.",
  "fake-or-altered-suit": "Counterfeit or altered suits are strictly prohibited. If you receive one, open a dispute within 48 hours of delivery. Go to our Contact page, select \"Dispute\" as your reason, and include your order ID and photo evidence of the counterfeit or alteration. SuitCycle will issue a full refund and take action on the seller's account.",
  "buyer-protection-refund": "To qualify, open a dispute within 48 hours of confirming delivery. Go to our Contact page, select \"Dispute\" as your reason, and include your order ID, a description of the discrepancy, and clear photo evidence of the suit versus what was listed. SuitCycle reviews all disputes within 3 business days and issues refunds for valid claims.",
  "sell-damaged-suit": "You may sell a heavily worn suit, just grade it honestly at the Backup or Practice tier. Misrepresenting a damaged suit as a higher tier is a policy violation.",
  "create-account-agreement": "By creating a SuitCycle account, you agree to our Terms of Service and Privacy Policy. This includes marketplace conduct rules, payment terms, and our dispute resolution process.",
  "protect-personal-information": "SuitCycle stores only the data necessary to operate the marketplace. Payment details are handled entirely by Stripe, we never store card numbers. See our Privacy Policy for full details.",
  "share-information-anyone-else": "We do not sell your personal data. We share minimal data with service providers (Stripe for payments, Supabase for storage) only as needed to operate the platform.",
  "delete-account-and-data": "You can request account deletion by contacting support@suitcycle.shop. We will delete your personal data within 30 days, except where retention is required by law.",
  "violates-terms-of-service": "Violations are handled case-by-case. Minor violations result in a warning; repeated or severe violations result in listing removal or permanent account ban.",
  "terms-of-service": "Our full Terms of Service are available at /terms.",
  "privacy-policy": "Our full Privacy Policy is available at /privacy.",
  "suitscore-accuracy": "Sellers self-report their SuitScore™ tier. SuitCycle cannot verify every listing, but our dispute system protects you, if the suit doesn't match its listed tier, you can dispute within 48 hours of delivery.",
  "contact-seller-before-buying": "Yes, use the Message button on any listing page to ask the seller questions before purchasing.",
  "after-selling-guide": "After a sale, package the suit carefully, ship within 3 business days, and enter the tracking URL in your order dashboard. Once the buyer confirms delivery, your payout is released.",
  "payout-after-selling": "Payouts are released to your connected Stripe account within 2–5 business days after the buyer confirms delivery or the 48-hour dispute window closes.",
  "improve-chances-of-selling": "Use clear, well-lit photos. Write an accurate, detailed description. Price competitively, check similar listings. Respond quickly to buyer messages.",
  "suitscore-levels-meaning": "The 5 SuitScore™ tiers (Gold, Podium, Prelim, Backup, Practice) represent the suit's condition based on label/logo integrity, elasticity & compression, and water repellency. See the full guide at /suitscore.",
};

export default async function HelpArticlePage({ params }: PageProps) {
  const { topic: topicId, slug } = await params;
  const article = getArticle(topicId, slug);
  if (!article) notFound();

  const topic = getTopicById(topicId);
  const body = ARTICLE_BODY[slug];
  const faqAnswer = FAQ_ANSWERS[slug];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0A0F1A] border-b border-white/10">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/help" className="hover:text-white transition-colors">Help</Link>
            <span>/</span>
            <Link href={`/help/${topicId}`} className="hover:text-white transition-colors">
              {topic?.name ?? topicId}
            </Link>
            <span>/</span>
            <span className="text-white truncate">{article.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Article header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00B4FF] mb-2">
            {article.sectionTitle}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] leading-tight mb-3">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-[#64748B] text-base leading-relaxed">{article.summary}</p>
          )}
        </div>

        {/* Article body */}
        {body ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">{body}</div>
        ) : faqAnswer ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-sm text-[#64748B] leading-relaxed">{faqAnswer}</p>
            {slug === "terms-of-service" && (
              <Link href="/terms" className="mt-3 inline-block text-sm font-semibold text-[#00B4FF] hover:underline">
                View Terms of Service →
              </Link>
            )}
            {slug === "privacy-policy" && (
              <Link href="/privacy" className="mt-3 inline-block text-sm font-semibold text-[#00B4FF] hover:underline">
                View Privacy Policy →
              </Link>
            )}
            {["order-never-arrives", "fake-or-altered-suit", "buyer-protection-refund"].includes(slug) && (
              <div className="mt-4 bg-[#F0F7FF] border border-[#00B4FF]/30 rounded-xl p-4">
                <p className="font-semibold text-[#1A1A2E] text-xs mb-2">Ready to open a dispute?</p>
                <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                  Go to our Contact page, select <strong className="text-[#1A1A2E]">&ldquo;Dispute&rdquo;</strong> as your reason, and include your order ID, a description, and photo evidence. We&apos;ll review within 3 business days.
                </p>
                <Link
                  href="/help?reason=dispute#contact"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#00B4FF] text-white text-xs font-semibold hover:bg-[#0066AA] transition-colors"
                >
                  Open a Dispute →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-100 p-6 text-center">
            <p className="text-sm text-[#64748B] mb-3">
              For detailed guidance on this topic, visit the main Help Center or contact our support team.
            </p>
            <Link href="/help" className="inline-flex items-center gap-2 text-sm font-semibold text-[#00B4FF] hover:underline">
              Go to Help Center
            </Link>
          </div>
        )}

        {/* Contact CTA */}
        <div className="bg-[#F0F7FF] rounded-2xl p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00B4FF] flex items-center justify-center shrink-0">
            <Mail size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1A1A2E] text-sm">Still have questions?</p>
            <p className="text-xs text-[#64748B] mt-0.5">We typically respond within 24 hours.</p>
          </div>
          <a
            href="mailto:support@suitcycle.shop"
            className="shrink-0 px-4 py-2 rounded-xl bg-[#00B4FF] text-white text-sm font-semibold hover:bg-[#0066AA] transition-colors"
          >
            Contact us
          </a>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/help/${topicId}`} className="flex items-center gap-1.5 text-[#64748B] hover:text-[#1A1A2E] transition-colors">
            <ArrowLeft size={14} />
            Back to {topic?.name}
          </Link>
        </div>
      </div>
    </div>
  );
}

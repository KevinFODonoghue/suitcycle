import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service, SuitCycle",
  description: "The terms that govern your use of SuitCycle, the peer-to-peer marketplace for pre-owned technical racing swimsuits.",
};

const EFFECTIVE_DATE = "April 15, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm text-[#00B4FF] font-semibold uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#64748B] mb-12">Effective {EFFECTIVE_DATE}</p>

        <div className="prose prose-slate max-w-none space-y-10 text-[#374151] leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using SuitCycle (&ldquo;the Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. We may update these terms at any time; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">2. What SuitCycle Is</h2>
            <p>
              SuitCycle is a peer-to-peer marketplace that facilitates transactions between individual buyers and sellers of pre-owned technical racing swimsuits. SuitCycle is not a party to any transaction between users and does not take title to any item sold on the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">3. Eligibility</h2>
            <p>
              You must be at least 13 years old (or the minimum age of digital consent in your jurisdiction) to use SuitCycle. If you are under 18, a parent or guardian must review and consent to these terms on your behalf. Users located in jurisdictions where access is prohibited are not eligible to use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">4. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate, current information and to promptly update it if it changes. We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">5. Listing Rules</h2>
            <p>Sellers agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Only list items they own and have the right to sell.</li>
              <li>Accurately describe the condition of each suit using the SuitScore™ grading system.</li>
              <li>Provide clear, unedited photos that truthfully represent the item.</li>
              <li>Not list counterfeit, stolen, or unauthorized goods.</li>
              <li>Complete all transactions for accepted offers in good faith.</li>
            </ul>
            <p className="mt-3">
              SuitCycle may remove any listing at its sole discretion and may suspend accounts that repeatedly violate listing rules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">6. Fees</h2>
            <p>
              SuitCycle charges sellers a platform fee of 10% of the final sale price. This fee is deducted automatically from the seller&rsquo;s payout via Stripe Connect. Listing a suit is free. Additional optional services (priority listing, authentication, SuitScore verification) may carry separate fees as disclosed at the point of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">7. Payments</h2>
            <p>
              All payments are processed through Stripe. Buyers are charged at checkout; funds are held and disbursed to sellers after delivery is confirmed. SuitCycle does not store payment card details. By using the Platform, you agree to Stripe&rsquo;s{" "}
              <a href="https://stripe.com/legal/ssa" target="_blank" rel="noopener noreferrer" className="text-[#00B4FF] hover:underline">
                Terms of Service
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">8. Buyer Protection</h2>
            <p>
              If a purchased item does not arrive within a reasonable timeframe or materially differs from its listing, buyers may open a dispute within 7 days of the expected delivery date. SuitCycle will review disputes and, where warranted, issue a refund. Decisions made by SuitCycle in dispute resolution are final.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">9. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Circumvent or attempt to circumvent Platform fees by transacting off-platform.</li>
              <li>Harass, threaten, or abuse other users.</li>
              <li>Use the Platform for any illegal purpose.</li>
              <li>Scrape, copy, or redistribute Platform content without written permission.</li>
              <li>Interfere with the operation or security of the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">10. Intellectual Property</h2>
            <p>
              All content on the Platform, including the SuitScore™ grading system, branding, and design, is the property of SuitCycle or its licensors. You retain ownership of photos and descriptions you upload but grant SuitCycle a non-exclusive, worldwide, royalty-free license to display and distribute them in connection with the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">11. Disclaimer of Warranties</h2>
            <p>
              The Platform is provided &ldquo;as is&rdquo; without warranty of any kind. SuitCycle does not warrant that the Platform will be uninterrupted or error-free, nor does it warrant the accuracy or completeness of any listing content. You use the Platform at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SuitCycle shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including disputes between buyers and sellers. Our total liability for any claim shall not exceed the amount of fees paid by you to SuitCycle in the preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">13. Governing Law</h2>
            <p>
              These terms shall be governed by the laws of the State of Texas, without regard to conflict-of-law principles. Any disputes shall be resolved exclusively in the state or federal courts located in Austin, Texas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">14. Contact</h2>
            <p>
              Questions about these terms? Contact us at{" "}
              <a href="mailto:support@suitcycle.shop" className="text-[#00B4FF] hover:underline">
                support@suitcycle.shop
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-[#64748B]">
          <Link href="/privacy" className="hover:text-[#00B4FF] transition-colors">Privacy Policy</Link>
          <Link href="/policies" className="hover:text-[#00B4FF] transition-colors">Marketplace Policies</Link>
          <Link href="/help" className="hover:text-[#00B4FF] transition-colors">Help Center</Link>
        </div>
      </div>
    </div>
  );
}

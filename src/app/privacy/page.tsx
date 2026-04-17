import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy, SuitCycle",
  description: "How SuitCycle collects, uses, and protects your personal information.",
};

const EFFECTIVE_DATE = "April 15, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm text-[#00B4FF] font-semibold uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#64748B] mb-12">Effective {EFFECTIVE_DATE}</p>

        <div className="space-y-10 text-[#374151] leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Account data</strong>: name, email address, handle, and profile photo.</li>
              <li><strong>Listing data</strong>: photos, descriptions, pricing, and condition grades you upload.</li>
              <li><strong>Address data</strong>: shipping and returns addresses you add for checkout.</li>
              <li><strong>Messages</strong>: communications you send to other users through the Platform.</li>
            </ul>
            <p className="mt-3 mb-3">We also collect information automatically:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Usage data</strong>: pages visited, search queries, clicks, and session duration via Google Analytics.</li>
              <li><strong>Device data</strong>: browser type, OS, and IP address for security and fraud prevention.</li>
            </ul>
            <p className="mt-3">
              Payment information (card numbers, bank details) is collected and processed directly by Stripe. SuitCycle never stores raw payment credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>To operate and improve the Platform.</li>
              <li>To facilitate transactions between buyers and sellers.</li>
              <li>To verify seller identities and process payouts via Stripe Connect.</li>
              <li>To send transactional emails (order confirmations, shipping updates, dispute notifications).</li>
              <li>To enforce our Terms of Service and prevent fraud or abuse.</li>
              <li>To analyze usage patterns and improve user experience.</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">3. Information Sharing</h2>
            <p className="mb-3">We share your information only as necessary:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>With your transaction counterparty</strong>: when a sale occurs, the buyer receives the seller's name and shipping details, and the seller receives the buyer's name.</li>
              <li><strong>With Stripe</strong>: for payment processing and seller payouts. Stripe is a data controller for payment data under its own privacy policy.</li>
              <li><strong>With Supabase</strong>: for database and file storage hosting.</li>
              <li><strong>With Resend</strong>: for transactional email delivery.</li>
              <li><strong>With Sentry</strong>: for error monitoring (anonymized where possible).</li>
              <li><strong>With Google Analytics</strong>: for anonymized usage analytics.</li>
              <li><strong>As required by law</strong>: in response to valid legal process or to protect the rights and safety of users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">4. Data Retention</h2>
            <p>
              We retain account data for as long as your account is active. Transactional data (orders, messages, audit logs) is retained for 7 years to comply with financial record-keeping requirements. You may request deletion of your account and associated non-transactional data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">5. Cookies</h2>
            <p>
              SuitCycle uses essential cookies for authentication (session tokens) and optional analytics cookies (Google Analytics). You can disable analytics cookies via your browser settings or a browser extension. Essential cookies cannot be disabled without breaking core functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">6. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Access a copy of the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to or restrict certain processing.</li>
              <li>Data portability (where applicable).</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, email{" "}
              <a href="mailto:privacy@suitcycle.shop" className="text-[#00B4FF] hover:underline">
                privacy@suitcycle.shop
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">7. Children&rsquo;s Privacy</h2>
            <p>
              SuitCycle is not directed at children under 13. We do not knowingly collect personal data from children under 13 without verifiable parental consent. If you believe we have inadvertently collected such data, contact us immediately and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">8. Security</h2>
            <p>
              We implement industry-standard security measures including TLS encryption, hashed passwords (bcrypt), and role-based access controls. No system is perfectly secure; we encourage you to use a strong, unique password and to report any suspected security issues to{" "}
              <a href="mailto:security@suitcycle.shop" className="text-[#00B4FF] hover:underline">
                security@suitcycle.shop
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of material changes via email or an in-app notice. Your continued use of the Platform after the effective date of a revised policy constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">10. Contact</h2>
            <p>
              Questions about your privacy? Email us at{" "}
              <a href="mailto:privacy@suitcycle.shop" className="text-[#00B4FF] hover:underline">
                privacy@suitcycle.shop
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-[#64748B]">
          <Link href="/terms" className="hover:text-[#00B4FF] transition-colors">Terms of Service</Link>
          <Link href="/policies" className="hover:text-[#00B4FF] transition-colors">Marketplace Policies</Link>
          <Link href="/help" className="hover:text-[#00B4FF] transition-colors">Help Center</Link>
        </div>
      </div>
    </div>
  );
}

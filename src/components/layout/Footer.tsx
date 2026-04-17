import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/listings", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/suitscore", label: "SuitScore Guide" },
];

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/policies", label: "Policies" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--brand-bg-dark,#0A0F1A)] text-white mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/">
              <Image
                src="/images/logos/suitcyclelogo3.png"
                alt="SuitCycle"
                width={200}
                height={50}
                className="h-10 w-auto object-contain brightness-0 invert"
                placeholder="empty"
              />
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Swim new life into tech suits.
            </p>
            {/* Social links placeholder */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-400">Follow us:</span>
              <a
                href="#"
                aria-label="Instagram"
                className="text-slate-400 hover:text-[var(--brand-primary,#00B4FF)] transition-colors text-xs"
              >
                Instagram
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="text-slate-400 hover:text-[var(--brand-primary,#00B4FF)] transition-colors text-xs"
              >
                TikTok
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-slate-400 hover:text-[var(--brand-primary,#00B4FF)] transition-colors text-xs"
              >
                Twitter/X
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-[var(--brand-primary,#00B4FF)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
              Legal
            </h3>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-[var(--brand-primary,#00B4FF)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 SuitCycle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

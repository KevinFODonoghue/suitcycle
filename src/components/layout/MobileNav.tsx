"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, Tag } from "lucide-react";

const navLinks = [
  { href: "/listings", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
];

interface MobileNavProps {
  isLoggedIn: boolean;
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  // Close when the filters drawer opens; fire an event when this drawer opens
  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener("mobilefilters:open", handler);
    return () => window.removeEventListener("mobilefilters:open", handler);
  }, []);

  const openNav = () => {
    window.dispatchEvent(new CustomEvent("mobilenav:open"));
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={openNav}
        aria-label="Open menu"
        className="lg:hidden p-2 rounded-lg text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[300] h-full w-72 bg-[var(--background)] shadow-2xl transform transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <Link href="/" onClick={() => setOpen(false)}>
            <Image
              src="/images/logos/suitcyclelogo3.png"
              alt="SuitCycle"
              width={140}
              height={35}
              className="h-8 w-auto object-contain"
              placeholder="empty"
            />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-[var(--accent)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-lg text-[var(--foreground)] font-medium hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <>
              <Link
                href="/messages"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-[var(--foreground)] font-medium hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
              >
                Messages
              </Link>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-[var(--foreground)] font-medium hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
              >
                My Account
              </Link>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/listings"
                  onClick={() => setOpen(false)}
                  className="group inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-[#00B4FF] text-white hover:bg-[#0066AA] transition-colors"
                >
                  Browse tech suits
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/sell"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                >
                  <Tag size={15} />
                  List your suit
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-center font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-center font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

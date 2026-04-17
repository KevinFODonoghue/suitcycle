"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { User, MessageCircle, ArrowRight, Tag } from "lucide-react";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/listings", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLoggedIn = !!session?.user;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 bg-white dark:bg-[#0A0F1A] ${
        scrolled
          ? "shadow-[0_2px_16px_rgba(0,0,0,0.08)] border-b border-transparent"
          : "border-b border-[var(--border)]"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/logos/suitcyclelogo3.png"
            alt="SuitCycle"
            width={200}
            height={50}
            className="h-9 w-auto object-contain"
            priority
            placeholder="empty"
          />
        </Link>

        {/* Nav links — anchored left, immediately after logo */}
        <nav className="hidden lg:flex items-center gap-1 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: CTAs + account / auth */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          {isLoggedIn ? (
            <div className="flex items-center gap-1">
              <Link
                href="/messages"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                aria-label="Messages"
              >
                <MessageCircle size={16} />
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <User size={16} />
                <span>Account</span>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
          {isLoggedIn && (
            <>
              <div className="w-px h-5 bg-[var(--border)] mx-1" />
              <Link
                href="/listings"
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#00B4FF] text-white hover:bg-[#0066AA] transition-colors shadow-sm shadow-[#00B4FF]/20"
              >
                Browse suits
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/sell"
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <Tag size={14} />
                List your suit
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger — pushed to the right on small screens */}
        <div className="lg:hidden ml-auto">
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}

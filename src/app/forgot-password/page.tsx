"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate a brief delay before showing the confirmation
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/BESTSSL_full_new.png"
              alt="SuitCycle"
              width={120}
              height={120}
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mx-auto mb-4">
                  <Mail size={22} className="text-[#00B4FF]" />
                </div>
                <h1 className="text-xl font-bold text-[#1A1A2E]">Reset your password</h1>
                <p className="text-sm text-[#64748B] mt-2">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Send reset link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <CheckCircle size={40} className="text-[#00B4FF] mx-auto mb-4" />
              <h2 className="text-lg font-bold text-[#1A1A2E] mb-2">Check your inbox</h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                If an account exists for <strong className="text-[#1A1A2E]">{email}</strong>,
                you&apos;ll receive a password reset link shortly. Check your spam folder if you
                don&apos;t see it within a few minutes.
              </p>
              <p className="text-xs text-slate-400 mt-4">
                Didn&apos;t get it?{" "}
                <a
                  href="mailto:support@suitcycle.shop"
                  className="text-[#00B4FF] hover:underline"
                >
                  Contact support
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A1A2E] transition-colors"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

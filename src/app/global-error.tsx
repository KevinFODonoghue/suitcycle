"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="brand-surface flex min-h-screen items-center px-4 py-12 text-foreground">
        <div className="glass-elevated mx-auto w-full max-w-3xl rounded-[32px] border border-transparent bg-card/95 p-6 shadow-soft md:p-12">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="space-y-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">Unexpected error</p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                We logged the issue so the SuitCycle team can investigate. You can retry the action or head back home.
              </p>
              {error.digest ? (
                <p className="text-xs font-medium text-muted-foreground/80">Reference ID: {error.digest}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 md:justify-self-end">
              <button
                type="button"
                onClick={() => reset()}
                className="glass-button rounded-full border border-transparent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition"
              >
                Try again
              </button>
              <Link
                href="/"
                className="glass-button rounded-full border border-transparent px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide !text-white shadow-card transition"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

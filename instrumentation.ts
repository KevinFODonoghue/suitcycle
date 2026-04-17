import * as Sentry from "@sentry/nextjs";

export function register(): void {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn?.length) {
    return;
  }

  const tracesSampleRate =
    Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) || 0.1;

  Sentry.init({
    dsn,
    tracesSampleRate,
  });
}

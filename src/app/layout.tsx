import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SiteShell } from "@/components/layout/SiteShell";
import { AppToaster } from "@/components/ui/app-toaster";
import { ThemeChrome } from "@/components/layout/ThemeChrome";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SuitCycle, Buy & Sell Pre-Owned Tech Suits",
    template: "%s | SuitCycle",
  },
  description:
    "Your fastest suit doesn't have to be brand new. SuitCycle is the peer-to-peer marketplace for buying and selling pre-owned technical racing swimsuits with confidence.",
  keywords: ["tech suit", "racing swimsuit", "competitive swimming", "buy tech suit", "sell tech suit"],
  metadataBase: new URL("https://suitcycle.shop"),
  openGraph: {
    type: "website",
    siteName: "SuitCycle",
    title: "SuitCycle, Buy & Sell Pre-Owned Tech Suits",
    description: "Your fastest suit doesn't have to be brand new.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {gaMeasurementId ? (
          <link rel="preconnect" href="https://www.google-analytics.com" />
        ) : null}
        <meta name="theme-color" content="#00B4FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/BESTSSL_new.png" type="image/png" />
        <link rel="apple-touch-icon" href="/BESTSSL_new.png" />
      </head>
      <body className={`${jakarta.variable} brand-surface`}>
        <Providers>
          <ThemeChrome />
          <SiteShell>{children}</SiteShell>
          <AppToaster />
        </Providers>
        {gaMeasurementId ? (
          <GoogleAnalytics measurementId={gaMeasurementId} />
        ) : null}
      </body>
    </html>
  );
}

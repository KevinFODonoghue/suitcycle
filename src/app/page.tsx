import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ValueProps } from "@/components/home/ValueProps";
import { ComparisonChart } from "@/components/home/ComparisonChart";
import { TrustSection } from "@/components/home/TrustSection";
import { FAQ } from "@/components/home/FAQ";
import { CTASection } from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ValueProps />
      <ComparisonChart />
      <TrustSection />
      <FAQ />
      <CTASection />
    </>
  );
}

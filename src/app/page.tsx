import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AudienceSection from "@/components/landing/AudienceSection";
import PricingSectionLanding from "@/components/landing/PricingSectionLanding";
import ComparisonSection from "@/components/landing/ComparisonSection";
import ComplianceInfoSection from "@/components/landing/ComplianceInfoSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <AudienceSection />
      <PricingSectionLanding />
      <ComparisonSection />
      <ComplianceInfoSection />
    </>
  );
}

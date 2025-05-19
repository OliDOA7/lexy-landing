
'use client';

// Removed useState, useEffect related to splash screen
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AudienceSection from "@/components/landing/AudienceSection";
import PricingSectionLanding from "@/components/landing/PricingSectionLanding";
import ComparisonSection from "@/components/landing/ComparisonSection";
import ComplianceInfoSection from "@/components/landing/ComplianceInfoSection";
// Removed VideoSplashScreen import

export default function Home() {
  // Removed showSplash and isClient state and useEffect

  // Removed handleVideoEnd function

  // Removed conditional rendering logic for splash screen

  return (
    <>
      {/* Directly render landing page sections */}
      <HeroSection />
      <FeaturesSection />
      <AudienceSection />
      <PricingSectionLanding />
      <ComparisonSection />
      <ComplianceInfoSection />
    </>
  );
}


'use client';

import { useState, useEffect } from 'react';
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AudienceSection from "@/components/landing/AudienceSection";
import PricingSectionLanding from "@/components/landing/PricingSectionLanding";
import ComparisonSection from "@/components/landing/ComparisonSection";
import ComplianceInfoSection from "@/components/landing/ComplianceInfoSection";
import VideoSplashScreen from '@/components/layout/VideoSplashScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs once after the component mounts, indicating client-side execution.
    setIsClient(true);
  }, []);

  const handleVideoEnd = () => {
    setShowSplash(false);
  };

  if (!isClient) {
    // Render nothing on the server or during the very first client render pass
    // to prevent hydration issues with the video splash screen.
    // This also ensures the video only attempts to load and play on the client.
    return null; 
  }

  return (
    <>
      {showSplash && isClient && ( // Ensure isClient is true before rendering splash
        <VideoSplashScreen
          videoSrc="/assets/video/lexy-dark-vid.mp4"
          onVideoEnd={handleVideoEnd}
        />
      )}
      {!showSplash && (
        <>
          <HeroSection />
          <FeaturesSection />
          <AudienceSection />
          <PricingSectionLanding />
          <ComparisonSection />
          <ComplianceInfoSection />
        </>
      )}
    </>
  );
}

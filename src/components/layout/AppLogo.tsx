
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const AppLogo = () => {
  // Default to 'dark' as per layout.tsx. This will be updated client-side.
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check the actual theme class on the html element
    const currentIsDark = document.documentElement.classList.contains('dark');
    setEffectiveTheme(currentIsDark ? 'dark' : 'light');

    // Optional: If you have a theme switcher that modifies the class,
    // you might want to observe changes to documentElement's class attribute.
    // For now, this runs once on mount.
  }, []);

  // Dimensions based on the previous SVG's viewBox to maintain aspect ratio
  const logoWidth = 145;
  const logoHeight = 50;

  return (
    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
      {isClient ? ( // Only render theme-specific logo on client after check
        effectiveTheme === 'dark' ? (
          <Image
            src="/assets/images/lexy-logo-white.png"
            alt="Lexy AI Transcription - Powered by How2 Studio (Dark Mode)"
            width={logoWidth}
            height={logoHeight}
            priority 
          />
        ) : (
          <Image
            src="/assets/images/lexy-logo-black.png"
            alt="Lexy AI Transcription - Powered by How2 Studio (Light Mode)"
            width={logoWidth}
            height={logoHeight}
            priority
          />
        )
      ) : (
        // Fallback for SSR: Render the dark mode logo by default to match server-rendered HTML class.
        // This helps prevent hydration mismatches.
        <Image
            src="/assets/images/lexy-logo-white.png"
            alt="Lexy AI Transcription - Powered by How2 Studio"
            width={logoWidth}
            height={logoHeight}
            priority
        />
      )}
    </Link>
  );
};

export default AppLogo;


"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface StaticLogoImageProps {
  width: number;
  height: number;
  className?: string;
}

const StaticLogoImage = ({ width, height, className }: StaticLogoImageProps) => {
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentIsDark = document.documentElement.classList.contains('dark');
    setEffectiveTheme(currentIsDark ? 'dark' : 'light');

    // Optional: Observe theme changes if a theme switcher is implemented
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newIsDark = (mutation.target as HTMLElement).classList.contains('dark');
          setEffectiveTheme(newIsDark ? 'dark' : 'light');
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  if (!isClient) {
    // SSR Fallback or initial render before client-side check
    // Render the dark mode logo by default to match server-rendered HTML class.
    return (
      <div className={cn("inline-block", className)} style={{ width: `${width}px`, height: `${height}px` }}>
        <Image
          src="/assets/images/lexy-logo-white.png"
          alt="Lexy AI Transcription Logo"
          width={width}
          height={height}
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div className={cn("inline-block", className)} style={{ width: `${width}px`, height: `${height}px` }}>
      {effectiveTheme === 'dark' ? (
        <Image
          src="/assets/images/lexy-logo-white.png"
          alt="Lexy AI Transcription Logo (Dark Mode)"
          width={width}
          height={height}
          priority
          style={{ objectFit: 'contain' }}
        />
      ) : (
        <Image
          src="/assets/images/lexy-logo-black.png"
          alt="Lexy AI Transcription Logo (Light Mode)"
          width={width}
          height={height}
          priority
          style={{ objectFit: 'contain' }}
        />
      )}
    </div>
  );
};

export default StaticLogoImage;

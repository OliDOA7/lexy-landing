
"use client";

import Link from 'next/link';
import AppLogo from './AppLogo';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <AppLogo />
        <nav className="flex items-center space-x-4">
          {/* Navigation links for a landing page can be added here if needed */}
          {/* For example:
          <Button variant="ghost" asChild>
            <Link href="/#features">Features</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/#pricing">Pricing</Link>
          </Button>
          <Button asChild>
            <Link href="/#contact">Contact Us</Link>
          </Button>
          */}
        </nav>
      </div>
    </header>
  );
};

export default Header;

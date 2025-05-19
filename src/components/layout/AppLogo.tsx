
"use client";

import Link from 'next/link';
import StaticLogoImage from './StaticLogoImage';

const AppLogo = () => {
  // Dimensions for the main AppLogo (linked)
  const logoWidth = 363; 
  const logoHeight = 125;

  return (
    <Link href="/" className="inline-block hover:opacity-80 transition-opacity" aria-label="Lexy Home Page">
      <StaticLogoImage 
        width={logoWidth}
        height={logoHeight}
      />
    </Link>
  );
};

export default AppLogo;

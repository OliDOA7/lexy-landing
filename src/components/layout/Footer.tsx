import Link from 'next/link';
import AppLogo from './AppLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#080b10' }} className="text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center md:justify-start">
            <AppLogo /> {/* Note: AppLogo default color is primary, might need adjustment for dark bg or override here */}
          </div>
          
          <div className="text-center text-sm">
            <p>&copy; {currentYear} Lexy Inc. All rights reserved.</p>
            <p className="mt-1">Secure and Compliant Transcription Services.</p>
          </div>

          <nav className="flex justify-center md:justify-end space-x-6">
            <Link href="/terms" className="hover:text-gray-200 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-200 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-200 transition-colors">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// Placeholder pages for links in footer (optional, can be removed if not needed)
// You would create these files in src/app/terms/page.tsx etc.
// For example, src/app/terms/page.tsx:
// export default function TermsPage() { return <div className="container py-8"><h1>Terms of Service</h1><p>...</p></div>; }

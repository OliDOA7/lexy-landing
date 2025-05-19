
import Link from 'next/link';
import AppLogo from './AppLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center md:justify-start">
            <AppLogo />
          </div>
          
          <div className="text-center text-sm">
            <p>&copy; {currentYear} Lexy Inc. All rights reserved.</p>
            <p className="mt-1">Secure and Compliant Transcription Services.</p>
          </div>

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-4 sm:gap-x-6 gap-y-2">
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

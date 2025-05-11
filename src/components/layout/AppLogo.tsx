
import Link from 'next/link';

const AppLogo = () => {
  return (
    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
      <span className="text-2xl font-bold text-primary">Lexy</span>
      <span className="block text-xs text-muted-foreground ml-8">
        powered by How2 Studio
      </span>
    </Link>
  );
};

export default AppLogo;

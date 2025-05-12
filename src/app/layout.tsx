import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Ensure Inter is used
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ 
  variable: '--font-sans', // Ensure this uses --font-sans
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lexy - AI Transcription Services',
  description: 'Lexy offers secure and compliant AI-powered transcription services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}

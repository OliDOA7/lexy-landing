
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AppLogo from "../layout/AppLogo";

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-background/70">
      {/* Video background and its overlay are removed from here as it's now handled by VideoSplashScreen */}
      {/* The section itself might need a background if the page background isn't dark enough, 
          or if a different static background is desired for the Hero section post-splash. 
          For now, using bg-background/70 or a similar class. Or remove if page background is fine.
      */}
      
      <div className="relative z-20 container mx-auto px-4 grid md:grid-cols-1 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-2">
            <span>Unlock Insights with</span>
            <div style={{ transform: 'scale(0.5)', margin: '-1.5em -2em -1.5em -2em' }} className="inline-block"> {/* Adjusted margin for tighter fit */}
              <AppLogo />
            </div>
            <span>AI Transcription</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Experience fast, accurate, and secure transcription services designed for professionals and businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

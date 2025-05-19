
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <video
        src="/assets/video/lexy-dark-vid.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        data-ai-hint="abstract technology"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-background/70 z-10"></div>
      
      <div className="relative z-20 container mx-auto px-4 grid md:grid-cols-1 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Unlock Insights with <span className="text-primary">Lexy</span> AI Transcription
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

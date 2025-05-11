import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-background to-accent/10">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
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
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
          <Image
            src="https://picsum.photos/seed/audioplayback/1280/720"
            alt="AI Transcription Dashboard with audio playback visualization"
            layout="fill"
            objectFit="cover"
            data-ai-hint="audio playback"
            className="transform hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


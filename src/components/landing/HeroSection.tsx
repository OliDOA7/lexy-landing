
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StaticLogoImage from "../layout/StaticLogoImage";

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-background/70">
      <div className="relative z-20 container mx-auto px-4 grid md:grid-cols-1 gap-12 items-center">
        <div className="text-center md:text-left">
          <div className="mb-8 flex justify-center md:justify-start">
            <StaticLogoImage width={145} height={50} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Unlock Insights with AI Transcription
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

import Image from "next/image";
import { CheckCircle } from "lucide-react";

const targetAudiences = [
  "Journalists & Media Professionals",
  "Researchers & Academics",
  "Legal Professionals & Paralegals",
  "Content Creators & Podcasters",
  "Businesses & Corporate Teams",
  "Students & Educators",
];

const AudienceSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built for Professionals Like You
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Lexy is designed to meet the diverse transcription needs of various industries and roles. Whether you're transcribing interviews, meetings, lectures, or podcasts, Lexy provides the tools you need for success.
            </p>
            <ul className="space-y-3">
              {targetAudiences.map((audience, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span className="text-foreground">{audience}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://picsum.photos/seed/audiotranscription/800/800"
              alt="Diverse professionals using Lexy for audio transcription"
              layout="fill"
              objectFit="cover"
              data-ai-hint="audio transcription"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;

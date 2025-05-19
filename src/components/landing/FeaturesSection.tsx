
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ShieldCheck, Users, Clock, FileText, Bot } from "lucide-react";
import StaticLogoImage from "../layout/StaticLogoImage";

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Lightning Fast Speed",
    description: "Get your transcriptions in minutes, not hours, with our cutting-edge AI.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Bank-Grade Security",
    description: "Your data is protected with end-to-end encryption and strict compliance standards.",
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "Unmatched Accuracy",
    description: "Achieve high accuracy rates for clear audio, powered by advanced AI models.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Speaker Identification",
    description: "Automatically distinguish between different speakers in your audio or video files.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Multiple Formats",
    description: "Export your transcripts in various formats like TXT, DOCX, SRT, and more.",
  },
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: "Time-Stamped Transcripts",
    description: "Easily navigate your audio with precise timestamps for every word.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center flex-wrap gap-2">
            Why Choose 
            <StaticLogoImage width={164} height={57} className="mx-1" /> {/* Approx 145*0.75 / 50*0.75 */}
            ?
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Powerful features designed to make your transcription process seamless and efficient.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center text-center">
                {feature.icon}
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

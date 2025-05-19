
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StaticLogoImage from "../layout/StaticLogoImage";

const audienceData = [
  {
    title: "Freelance Translators & Transcribers",
    description: "Accelerate your workflow, increase your earning potential, and support more languages — all with AI assistance.",
  },
  {
    title: "Language Service Providers & Agencies",
    description: "Lower operational costs, expand your capacity, and meet tight turnaround times without compromising compliance.",
  },
  {
    title: "Government Vendors & BOP Contractors",
    description: "Stay audit-ready with a secure, NDA-aligned transcription system that’s built for high-volume, multilingual call processing.",
  },
];

const AudienceSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Professionals Who Handle BOP Audio
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            <StaticLogoImage width={58} height={20} className="inline-block align-middle mr-1 relative -top-px" /> {/* Approx 145*0.4 / 50*0.4 */}
            is purpose-built for the people responsible for transcribing and translating sensitive inmate communications. Whether you’re working solo or managing a team, Lexy gives you the speed, security, and language flexibility you need to get the job done.
          </p>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {audienceData.map((audience, index) => (
            <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{audience.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{audience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;

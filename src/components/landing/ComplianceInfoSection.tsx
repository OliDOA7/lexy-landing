import { ShieldCheck, Lock } from "lucide-react";

const ComplianceInfoSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Secure & Compliant</h2>
          <p className="text-lg text-muted-foreground mt-2">
            We prioritize your data's security and confidentiality.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 bg-card p-8 rounded-lg shadow-lg">
            <div className="flex items-start">
              <ShieldCheck className="h-10 w-10 text-primary mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">NDA Protection</h3>
                <p className="text-muted-foreground">
                  All transcriptions are handled with the utmost confidentiality, aligning with standard Non-Disclosure Agreement principles. Your sensitive information remains secure.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Lock className="h-10 w-10 text-primary mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Authorized Use</h3>
                <p className="text-muted-foreground">
                  Lexy is intended for transcribing audio/video for which you have proper authorization, especially concerning Bureau of Prisons (BOP) recordings and other sensitive materials.
                </p>
              </div>
            </div>
          </div>
          <div className="prose prose-lg text-foreground max-w-none">
            <h3 className="text-2xl font-semibold mb-4">Commitment to Data Privacy</h3>
            <p>
              At Lexy, we understand the importance of data security. Our platform is built with multiple layers of protection to safeguard your information. We employ industry-standard encryption protocols for data in transit and at rest.
            </p>
            <p>
              Our infrastructure is designed for resilience and security, ensuring that your transcription data is handled responsibly and in accordance with best practices for data privacy and compliance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplianceInfoSection;

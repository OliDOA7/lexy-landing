
"use client";

import PlanCard from "@/components/plans/PlanCard";
import type { Plan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const plansData: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceFrequency: "/month",
    features: [
      "1 project",
      "3 minutes of transcription per day",
      "Standard Accuracy",
      "Unable to save project in cloud",
      "Community support",
    ],
    cta: "Start with Free",
    themeColor: "hsl(var(--muted-foreground))"
  },
  {
    id: "starter",
    name: "Starter",
    price: "$19.99",
    priceFrequency: "/mo",
    features: [
      "Up to 5 projects",
      "45 minutes of transcription per day",
      "Projects saved for up to 5 days from creation date",
      "Standard Accuracy",
      "Email support",
    ],
    cta: "Choose Starter",
    themeColor: "hsl(var(--accent))",
  },
  {
    id: "plus",
    name: "Plus",
    price: "$69.99",
    priceFrequency: "/mo",
    features: [
      "Up to 30 projects",
      "1500 minutes of transcription per month",
      "Projects saved for up to 15 days from creation date",
      "Standard Accuracy",
      "Speaker identification",
      "Multiple file exports (TXT, DOCX)",
      "Priority email support",
    ],
    cta: "Choose Plus",
    isPopular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$199",
    priceFrequency: "/mo",
    features: [
      "Up to 100 projects",
      "5000 minutes of transcription per month",
      "Projects saved for up to 3 months from creation date",
      "Small teams up to 5 members",
      "Standard Accuracy",
      "Advanced speaker identification",
      "All export formats (TXT, DOCX, SRT, VTT)",
      "API access",
      "Dedicated account manager & phone support",
    ],
    cta: "Choose Pro",
    themeColor: "hsl(var(--secondary))",
  },
];

export default function PlanSelectionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSkip = async () => {
     // Simulate API call to default to Free plan
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: "Skipped Plan Selection",
      description: "You'll continue with the Free plan. You can upgrade anytime.",
    });
    router.push("/"); // Redirect to dashboard or home
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <header className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Choose Your Lexy Plan</h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
          Select the perfect plan to fit your transcription needs. All plans offer reliable accuracy and processing.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
        {plansData.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="mt-16 text-center">
        <Button variant="ghost" size="lg" onClick={handleSkip} className="text-muted-foreground hover:text-primary">
          Skip for now and use Free Plan &rarr;
        </Button>
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>* Fair use policy applies for transcription minutes. All prices are in USD. You can cancel or change your plan anytime.</p>
      </div>
    </div>
  );
}

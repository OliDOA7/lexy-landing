
"use client";

import PlanCard from "@/components/plans/PlanCard";
import type { Plan } from "@/lib/types";
import { DISPLAY_PLANS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function PlanSelectionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSelectPlan = async (planName: string) => {
    // Simulate API call to save plan choice
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: `Plan Selected: ${planName}`,
      description: "Your plan has been updated. Redirecting to your dashboard...",
    });
    router.push("/dashboard"); // Redirect to dashboard
  };

  const handleSkip = async () => {
     // Simulate API call to default to Free plan
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: "Skipped Plan Selection",
      description: "You'll continue with the Free plan. Redirecting to your dashboard...",
    });
    router.push("/dashboard"); // Redirect to dashboard
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
        {DISPLAY_PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onSelectPlan={handleSelectPlan} />
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

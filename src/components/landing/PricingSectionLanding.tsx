
"use client";

import type { Plan } from "@/lib/types";
import { DISPLAY_PLANS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // Import useToast

// Only show a subset of plans on the landing page for brevity
const landingPagePlans: Plan[] = DISPLAY_PLANS.slice(0, 4); // Show all 4 defined for landing

const PricingSectionLanding = () => {
  const { toast } = useToast(); // Initialize useToast

  const handleProceedToCheckout = (planName: string, planId: string) => {
    console.log(`Proceeding to checkout for ${planName} (ID: ${planId}). Stripe integration would start here.`);
    toast({
      title: "Proceeding to Checkout",
      description: `You've selected the ${planName} plan. Integrating Stripe payment flow here.`,
    });
    // In a real application, you would:
    // 1. Ensure the user is authenticated.
    // 2. Call a backend function to create a Stripe Checkout session for the selected planId.
    // 3. Redirect the user to the Stripe Checkout page.
    // router.push(`/checkout?plan=${planId}`); // Example redirect
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mt-2">
            Choose the plan that's right for you. No hidden fees, upgrade or downgrade anytime.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {landingPagePlans.map((plan) => (
            <Card key={plan.id} className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ${plan.isPopular ? 'border-primary border-2 relative' : ''}`}>
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">
                  Popular
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.priceFrequency}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.slice(0,4).map((feature, index) => ( // Show first 4 features for brevity on landing
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.isPopular ? "default" : "outline"} 
                  onClick={() => handleProceedToCheckout(plan.name, plan.id)}
                >
                  {plan.cta === "Start with Free" ? "Get Started" : "Proceed to Checkout"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button variant="link" asChild>
            <Link href="/plans" className="text-primary">
              See All Plans & Features &rarr;
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSectionLanding;

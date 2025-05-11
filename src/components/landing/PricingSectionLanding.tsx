
import type { Plan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceFrequency: "/month",
    features: ["1 project", "3 mins/day transcription", "Standard Accuracy", "Local storage only"],
    cta: "Get Started",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$19.99",
    priceFrequency: "/mo",
    features: ["5 projects", "45 mins/day transcription", "5-day cloud storage"],
    cta: "Choose Starter",
  },
  {
    id: "plus",
    name: "Plus",
    price: "$69.99",
    priceFrequency: "/mo",
    features: ["30 projects", "1500 mins/month", "15-day cloud storage", "Speaker ID"],
    cta: "Choose Plus",
    isPopular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$199",
    priceFrequency: "/mo",
    features: ["100 projects, 5 members", "5000 mins/month", "3-month cloud storage", "API Access"],
    cta: "Choose Pro",
  },
];

const PricingSectionLanding = () => {
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
          {plans.map((plan) => (
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
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.isPopular ? "default" : "outline"} asChild>
                  <Link href="/plans">{plan.cta}</Link>
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

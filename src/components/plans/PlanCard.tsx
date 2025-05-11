"use client";

import type { Plan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface PlanCardProps {
  plan: Plan;
}

const PlanCard = ({ plan }: PlanCardProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleSelectPlan = async () => {
    // Simulate API call to save plan choice
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: `Plan Selected: ${plan.name}`,
      description: "Your plan has been updated. Redirecting...",
    });
    router.push("/"); // Redirect to dashboard or home
  };

  return (
    <Card 
      className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 
      ${plan.isPopular ? 'border-primary border-2 relative' : 'border-border'}
      ${plan.themeColor ? `border-[${plan.themeColor}]` : '' }`}
      style={plan.isPopular ? {borderColor: 'hsl(var(--primary))'} : plan.themeColor ? {borderColor: plan.themeColor} : {}}
    >
      {plan.isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">
          Most Popular
        </div>
      )}
      <CardHeader className="pt-8 items-center text-center">
        <CardTitle 
          className={`text-2xl font-bold ${plan.themeColor ? `text-[${plan.themeColor}]` : 'text-foreground'}`}
          style={plan.themeColor ? {color: plan.themeColor} : {}}
        >
          {plan.name}
        </CardTitle>
        <CardDescription className="mt-2">
          <span className="text-4xl font-bold text-foreground">{plan.price}</span>
          <span className="text-muted-foreground">{plan.priceFrequency}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow mt-4">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check 
                className={`h-5 w-5 mr-2 flex-shrink-0 ${plan.themeColor ? `text-[${plan.themeColor}]` : 'text-primary'}`} 
                style={plan.themeColor ? {color: plan.themeColor} : {}}
              />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-6">
        <Button 
          className="w-full" 
          variant={plan.isPopular || plan.themeColor ? "default" : "outline"} 
          onClick={handleSelectPlan}
          style={plan.themeColor && !plan.isPopular ? {backgroundColor: plan.themeColor, color: 'hsl(var(--primary-foreground))'} : {}}
        >
          {plan.cta}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;

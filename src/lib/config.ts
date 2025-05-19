
import type { Plan } from "./types";

// PLANS_CONFIG was removed as it was primarily used by the dashboard and backend logic.
// DISPLAY_PLANS is kept as it's used by the landing page pricing section.

export const DISPLAY_PLANS: Plan[] = [
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
    themeColor: "hsl(var(--muted-foreground))",
    // Removed detailed plan limits not relevant for landing page display logic
  },
  {
    id: "starter",
    name: "Starter",
    price: "$19.99",
    priceFrequency: "/mo",
    features: [
      "Up to 5 projects",
      "20 minutes of transcription per day", // Updated from 45 minutes
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


import type { PlanConfig, Plan } from "./types";

export const PLANS_CONFIG: Record<string, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    priceNumerical: 0,
    minuteLimitDaily: 3,
    minuteLimitMonthly: null, // Or a small monthly cap if daily aggregates monthly
    projectLimit: 1,
    storageDays: 0, // Not saved in cloud
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceNumerical: 19.99,
    minuteLimitDaily: 45,
    minuteLimitMonthly: null, // Or a monthly cap if daily aggregates monthly
    projectLimit: 5,
    storageDays: 5,
  },
  plus: {
    id: "plus",
    name: "Plus",
    priceNumerical: 69.99,
    minuteLimitDaily: null, // Uses monthly limit
    minuteLimitMonthly: 1500,
    projectLimit: 30,
    storageDays: 15,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceNumerical: 199,
    minuteLimitDaily: null, // Uses monthly limit
    minuteLimitMonthly: 5000,
    projectLimit: 100,
    storageDays: 90, // 3 months
  },
};

// This is the data used for the landing page and plan selection page cards
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
    minuteLimitDaily: PLANS_CONFIG.free.minuteLimitDaily,
    projectLimit: PLANS_CONFIG.free.projectLimit,
    storageDays: PLANS_CONFIG.free.storageDays,
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
    minuteLimitDaily: PLANS_CONFIG.starter.minuteLimitDaily,
    projectLimit: PLANS_CONFIG.starter.projectLimit,
    storageDays: PLANS_CONFIG.starter.storageDays,
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
    minuteLimitMonthly: PLANS_CONFIG.plus.minuteLimitMonthly,
    projectLimit: PLANS_CONFIG.plus.projectLimit,
    storageDays: PLANS_CONFIG.plus.storageDays,

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
    minuteLimitMonthly: PLANS_CONFIG.pro.minuteLimitMonthly,
    projectLimit: PLANS_CONFIG.pro.projectLimit,
    storageDays: PLANS_CONFIG.pro.storageDays,
  },
];

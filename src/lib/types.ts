import type { Timestamp } from "firebase/firestore";

export interface Plan {
  id: string;
  name: string;
  price: string;
  priceFrequency: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  themeColor?: string; // hex color for special styling
  // Detailed plan limits for dashboard logic
  minuteLimitDaily?: number | null;
  minuteLimitMonthly?: number | null;
  projectLimit?: number | null;
  storageDays?: number | null;
}

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  planId: string; // e.g., "free", "starter"
  // minutesUsed and minutesRemaining will be computed or derived
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  duration: number; // in minutes
  language: string;
  createdAt: Date; // Using Date object for easier manipulation, can be Timestamp from Firestore
  status: "Draft" | "Completed" | "Processing" | "Error";
  fileURL?: string; // URL to audio file in storage
  transcript?: string; // text content
  fileType?: string; // e.g., 'audio/mp3', 'audio/wav'
  fileSize?: number; // in bytes
}

// Used for plan configuration, separate from display `Plan` type
export interface PlanConfig {
  id: string;
  name: string;
  priceNumerical: number; // for calculations if needed
  minuteLimitDaily: number | null;
  minuteLimitMonthly: number | null;
  projectLimit: number | null;
  storageDays: number | null;
  // Add other config details if necessary
}

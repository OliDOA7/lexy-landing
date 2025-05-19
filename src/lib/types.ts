
// types.ts - Simplified for Landing Page

export interface Plan {
  id: string;
  name: string;
  price: string;
  priceFrequency: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  themeColor?: string; // hex color for special styling
  // Removed detailed plan limits (minuteLimitDaily, projectLimit, etc.)
  // as they are not directly used by the landing page display components
  // beyond what's in the features array.
}

// The following types are related to the removed dashboard, auth, and editor functionalities.
// They are kept here commented out for reference but are not actively used in the landing page.
/*
import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  planId: string; // e.g., "free", "starter"
}

export interface TranscriptionRow {
  timestamp: string;
  speaker: string;
  text: string;
}

export type ProjectStatus =
  | "Draft"
  | "Uploaded"
  | "PendingTranscription"
  | "ProcessingTranscription"
  | "Completed"
  | "Error"
  | "ErrorTranscription";

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  duration: number;
  language: string;
  createdAt: Date;
  status: ProjectStatus;
  storagePath?: string;
  transcript?: TranscriptionRow[];
  detectedLanguages?: string[];
  fileType?: string;
  fileSize?: number;
  expiresAt?: Date;
}

export interface PlanConfig {
  id: string;
  name: string;
  priceNumerical: number;
  minuteLimitDaily: number | null;
  minuteLimitMonthly: number | null;
  projectLimit: number | null;
  storageDays: number | null;
}
*/

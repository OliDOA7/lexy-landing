
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

// Updated to TranscriptionRow as per new requirements
export interface TranscriptionRow {
  timestamp: string; // Format: "0:05" or "[HH:MM:SS]" - model will be prompted for HH:MM:SS for JSON
  speaker: string;   // e.g., Operator, Speaker 1
  text: string;      // Transcribed text, potentially with <u> HTML tags
}

export type ProjectStatus =
  | "Draft" // Initial state after creation, before audio upload in editor
  | "Uploaded" // File uploaded to storage (via editor), awaiting transcription trigger
  | "PendingTranscription" // User triggered transcription, waiting for function pickup
  | "ProcessingTranscription" // Cloud function is actively processing
  | "Completed" // Transcription successful, data available
  | "Error" // General error not related to transcription
  | "ErrorTranscription"; // Specific error during transcription process

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  duration: number; // in minutes, 0 if not set, updated after audio processing
  language: string; // User-selected or auto-detected language code
  createdAt: Date; // Using Date object for easier manipulation
  status: ProjectStatus;
  storagePath?: string; // Path to audio file in Firebase Storage, e.g., "gs://bucket/audio/{userId}/{projectId}/filename.mp3"
  transcript?: TranscriptionRow[]; // Updated to store array of TranscriptionRow objects
  detectedLanguages?: string[]; // Store detected languages
  fileType?: string; // e.g., 'audio/mpeg', 'audio/wav'
  fileSize?: number; // in bytes
  expiresAt?: Date; // Date when the project (especially audio file) expires
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

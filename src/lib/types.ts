
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

export interface TranscriptionSegment {
  timestamp: string; // Format: [HH:MM:SS]
  speaker: string;   // e.g., Operator, Speaker A, UM1 (no colon)
  text: string;      // Transcribed text, potentially with <u> HTML tags
}

export type ProjectStatus = 
  | "Draft" // Initial state, file not yet uploaded or processing not started
  | "Uploaded" // File uploaded to storage, awaiting transcription trigger
  | "PendingTranscription" // User triggered transcription, waiting for function pickup
  | "ProcessingTranscription" // Cloud function is actively processing
  | "Completed" // Transcription successful, data available
  | "Error" // General error
  | "ErrorTranscription" // Specific error during transcription process
  | "Processing"; // Legacy or general processing state, to be refined

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  duration: number; // in minutes, can be an estimate initially
  language: string; // User-selected or auto-detected language code
  createdAt: Date; // Using Date object for easier manipulation
  status: ProjectStatus;
  storagePath?: string; // Path to audio file in Firebase Storage, e.g., "gs://bucket/audio/{userId}/{projectId}/filename.mp3"
  fileURL?: string; // Publicly accessible URL if generated, otherwise use storagePath to fetch
  // Transcript can be the raw segments, or the processed HTML string after CF processing.
  // For display, if it's a string, it's assumed to be HTML.
  transcript?: TranscriptionSegment[] | string; 
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

    

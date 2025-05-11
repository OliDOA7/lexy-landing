import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { transcribeAudio, TranscribeAudioInput, TranscribeAudioOutput } from "../../src/ai/flows/transcribe-audio-flow"; // Path to Genkit flow
import {initializeApp} from "firebase-admin/app";
import * as cors from "cors";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  initializeApp();
}

// Configure CORS
const corsHandler = cors({origin: true});

// Helper function to convert TranscriptionSegment array to HTML table string
function segmentsToHtmlTable(segments: TranscribeAudioOutput): string {
  let tableHtml = "<table class=\"min-w-full divide-y divide-gray-700 border border-gray-700\">";
  tableHtml += "<thead class=\"bg-gray-800\"><tr class=\"text-left text-xs font-medium uppercase tracking-wider text-gray-400\">";
  tableHtml += "<th class=\"px-4 py-2\">Timestamp</th>";
  tableHtml += "<th class=\"px-4 py-2\">Speaker</th>";
  tableHtml += "<th class=\"px-4 py-2\">Text</th>";
  tableHtml += "</tr></thead>";
  tableHtml += "<tbody class=\"divide-y divide-gray-700 bg-gray-900\">";

  for (const segment of segments) {
    // Basic sanitization (consider more robust solution if needed)
    const timestamp = segment.timestamp.replace(/[<>&]/g, "");
    const speaker = segment.speaker.replace(/[<>&]/g, "");
    // The text field might contain <u> tags from the AI, which is intended.
    // No additional sanitization applied to `segment.text` here to preserve those tags.
    tableHtml += "<tr class=\"text-sm text-gray-300\">";
    tableHtml += `<td class="whitespace-nowrap px-4 py-2 font-mono\"><code>${timestamp}</code></td>`;
    tableHtml += `<td class="whitespace-nowrap px-4 py-2 font-medium\">${speaker}:</td>`; // Added colon as per user example
    tableHtml += `<td class="px-4 py-2 text-left\">${segment.text}</td>`;
    tableHtml += "</tr>";
  }
  tableHtml += "</tbody></table>";
  return tableHtml;
}


export const transcribeAudioHttp = functions.https.onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { audioStoragePath, languageHint } = request.body as TranscribeAudioInput;

      if (!audioStoragePath) {
        response.status(400).json({ error: "Missing audioStoragePath in request body." });
        return;
      }
      
      // Note: Genkit initialization is expected to happen when `transcribeAudio` is imported,
      // as `transcribeAudio` imports `../../src/ai/genkit.ts`.
      // Ensure environment variables (like GOOGLE_API_KEY if not using ADC) are available.
      // Also, the Firebase Function's service account needs permissions for GCS and AI Platform/Vertex AI.

      console.log(`Cloud Function: Received request to transcribe ${audioStoragePath}`);

      const transcriptionSegments = await transcribeAudio({ audioStoragePath, languageHint });
      
      if (!transcriptionSegments || transcriptionSegments.length === 0) {
          console.log("Cloud Function: Transcription returned no segments.");
          response.status(200).send("<p>Transcription result was empty or processing yielded no segments.</p>");
          return;
      }

      const htmlTable = segmentsToHtmlTable(transcriptionSegments);
      
      console.log("Cloud Function: Successfully generated HTML table for transcription.");
      response.status(200).send(htmlTable);

    } catch (error: any) {
      console.error("Cloud Function: Error during transcription processing:", error);
      // Check if error has a 'details' property or specific structure from Genkit/GCP
      const message = error.message || "An unknown error occurred during transcription.";
      const details = error.details || (error.cause ? JSON.stringify(error.cause) : undefined);
      response.status(500).json({ error: "Failed to process audio transcription.", message, details });
    }
  });
});
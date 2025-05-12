
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
      
      console.log(`Cloud Function: Received request to transcribe ${audioStoragePath}`);

      // Call the Genkit flow
      const transcriptionResult: TranscribeAudioOutput = await transcribeAudio({ audioStoragePath, languageHint });
      
      if (!transcriptionResult || !transcriptionResult.transcriptionRows || transcriptionResult.transcriptionRows.length === 0) {
          console.log("Cloud Function: Transcription returned no segments or an empty result.");
          // Return the structured empty response if that's the case
          response.status(200).json(transcriptionResult || { transcriptionRows: [], detectedLanguages: [] });
          return;
      }
      
      console.log("Cloud Function: Successfully processed transcription.");
      // Return the JSON output directly
      response.status(200).json(transcriptionResult);

    } catch (error: any) {
      console.error("Cloud Function: Error during transcription processing:", error);
      const message = error.message || "An unknown error occurred during transcription.";
      const details = error.details || (error.cause ? JSON.stringify(error.cause) : undefined);
      response.status(500).json({ error: "Failed to process audio transcription.", message, details });
    }
  });
});

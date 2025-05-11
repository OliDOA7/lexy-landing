'use server';
/**
 * @fileOverview AI flow for transcribing audio files with specific formatting.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { TranscriptionSegment } from '@/lib/types'; // Re-use type from lib

const CUSTOM_TRANSCRIPTION_API_KEY = process.env.LEXY_TRANSCRIPTION_API_KEY;
const someConditionToUseCustomApi = false; 

if (!CUSTOM_TRANSCRIPTION_API_KEY && someConditionToUseCustomApi) {
  console.warn("Custom transcription API key is not set in .env file but was expected.");
}

const TranscribeAudioInputSchema = z.object({
  audioStoragePath: z
    .string()
    .describe(
      "The full path to the audio file. This will be used as a data URI if not a gs:// path. Expected format: 'gs://<bucket-name>/<path-to-file>' or a publicly accessible https URL or a data URI. This URL must be accessible by the model."
    ),
  languageHint: z.string().optional().describe('Optional language hint for transcription (e.g., "en-US", "es-ES"). If "auto", model will detect. This primarily guides the initial language detection if ambiguous.'),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

// Output schema matches TranscriptionSegment array from lib/types.ts
const TranscriptionSegmentSchema = z.object({
  timestamp: z.string().describe("Timestamp of the segment start, formatted as [HH:MM:SS] (rounded to the nearest second)."),
  speaker: z.string().describe("Identified speaker label (e.g., Operator, Speaker A, UM1, UF1, Amy, Sam, Martinez). Do not include a colon after the speaker name."),
  text: z.string().describe("Transcribed text for the segment. English translation for non-English parts. HTML <u> tags for originally English words in non-English segments. Interruptions end with //."),
});

const TranscribeAudioOutputSchema = z.array(TranscriptionSegmentSchema);
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;


export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  // The `audioStoragePath` for the {{media}} helper should ideally be an accessible URL.
  // If it's a gs:// URI, the Genkit Google AI plugin, when run in a GCP environment
  // (like a Firebase Function) with appropriate service account permissions, should handle it.
  return transcribeAudioFlow(input);
}

const transcriptionPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: { schema: TranscribeAudioInputSchema },
  output: { schema: TranscribeAudioOutputSchema },
  model: 'googleai/gemini-1.5-pro-latest', // Updated to Gemini 1.5 Pro
  config: {
    temperature: 0.1, 
     safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
  // This prompt is already very detailed and asks for the JSON structure we need.
  // The new Firebase Cloud Function will take this JSON and convert it to an HTML table.
  prompt: `You are an expert transcription service. Transcribe the provided audio file into English text and apply the following rules precisely.
The primary language for the transcript must be English.

Audio File: {{media url=audioStoragePath}}
{{#if languageHint}}Initial Language Hint: {{languageHint}}{{/if}}

Detailed Instructions & Formatting Rules:

1.  Diarization & Speaker Identification:
    *   Identify distinct speakers.
    *   Initial Generic Labels: Label speakers based on order of appearance (e.g., "Speaker A", "Speaker B") if no other information is available.
    *   Name Identification: If a speaker clearly states their name (e.g., "My name is Amy," "This is Sam," "Martinez"), use their actual name as the speaker label from that point onwards (e.g., "Amy", "Sam", "Martinez"). Do not include a colon.
    *   Gender Identification (If Name Unknown): If a speaker's name is not identified, but their gender can be reasonably inferred:
        *   Label them as "UM" (Unidentified Male) or "UF" (Unidentified Female). Do not include a colon.
        *   Assign a chronological number (e.g., "UM1", "UF1", "UM2"). Use this label consistently unless their name is later identified.
    *   Operator Messages: Label the speaker for standard automated messages common in correctional facility calls (e.g., "This call is from a federal correctional facility...", "To accept this call, press 1.") as "Operator". Do not include a colon. Transcribe these messages verbatim.
    *   Default: If neither name nor gender can be identified, continue using generic "Speaker A", "Speaker B" labels. Do not include a colon.
    *   Speaker Label Format for JSON 'speaker' field: Do NOT include a colon after the speaker name.

2.  Turn Consolidation & Timestamps:
    *   Group Utterances: Combine consecutive sentences or phrases spoken by the same speaker into a single continuous turn.
    *   Create New Segment: Start a new segment (a new JSON object in the output array) ONLY when:
        a.  The speaker changes.
        b.  The current speaker is interrupted (marked with //).
        c.  There is a significant pause clearly indicating the end of a turn.
    *   Timestamp: Assign a single timestamp to each segment representing the start time of that consolidated speaking turn.
        *   Format: "[HH:MM:SS]" (rounded to the nearest second). Example: "[00:01:15]".
        *   Place this in the "timestamp" field of the JSON object.

3.  Transcription Content:
    *   Transcribe spoken words verbatim for the entire consolidated turn.
    *   Use standard English punctuation and capitalization.
    *   Place the full text of the turn in the "text" field of the JSON object.

4.  Handling Interruptions:
    *   If a speaker's consolidated turn is cut off mid-sentence or mid-word by another speaker or an event, end their transcribed text in the "text" field with "//". This also signals the end of their segment. Example: "I was trying to explain the whole process, but then//"

5.  Handling Unintelligible Audio:
    *   If parts of the audio within a speaker's turn are unclear or unintelligible, use the notation "[UI - <Reason>]" within the "text" field.
    *   Specify the reason concisely: "[UI - Bad audio]", "[UI - Background noise]", "[UI - Mumbles]", "[UI - Crosstalk]", or simply "[UI]" if the reason is unknown.
    *   Example "text" field entry: "Okay, I have the first part, but the second part was [UI - Bad audio], can you repeat that?"

6.  Language Translation (Non-English to English):
    *   The primary language for the transcript MUST be English.
    *   If a speaker uses a language other than English during their turn:
        a.  Detect the non-English language.
        b.  Translate those non-English utterances accurately into grammatically correct English.
        c.  Include the English translation as part of the consolidated text in the "text" field.
        d.  DO NOT include the original non-English text in the output JSON.
        e.  If any words were originally spoken in English *within that non-English segment*, underline those specific English words in the translated text using HTML <u> tags. Example: If "Hola, <u>John</u>, como estas?" was spoken, the output "text" should be "Hello, <u>John</u>, how are you?". If "Je vais au <u>store</u>" was spoken, it becomes "I am going to the <u>store</u>".
    *   Example "text" field entry: "Yes, I can help. I need help with this. What is the account number?" (Assuming "Necesito ayuda con esto." was spoken mid-turn by a Spanish speaker).

7.  Non-Speech Sounds (Optional but Recommended):
    *   Include significant, clearly identifiable non-speech sounds relevant to the conversation context with bracketed descriptions within the "text" field.
    *   Examples: "[Laughs]", "[Coughs]", "[Phone rings]", "[Door Slam]", "[Silence X seconds]".
    *   Example "text" field entry: "And then he just [Laughs] and walked away."

Output Format:
Return the transcription as a VALID JSON ARRAY of objects. Each object in the array MUST conform to the following structure:
{
  "timestamp": "[HH:MM:SS]",
  "speaker": "string (e.g., Operator, Speaker A, UM1, UF1, Amy, Sam, Martinez - no colon)",
  "text": "string (transcribed English text, potentially with <u> tags and // or [UI] markers)"
}

Example of expected JSON output structure:
[
  { "timestamp": "[00:00:00]", "speaker": "UF1", "text": "Hello?" },
  { "timestamp": "[00:00:02]", "speaker": "Operator", "text": "You have a prepaid call. You will not be charged for this call. This call is from//" },
  { "timestamp": "[00:00:06]", "speaker": "Martinez", "text": "[UI - Mumbles] Martinez." },
  { "timestamp": "[00:00:08]", "speaker": "Operator", "text": "An inmate at a federal prison. This call may be heard or recorded. Hang up to decline the call or to accept dial 5 now. If you wish to block any future calls//" },
  { "timestamp": "[00:00:15]", "speaker": "Martinez", "text": "Hi! How are you? Here everything is very good, calm down. Happy thanks giving! [Laughs]." },
  { "timestamp": "[00:00:17]", "speaker": "UF1", "text": "Good, son. And you? Happy thanks giving!" },
  { "timestamp": "[00:00:28]", "speaker": "Amy", "text": "Okay, Sam, let's get that order started. What can I get for you?" },
  { "timestamp": "[00:00:31]", "speaker": "Sam", "text": "Great, I'd like one large cheese pizza." },
  { "timestamp": "[00:00:34]", "speaker": "UM1", "text": "Did you remember to add the [UI - Bad audio]? Because last time//" },
  { "timestamp": "[00:00:37]", "speaker": "Amy", "text": "Yes, it was added. Don't worry." }
]

Ensure the entire output is a single, valid JSON array. Do not include any explanatory text before or after the JSON array itself.
Adhere strictly to all formatting rules, especially turn consolidation, speaker labeling, and timestamp format.
`,
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    console.log("Transcribing audio with input:", input);
    if (someConditionToUseCustomApi && CUSTOM_TRANSCRIPTION_API_KEY) {
      console.log("Using custom transcription API key:", CUSTOM_TRANSCRIPTION_API_KEY.substring(0, 10) + "..."); 
      // Placeholder for custom API logic
    }

    try {
      const { output } = await transcriptionPrompt(input);
      if (!output) {
        console.error('Transcription output was null or undefined after model processing and parsing.');
        throw new Error('Transcription failed: No structured output from model.');
      }
      return output; // Output is TranscriptionSegment[]
    } catch (error) {
      console.error("Error in transcribeAudioFlow:", error);
      throw error; 
    }
  }
);
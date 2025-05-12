
'use server';
/**
 * @fileOverview AI flow for transcribing audio files, providing speaker diarization,
 * translation to English, and specific formatting.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function,
 *   containing transcriptionRows and detectedLanguages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { TranscriptionRow } from '@/lib/types'; // Using TranscriptionRow from lib/types

const CUSTOM_TRANSCRIPTION_API_KEY = process.env.LEXY_TRANSCRIPTION_API_KEY || "AIzaSyCvS5vWnsMH1uy5Tl8pWRXX5XgI9f4DC40";
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

// Schema for a single transcription row
const TranscriptionRowSchema = z.object({
  timestamp: z.string().describe("Timestamp of the segment start, formatted as [HH:MM:SS] (rounded to the nearest second)."),
  speaker: z.string().describe("Identified speaker label (e.g., Operator, Speaker 1, UM1, UF1, Amy, Sam). Do not include a colon after the speaker name."),
  text: z.string().describe("Transcribed and translated English text for the segment. If original text was not English and has been translated, original English words within that segment should be underlined using HTML <u> tags. Interruptions end with //."),
});

// Output schema matches the new JSON structure
const TranscribeAudioOutputSchema = z.object({
  transcriptionRows: z.array(TranscriptionRowSchema).describe("List of transcribed audio segments."),
  detectedLanguages: z.array(z.string()).describe("List of detected language codes (e.g., ['en', 'es'])."),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;


export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcriptionPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: { schema: TranscribeAudioInputSchema },
  output: { schema: TranscribeAudioOutputSchema }, // Ensures model output matches this Zod schema
  model: 'googleai/gemini-1.5-pro-latest',
  config: {
    temperature: 0.1,
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
  prompt: `You are an AI model that transcribes and translates audio.
When a user provides an audio file, perform the following steps:

Audio File: {{media url=audioStoragePath}}
{{#if languageHint}}Initial Language Hint: {{languageHint}}{{/if}}

1.  Transcribe the audio.
2.  Perform speaker diarization:
    *   Initially label speakers generically (e.g., "Speaker A", "Speaker B") based on order of appearance.
    *   If a speaker states their name (e.g., "My name is Amy," "This is Sam"), use their actual name as the speaker label from that point onwards (e.g., "Amy", "Sam"). Do not include a colon after the speaker name.
    *   If a speaker's name is not identified, but their gender can be reasonably inferred: Label them as "UM" (Unidentified Male) or "UF" (Unidentified Female). Assign a chronological number (e.g., "UM1", "UF1", "UM2"). Use this label consistently unless their name is later identified. Do not include a colon after the speaker name.
    *   Label the speaker for standard automated messages common in correctional facility calls (e.g., "This call is from a federal correctional facility...", "To accept this call, press 1.") as "Operator". Do not include a colon after the speaker name. Transcribe these messages verbatim.
    *   If neither name nor gender can be identified, continue using generic "Speaker A", "Speaker B" labels. Do not include a colon after the speaker name.
    *   Speaker Label Format for JSON 'speaker' field: Do NOT include a colon after the speaker name.

3.  Translate all non-English speech into grammatically correct English. The final transcript text for each segment should only be in English.
    *   If any words were originally spoken in English *within that non-English segment*, underline those specific English words in the translated text using HTML <u> tags. Example: If "Hola, <u>John</u>, como estas?" was spoken, the output "text" field for that segment should contain "Hello, <u>John</u>, how are you?". If "Je vais au <u>store</u>" was spoken, it becomes "I am going to the <u>store</u>".

4.  Consolidate consecutive utterances by the same speaker into a single turn/segment for the JSON output.
    *   A new segment (JSON object in the 'transcriptionRows' array) should be created ONLY when:
        a.  The speaker changes.
        b.  The current speaker is interrupted (marked with //).
        c.  There is a significant pause clearly indicating the end of a turn.

5.  For each segment in the 'transcriptionRows' array:
    *   `timestamp`: Provide the start time of that consolidated speaking turn, formatted as "[HH:MM:SS]" (rounded to the nearest second). Example: "[00:01:15]".
    *   `speaker`: The identified speaker label (e.g., "Operator", "Speaker A", "UM1", "UF1", "Amy", "Sam"). No colon.
    *   `text`: The transcribed and translated English text. Mark interruptions at the end of the text with "//".

6.  Handle Unintelligible Audio:
    *   If parts of the audio within a speaker's turn are unclear or unintelligible, use the notation "[UI - <Reason>]" within the "text" field.
    *   Specify the reason concisely: "[UI - Bad audio]", "[UI - Background noise]", "[UI - Mumbles]", "[UI - Crosstalk]", or simply "[UI]" if the reason is unknown.

7. Non-Speech Sounds (Optional but Recommended):
    *   Include significant, clearly identifiable non-speech sounds relevant to the conversation context with bracketed descriptions within the "text" field for that segment.
    *   Examples: "[Laughs]", "[Coughs]", "[Phone rings]", "[Door Slam]", "[Silence X seconds]".

Return the result as a VALID JSON object with the following structure:
{
  "transcriptionRows": [
    {
      "timestamp": "[HH:MM:SS]",
      "speaker": "string (e.g., Operator, Speaker A, UM1 - no colon)",
      "text": "string (transcribed English text, <u> tags, //, [UI])"
    }
    // ... more rows
  ],
  "detectedLanguages": ["string"] // e.g., ["en", "es"]
}

Example of expected JSON output structure:
{
  "transcriptionRows": [
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
  ],
  "detectedLanguages": ["en", "es"]
}

Ensure the entire output is a single, valid JSON object. Do not include any explanatory text before or after the JSON object itself.
Adhere strictly to all formatting rules, especially turn consolidation, speaker labeling, and timestamp format for the JSON.
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
      // Output is already parsed by Genkit into TranscribeAudioOutput type (object with transcriptionRows and detectedLanguages)
      return output;
    } catch (error) {
      console.error("Error in transcribeAudioFlow:", error);
      // Consider re-throwing or wrapping the error for more context
      throw error;
    }
  }
);

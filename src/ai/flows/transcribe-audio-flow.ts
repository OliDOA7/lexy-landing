
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

const TranscribeAudioInputSchema = z.object({
  audioStoragePath: z
    .string()
    .describe(
      "The full path to the audio file in Firebase Storage. This will be used as a data URI. Expected format: 'gs://<bucket-name>/<path-to-file>' or a publicly accessible https URL if converted."
    ),
  languageHint: z.string().optional().describe('Optional language hint for transcription (e.g., "en-US", "es-ES"). If "auto", model will detect.'),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

// Output schema matches TranscriptionSegment array from lib/types.ts
const TranscriptionSegmentSchema = z.object({
  timestamp: z.string().describe("Timestamp of the segment start (e.g., HH:MM:SS or MM:SS)."),
  speaker: z.string().describe("Identified speaker label (e.g., Operator, Speaker A, UM1)."),
  text: z.string().describe("Transcribed text for the segment. HTML <u> tags may be used for underlining."),
});

const TranscribeAudioOutputSchema = z.array(TranscriptionSegmentSchema);
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;


export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  // In a real scenario, if audioStoragePath is a gs:// URI, you might need a step here
  // to generate a signed URL or otherwise make it accessible to the model if it can't directly access GCS.
  // For this example, we assume the model can handle a GCS path or it's converted to a data URI elsewhere.
  // For simplicity, we'll pass it directly to the prompt, assuming the {{media}} helper or model handles it.
  // However, Genkit's {{media url=...}} typically expects an HTTP(S) URL or a data URI.
  // A gs:// URI might not work directly unless the underlying model plugin specifically supports it.
  // A more robust solution would be to get a downloadable HTTPS URL for the GCS object.

  // For now, we'll assume `input.audioStoragePath` is a format `{{media}}` can handle (e.g. HTTPS URL or data URI).
  // If it's a gs:// path, this will likely fail unless the `googleAI` plugin is configured to handle it.
  // The prompt assumes `audioStoragePath` IS usable by `{{media}}`.

  return transcribeAudioFlow(input);
}

const transcriptionPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: { schema: TranscribeAudioInputSchema },
  output: { schema: TranscribeAudioOutputSchema },
  model: 'googleai/gemini-1.5-flash', // Using a capable model
  config: {
    temperature: 0.2, // Lower temperature for more factual transcription
     safetySettings: [ // Adjust safety settings if needed for transcription content
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
  prompt: `You are an expert transcription service. Transcribe the provided audio file and apply the following rules precisely:

Audio File: {{media url=audioStoragePath}}
{{#if languageHint}}Language Hint: {{languageHint}}{{/if}}

Formatting Rules:
1.  Speaker Identification:
    *   Identify distinct speakers. Label them as "Operator", "Speaker A", "Speaker B", etc.
    *   If gender can be reliably determined for unknown speakers, use "UM1" (Unknown Male 1), "UF1" (Unknown Female 1), "UM2", etc.
    *   If specific names are clearly spoken and identifiable as speaker labels (e.g., "John said..."), use those names. Otherwise, stick to generic labels.
2.  Turn Grouping: Combine consecutive utterances from the same speaker into a single transcription segment. A new segment (new row in the output JSON) should only occur upon a clear speaker change or a significant interruption that changes the conversational turn.
3.  Timestamps: Provide a timestamp for the beginning of each spoken segment in "HH:MM:SS" or "MM:SS" format.
4.  Interruptions: If a speaker is clearly cut off mid-sentence or mid-word by another speaker or an event, end their transcribed text with "//". Example: "I was going to say that-- //"
5.  Unintelligible Segments:
    *   If a short segment of speech is unintelligible or unclear due to mumbling, background noise, or crosstalk, represent it as "[UI - Mumbles]", "[UI - Background Noise]", "[UI - Crosstalk]", or a similar concise description of the reason. Example: "I went to the [UI - Mumbles] yesterday."
    *   If an entire speaker's turn is unintelligible, use a single segment like: { "timestamp": "00:XX:YY", "speaker": "Speaker A", "text": "[UI - Entire segment unintelligible]" }.
6.  Non-English Translation & Underlining:
    *   If a segment of speech is predominantly in a non-English language:
        a.  Identify the language if possible (e.g., Spanish, French).
        b.  Translate the entire non-English phrase or sentence accurately into English.
        c.  In the translated English text, if any words were originally spoken in English *within that non-English segment*, underline those specific English words using HTML <u> tags. Example: If "Hola, <u>John</u>, como estas?" was spoken, the output text should be "Hello, <u>John</u>, how are you?". If "Je vais au <u>store</u>" was spoken, it becomes "I am going to the <u>store</u>".
    *   If an entire turn is non-English, translate the whole turn.
7.  Operator Messages:
    *   Listen for standard automated messages common in correctional facility calls (e.g., "This call is from a federal correctional facility and is subject to monitoring and recording.", "You have a call from an inmate at...", "To accept this call, press 1.").
    *   Transcribe these messages verbatim.
    *   Label the speaker for these messages as "Operator".
8.  Non-speech Sounds (Use sparingly and only if very clear and relevant):
    *   Represent significant, clearly identifiable non-speech sounds relevant to the conversation context with bracketed descriptions like "[Laughs]", "[Coughs]", "[Door Slam]", "[Music]", "[Silence X seconds]". Example: "And then he just [Laughs] and walked away."

Output Format:
Return the transcription as a JSON array of objects. Each object in the array must conform to the following structure:
{
  "timestamp": "string (HH:MM:SS or MM:SS format)",
  "speaker": "string (e.g., Operator, Speaker A, UM1)",
  "text": "string (transcribed text, potentially with <u> tags for rule #6)"
}

Example of expected JSON output:
[
  { "timestamp": "00:00:05", "speaker": "Operator", "text": "This call is from a federal prison and may be recorded and monitored." },
  { "timestamp": "00:00:15", "speaker": "Speaker A", "text": "Hello, how are you? I heard vous allez <u>bien</u> today." },
  { "timestamp": "00:00:20", "speaker": "Speaker B", "text": "I'm doing well, thanks for //" },
  { "timestamp": "00:00:22", "speaker": "Speaker A", "text": "Great! I wanted to ask about the [UI - Mumbles] situation." }
]

Ensure the entire output is a valid JSON array.
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
    try {
      const { output } = await transcriptionPrompt(input);
      if (!output) {
        console.error('Transcription output was null or undefined.');
        // Consider throwing a more specific error or returning a default error structure
        throw new Error('Transcription failed: No output from model.');
      }
      // Validate the output against the schema again, if necessary, or trust definePrompt's validation.
      // Zod parse will throw if it doesn't match.
      return TranscribeAudioOutputSchema.parse(output);
    } catch (error) {
      console.error("Error in transcribeAudioFlow:", error);
      // Rethrow or handle; for now, rethrowing.
      // Potentially, return a structured error within TranscribeAudioOutput if the schema allows.
      // For now, let the error propagate.
      throw error; 
    }
  }
);

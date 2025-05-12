# Firebase Studio - Lexy AI Transcription

This is a Next.js starter application for Lexy, an AI-powered transcription service, built in Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Project Setup

### Prerequisites

*   Node.js (version specified in `package.json` or latest LTS)
*   npm or yarn
*   Firebase CLI (for deploying functions and hosting)
*   Access to Google Cloud Platform for Gemini API and Cloud Functions.

### Environment Variables

This project uses environment variables for configuration. You'll need to set these up for the application to function correctly, especially for connecting to Firebase services and the Google Gemini API.

1.  **Create a local environment file:**
    Copy the example environment file `.env.example` to a new file named `.env.local` in the root of your project:
    ```bash
    cp .env.example .env.local
    ```

2.  **Configure `NEXT_PUBLIC_TRANSCRIPTION_FUNCTION_URL`:**
    Open your new `.env.local` file. You **must** update the `NEXT_PUBLIC_TRANSCRIPTION_FUNCTION_URL` variable. This URL points to your Firebase Cloud Function responsible for audio transcription.

    *   **If you have deployed your `transcribeAudioHttp` function to Firebase:**
        The URL will look something like:
        `https://<YOUR_REGION>-<YOUR_PROJECT_ID>.cloudfunctions.net/transcribeAudioHttp`
        Replace `<YOUR_REGION>` (e.g., `us-central1`) and `<YOUR_PROJECT_ID>` with your actual Firebase project details.

    *   **If you are running the Firebase emulator locally:**
        The URL will look something like:
        `http://127.0.0.1:5001/<YOUR_PROJECT_ID>/<YOUR_REGION>/transcribeAudioHttp`
        (Commonly `http://127.0.0.1:5001/your-project-id/us-central1/transcribeAudioHttp` if emulating in `us-central1`).

    Update the line in `.env.local`:
    ```env
    NEXT_PUBLIC_TRANSCRIPTION_FUNCTION_URL="YOUR_ACTUAL_FIREBASE_FUNCTION_URL_HERE"
    ```
    Replace `"YOUR_ACTUAL_FIREBASE_FUNCTION_URL_HERE"` with the correct URL.

3.  **Configure Google AI API Key (for Genkit):**
    If you are not using Application Default Credentials (ADC) (e.g., when running locally without gcloud auth or outside a GCP environment), you need to provide a `GOOGLE_API_KEY`.
    Add this to your `.env.local` file:
    ```env
    GOOGLE_API_KEY="YOUR_GOOGLE_AI_STUDIO_API_KEY"
    ```
    *Note: When deploying to Firebase Functions, ADC is often configured, and this key might not be needed directly in `.env.local` for the server-side functions environment.*

4.  **Other Firebase Configuration (Optional):**
    If you are using Firebase client-side features (like Auth, Firestore directly from client), you might need to populate other `NEXT_PUBLIC_FIREBASE_*` variables in `.env.local` based on your Firebase project settings.

**Important:** `.env.local` is gitignored by default and should not be committed to your repository as it may contain sensitive keys.

### Install Dependencies

```bash
npm install
# or
yarn install
```

## Development

### Running the Next.js App

To start the Next.js development server (frontend):

```bash
npm run dev
# or
yarn dev
```
This usually runs on `http://localhost:9002`.

### Running Firebase Emulators (including Functions)

To test Firebase Functions locally, including the `transcribeAudioHttp` function:

1.  Ensure you have the Firebase Emulators set up.
2.  Build your Cloud Functions TypeScript code:
    ```bash
    cd functions
    npm run build
    cd ..
    ```
3.  Start the emulators:
    ```bash
    firebase emulators:start --only functions,storage,firestore # Add other services if needed
    ```
    The Functions emulator typically serves HTTP functions at `http://127.0.0.1:5001`.

### Running Genkit Development Server (Optional)

If you are developing Genkit flows and want to use the Genkit developer UI:

```bash
npm run genkit:dev
# or for watch mode
npm run genkit:watch
```
This starts the Genkit development server, usually on `http://localhost:4000`.

## Building for Production

```bash
npm run build
# or
yarn build
```

## Deployment

### Deploying Firebase Functions

```bash
firebase deploy --only functions
```

### Deploying to Firebase Hosting

Ensure your `firebase.json` is configured to serve the Next.js static export (from `out` directory) or set up for SSR with Cloud Functions for Firebase / Cloud Run if needed. The current `firebase.json` is set up for a static export.

1.  Build the Next.js app for static export (if `output: 'export'` is in `next.config.ts`):
    ```bash
    npm run build
    ```
2.  Deploy to Firebase Hosting:
    ```bash
    firebase deploy --only hosting
    ```

## Key Project Structure

*   `src/app/`: Next.js App Router pages and layouts.
*   `src/components/`: Reusable React components.
*   `src/ai/`: Genkit AI flows and configurations.
    *   `src/ai/flows/`: Specific AI flow implementations.
    *   `src/ai/genkit.ts`: Genkit initialization.
    *   `src/ai/dev.ts`: Entry point for `genkit start`.
*   `functions/`: Firebase Cloud Functions.
    *   `functions/src/index.ts`: Main Cloud Functions file.
*   `public/`: Static assets.
*   `lib/`: Utility functions, types, and configurations.

Ensure environment variables are correctly set up in your Firebase project settings for deployed functions (e.g., `GOOGLE_API_KEY` if needed).


# Firebase Studio - Lexy AI Transcription Landing Page

This is a Next.js starter application for Lexy, an AI-powered transcription service, built in Firebase Studio. This version is configured as a **landing page only**.

To get started, take a look at `src/app/page.tsx`.

## Project Setup

### Prerequisites

*   Node.js (version specified in `package.json` or latest LTS)
*   npm or yarn

### Environment Variables

This project, in its landing page configuration, does not require specific environment variables beyond standard Next.js ones. If you previously had `.env.local` with `GOOGLE_API_KEY` or `NEXT_PUBLIC_TRANSCRIPTION_FUNCTION_URL`, these are no longer necessary for the landing page functionality.

1.  **Local environment file (Optional):**
    If you need to set Next.js specific environment variables, you can create a `.env.local` file.

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

## Building for Production

```bash
npm run build
# or
yarn build
```
This command will likely generate a static site in the `out` directory as per the current `next.config.ts` if `output: 'export'` is set (or can be added).

## Deployment

### Deploying to Firebase Hosting

Ensure your `firebase.json` is configured to serve the Next.js static export (from `out` directory). The current `firebase.json` is set up for this.

1.  Build the Next.js app for static export:
    ```bash
    npm run build
    ```
    (Ensure `output: 'export'` is in `next.config.ts` for a fully static site, or adapt deployment for Next.js SSR/ISR if needed, though a landing page is often static).

2.  Deploy to Firebase Hosting:
    ```bash
    firebase deploy --only hosting
    ```

## Key Project Structure (Landing Page Focus)

*   `src/app/`: Next.js App Router pages and layouts.
    *   `src/app/page.tsx`: The main landing page.
    *   `src/app/terms/page.tsx`: Terms and Conditions page.
    *   Other static content pages (e.g., privacy policy).
*   `src/components/`: Reusable React components.
    *   `src/components/landing/`: Components specific to the landing page sections.
    *   `src/components/layout/`: Header, Footer, AppLogo.
*   `public/`: Static assets (images, videos).
*   `lib/`: Utility functions, types, and configurations relevant to the landing page.
*   `.env.local`: Local environment variables (if any needed).

Functionalities like user authentication, dashboard, project editor, and AI transcription flows have been removed to focus on a landing page experience.

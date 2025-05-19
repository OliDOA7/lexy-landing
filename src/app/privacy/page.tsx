
export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center">Privacy Policy</h1>
        <p className="text-center text-muted-foreground mt-2">Last updated: May 2025</p>
      </header>

      <div className="prose prose-lg dark:prose-invert mx-auto max-w-3xl bg-card p-8 rounded-lg shadow-xl">
        <p>
          LexyAI values your privacy. We only collect and process data necessary to provide our transcription and translation services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What we collect:</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>User account info (name, email)</li>
          <li>Uploaded audio files</li>
          <li>Transcription results</li>
          <li>Usage data for service improvement</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How we use it:</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>To transcribe and translate user-submitted audio</li>
          <li>To improve service quality and performance</li>
          <li>For billing and account management</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What we never do:</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>We do not sell your data.</li>
          <li>We do not share your files or transcripts without consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Storage & Security:</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>All data is stored using Firebase's secure cloud infrastructure.</li>
          <li>Audio files and transcriptions are encrypted and access-controlled.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights:</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You may request data deletion at any time.</li>
          <li>You may export your transcripts and files via your account dashboard.</li>
        </ul>
      </div>
    </div>
  );
}

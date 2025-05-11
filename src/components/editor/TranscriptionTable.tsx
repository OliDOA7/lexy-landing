"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card"; // Added for consistent styling

interface TranscriptionTableProps {
  transcriptionHtml: string | null; // Expects a full HTML table string
  isLoading: boolean;
}

const TranscriptionTable = ({ transcriptionHtml, isLoading }: TranscriptionTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center p-6 text-muted-foreground bg-card rounded-lg shadow min-h-[200px] flex items-center justify-center">
        Loading transcription...
      </div>
    );
  }

  if (!transcriptionHtml) {
    return (
      <div className="text-center p-6 text-muted-foreground bg-card rounded-lg shadow min-h-[200px] flex items-center justify-center">
        No transcription data available. Click "Transcribe" to generate it or if an error occurred, try again.
      </div>
    );
  }

  // The HTML string should contain its own table structure (<thead>, <tbody>, etc.)
  // Style the container, not the table itself directly here unless targeting child elements.
  return (
    <Card className="shadow-md overflow-hidden">
      <ScrollArea className="h-[400px] w-full rounded-md bg-background">
        {/* 
          The table styles (border, cell padding) should ideally be part of the generated HTML
          or targeted via global CSS if consistent styling is needed for tables generated this way.
          For example, you could add a class to the generated table: <table class="generated-transcription-table">
          And then style .generated-transcription-table td, .generated-transcription-table th in globals.css
        */}
        <div 
          className="p-4 prose dark:prose-invert max-w-none [&_table]:w-full [&_table_td]:p-2 [&_table_th]:p-2 [&_table_th]:text-left [&_table_code]:bg-muted [&_table_code]:p-1 [&_table_code]:rounded"
          dangerouslySetInnerHTML={{ __html: transcriptionHtml }} 
        />
      </ScrollArea>
    </Card>
  );
};

export default TranscriptionTable;
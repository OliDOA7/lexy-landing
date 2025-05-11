
"use client";

import type { TranscriptionSegment } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptionTableProps {
  segments: TranscriptionSegment[];
  isLoading: boolean;
}

const TranscriptionTable = ({ segments, isLoading }: TranscriptionTableProps) => {
  if (isLoading) {
    return <div className="text-center p-4 text-muted-foreground">Loading transcription...</div>;
  }

  if (!segments || segments.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No transcription data available. Click "Transcribe" to generate it.</div>;
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border bg-card shadow">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[100px]">Timestamp</TableHead>
            <TableHead className="w-[150px]">Speaker</TableHead>
            <TableHead>Text</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segments.map((segment, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-sm">{segment.timestamp}</TableCell>
              <TableCell className="font-medium">{segment.speaker}</TableCell>
              {/* Use dangerouslySetInnerHTML for <u> tags. Ensure 'text' is sanitized if it comes from user input, 
                  but for AI output that we control the <u> tag usage, it's generally okay. */}
              <TableCell dangerouslySetInnerHTML={{ __html: segment.text }} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default TranscriptionTable;

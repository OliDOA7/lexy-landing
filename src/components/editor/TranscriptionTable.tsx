
"use client";

import type { TranscriptionRow } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface TranscriptionTableProps {
  data: TranscriptionRow[] | null;
  isLoading: boolean;
}

const TranscriptionTable = ({ data, isLoading }: TranscriptionTableProps) => {
  if (isLoading && !data) {
    return (
      <Card className="shadow-md min-h-[200px] flex flex-col items-center justify-center bg-card/50 border-dashed border-border border-2">
        <CardContent className="text-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Transcribing audio, please wait...</p>
          <p className="text-sm text-muted-foreground">This may take a few minutes depending on the audio length.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-md min-h-[200px] flex flex-col items-center justify-center bg-card/50 border-dashed border-border border-2">
         <CardContent className="text-center p-6">
          <p className="text-lg font-semibold text-muted-foreground">No transcription data available yet.</p>
          <p className="text-sm text-muted-foreground">Upload an audio file and click "Transcribe" to generate the transcript.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md overflow-hidden">
      <ScrollArea className="h-[500px] w-full rounded-md border bg-background">
        <Table>
          <TableCaption className="py-4">A list of transcribed audio segments.</TableCaption>
          <TableHeader className="sticky top-0 bg-muted/50 z-10">
            <TableRow>
              <TableHead className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Timestamp</TableHead>
              <TableHead className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Speaker</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Text</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border bg-background">
            {data.map((row, index) => (
              <TableRow key={index} className="hover:bg-muted/20">
                <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-sm text-foreground">
                  <code>{row.timestamp}</code>
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 font-medium text-sm text-foreground">{row.speaker}</TableCell>
                <TableCell 
                  className="px-4 py-3 text-sm text-foreground text-left"
                  dangerouslySetInnerHTML={{ __html: row.text }} 
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};

export default TranscriptionTable;

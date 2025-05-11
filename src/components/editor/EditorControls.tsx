
"use client";

import { Button } from "@/components/ui/button";
import { Save, XSquare, Send, Loader2, AlertTriangle } from "lucide-react"; // Send for Transcribe

interface EditorControlsProps {
  onTranscribe?: () => void; // Optional: only show if not yet transcribed
  onSave: () => void;
  onClose: () => void;
  isTranscribing: boolean;
  isSaving: boolean;
  canTranscribe: boolean; // Is there a file loaded and not yet transcribed?
  hasChanges?: boolean; // To enable/disable save button
  isError?: boolean; // To show an error state
  errorMessage?: string;
}

const EditorControls = ({
  onTranscribe,
  onSave,
  onClose,
  isTranscribing,
  isSaving,
  canTranscribe,
  hasChanges = true, // Default to true to enable save unless specified
  isError = false,
  errorMessage = "An error occurred.",
}: EditorControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-card border-t border-border rounded-b-lg">
      <div className="flex-grow">
        {isError && (
            <div className="flex items-center text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>{errorMessage}</span>
            </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} disabled={isTranscribing || isSaving}>
          <XSquare className="mr-2 h-4 w-4" />
          Close
        </Button>
        {onTranscribe && canTranscribe && (
          <Button onClick={onTranscribe} disabled={isTranscribing || isSaving || !canTranscribe}>
            {isTranscribing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Transcribe
          </Button>
        )}
        <Button onClick={onSave} disabled={isTranscribing || isSaving || !hasChanges || (onTranscribe && canTranscribe) /* Disable save if not yet transcribed */}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditorControls;

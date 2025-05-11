// This component might be redundant if CreateProjectModal handles the initial upload.
// If the editor page itself needs to handle a new upload for an existing project or a new one,
// then this component (or similar logic) would be used.
// For now, let's assume initial upload is via CreateProjectModal and editor page receives projectId.

"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import *_z from "zod"; // Renamed to avoid conflict if z is imported elsewhere
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const uploadSchema = _z.object({
  audioFile: _z.custom<FileList>()
    .refine(files => files && files.length > 0, "Audio file is required.")
    .refine(files => files && files[0]?.type.startsWith("audio/"), "File must be an audio type (MP3, WAV, M4A).")
    .refine(files => files && files[0]?.size <= 50 * 1024 * 1024, "File size must be 50MB or less."),
});

type UploadFormData = _z.infer<typeof uploadSchema>;

interface AudioUploadFormProps {
  onFileSelect: (file: File) => void; // To pass the file to the parent editor page
  isUploading: boolean;
}

const AudioUploadForm = ({ onFileSelect, isUploading }: AudioUploadFormProps) => {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const audioFileWatch = watch("audioFile");

  useState(() => {
    if (audioFileWatch && audioFileWatch.length > 0) {
      setFileName(audioFileWatch[0].name);
      onFileSelect(audioFileWatch[0]); // Callback on selection
    } else {
      setFileName(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioFileWatch]);


  // This form doesn't submit in a traditional sense, it just selects the file.
  // The actual "upload" or "transcribe" action will be triggered by a button on the editor page.
  const handleFormSubmit: SubmitHandler<UploadFormData> = (data) => {
     // This is more of a selection handler now.
     if (data.audioFile && data.audioFile.length > 0) {
        // onFileSelect is already called by useEffect.
        // This handler might not be strictly needed if the parent just observes the selected file.
     }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="audio-file-editor-input">Audio File</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-border hover:border-primary transition-colors">
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
            <div className="flex text-sm text-muted-foreground">
              <label
                htmlFor="audio-file-editor-input"
                className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              >
                <span>{fileName ? 'Change file' : 'Upload a file'}</span>
                <input 
                    id="audio-file-editor-input" 
                    type="file" 
                    className="sr-only" 
                    {...register("audioFile")} 
                    accept="audio/mpeg,audio/wav,audio/x-m4a,audio/m4a" 
                    disabled={isUploading}
                />
              </label>
              {!fileName && <p className="pl-1">or drag and drop</p>}
            </div>
            {fileName && <p className="text-xs text-accent pt-1">{fileName}</p>}
            {!fileName && <p className="text-xs text-muted-foreground">MP3, WAV, M4A up to 50MB</p>}
          </div>
        </div>
        {errors.audioFile && <p className="text-sm text-destructive mt-1">{errors.audioFile.message as string}</p>}
      </div>
      {/* The "Transcribe" button will be part of the main editor page, not this form */}
    </form>
  );
};

export default AudioUploadForm;

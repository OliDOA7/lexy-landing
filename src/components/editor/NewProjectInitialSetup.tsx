
"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, FileAudio } from "lucide-react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UploadAudioCardProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onTranscribe: () => void;
  isProcessing: boolean;
  projectLanguage: string;
}

const UploadAudioCard = ({ onFileSelect, selectedFile, onTranscribe, isProcessing, projectLanguage }: UploadAudioCardProps) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Upload Audio File</CardTitle>
        <CardDescription>Select an MP3, WAV, or M4A file to transcribe. Language: {projectLanguage}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Label htmlFor="audio-file-input" className="cursor-pointer">
              <UploadCloud className="mr-2 h-5 w-5" />
              {selectedFile ? selectedFile.name : "Choose File"}
            </Label>
          </Button>
          <Input
            id="audio-file-input"
            type="file"
            className="sr-only"
            accept="audio/mpeg,audio/wav,audio/x-m4a,audio/m4a"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </div>
        {selectedFile && (
            <p className="text-xs text-muted-foreground">Selected: {selectedFile.name} ({(selectedFile.size / (1024*1024)).toFixed(2)} MB)</p>
        )}
        <Button
          onClick={onTranscribe}
          disabled={!selectedFile || isProcessing}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Transcribe Audio
        </Button>
      </CardContent>
    </Card>
  );
};

interface InitialProjectSummaryCardProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  creationDateText: string;
  audioDurationText: string;
  spokenLanguagesText: string;
  isProcessing: boolean;
}

const InitialProjectSummaryCard = ({
  projectName,
  onProjectNameChange,
  creationDateText,
  audioDurationText,
  spokenLanguagesText,
  isProcessing,
}: InitialProjectSummaryCardProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Project Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="new-project-name">Project Name</Label>
          <Input
            id="new-project-name"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="Enter project name"
            className="mt-1 bg-background"
            disabled={isProcessing}
          />
        </div>
        <div>
          <Label>Creation Date</Label>
          <p className="text-sm text-muted-foreground mt-1">{creationDateText}</p>
        </div>
        <div>
          <Label>Audio Duration</Label>
          <p className="text-sm text-muted-foreground mt-1">{audioDurationText}</p>
        </div>
        <div>
          <Label>Spoken Languages</Label>
          <p className="text-sm text-muted-foreground mt-1">{spokenLanguagesText}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const AwaitingAudioPlaceholder = () => {
  return (
    <Card className="shadow-lg border-2 border-dashed border-border bg-card/50">
      <CardContent className="py-12 flex flex-col items-center justify-center text-center">
        <FileAudio className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground">Awaiting Audio</h3>
        <p className="text-muted-foreground mt-2 max-w-xs">
          Upload an audio file and click "Transcribe" to see the results and player here.
        </p>
      </CardContent>
    </Card>
  );
};


interface NewProjectInitialSetupProps {
  project: Project | null;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onTranscribe: () => void;
  isProcessing: boolean;
  editableProjectName: string;
  onProjectNameChange: (name: string) => void;
  audioDurationDisplay: string; 
}

const NewProjectInitialSetup = ({ 
    project, 
    onFileSelect, 
    selectedFile, 
    onTranscribe, 
    isProcessing,
    editableProjectName,
    onProjectNameChange,
    audioDurationDisplay
}: NewProjectInitialSetupProps) => {
  if (!project) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <p className="text-center text-muted-foreground mb-8 text-lg">
        Upload an audio file, name your project, then click "Transcribe Audio".
      </p>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <UploadAudioCard
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          onTranscribe={onTranscribe}
          isProcessing={isProcessing}
          projectLanguage={project.language}
        />
        <InitialProjectSummaryCard
          projectName={editableProjectName}
          onProjectNameChange={onProjectNameChange}
          creationDateText="Will be set upon saving"
          audioDurationText={selectedFile ? audioDurationDisplay : "N/A"}
          spokenLanguagesText={project.language === "auto" ? "Auto-detect" : project.language}
          isProcessing={isProcessing}
        />
      </div>
      <AwaitingAudioPlaceholder />
    </div>
  );
};

export default NewProjectInitialSetup;

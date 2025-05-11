
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { PlanConfig, Project, UserProfile } from "@/lib/types";
import { Loader2, UploadCloud } from "lucide-react";

const supportedLanguages = [
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "auto", label: "Auto-detect Language" },
];

const projectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters").max(100),
  language: z.string().min(1, "Please select a language"),
  audioFile: z.custom<FileList>()
    .refine(files => files && files.length > 0, "Audio file is required.")
    .refine(files => files && files[0]?.type.startsWith("audio/"), "File must be an audio type (MP3, WAV, M4A).")
    .refine(files => files && files[0]?.size <= 50 * 1024 * 1024, "File size must be 50MB or less."), // Example: 50MB limit
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onCreateProject is now onAddProject in DashboardPage, which returns project ID or null
  onAddProject: (projectData: Omit<Project, "id" | "ownerId" | "createdAt" | "status" | "storagePath" | "transcript" | "expiresAt"> & { audioFile: File }) => Promise<string | null>;
  user: UserProfile | null;
  currentPlanConfig: PlanConfig | null;
  projects: Project[]; 
}

const CreateProjectModal = ({ isOpen, onClose, onAddProject, user, currentPlanConfig, projects }: CreateProjectModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      language: "auto",
      audioFile: undefined,
    }
  });
  
  const audioFileWatch = watch("audioFile");

  useEffect(() => {
    if (audioFileWatch && audioFileWatch.length > 0) {
      setFileName(audioFileWatch[0].name);
    } else {
      setFileName(null);
    }
  }, [audioFileWatch]);

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    if (!user || !currentPlanConfig) {
      toast({ title: "Error", description: "User or plan data is missing.", variant: "destructive" });
      return;
    }

    if (currentPlanConfig.projectLimit !== null && projects.length >= currentPlanConfig.projectLimit) {
      toast({ title: "Limit Reached", description: "You've reached your project limit for the current plan.", variant: "destructive" });
      return;
    }
    
    const audioFile = data.audioFile[0];
    // Estimate duration: 1 minute per MB as a rough guide. More accurate on server.
    const estimatedDuration = Math.ceil(audioFile.size / (1024 * 1024)); 
    
    let limitExceeded = false;
    // Check minute limits (simplified for client-side, actual check might be more robust on server before processing)
    if (currentPlanConfig.minuteLimitDaily) {
        const dailyMinutesUsed = projects
            .filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString())
            .reduce((sum, p) => sum + p.duration, 0);
        if (dailyMinutesUsed + estimatedDuration > currentPlanConfig.minuteLimitDaily) {
            limitExceeded = true;
        }
    } else if (currentPlanConfig.minuteLimitMonthly) {
        const monthlyMinutesUsed = projects
            .filter(p => new Date(p.createdAt).getFullYear() === new Date().getFullYear() && new Date(p.createdAt).getMonth() === new Date().getMonth())
            .reduce((sum, p) => sum + p.duration, 0);
        if (monthlyMinutesUsed + estimatedDuration > currentPlanConfig.minuteLimitMonthly) {
            limitExceeded = true;
        }
    }

    if (limitExceeded) {
         toast({ title: "Potential Quota Exceeded", description: "This upload might exceed your plan's transcription minute limit.", variant: "destructive" });
         return;
    }

    setIsSubmitting(true);
    try {
      const newProjectId = await onAddProject({
        name: data.projectName,
        language: data.language,
        duration: estimatedDuration, 
        fileType: audioFile.type,
        fileSize: audioFile.size,
        audioFile: audioFile,
      });

      if (newProjectId) {
        // Navigation is handled by onAddProject's caller (DashboardPage)
        reset();
        onClose();
      } else {
        // Error handled by onAddProject, or generic message here
        toast({ title: "Creation Failed", description: "Could not create project. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Creation Failed", description: "An unexpected error occurred.", variant: "destructive" });
      console.error("Project creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { reset(); setFileName(null); onClose(); } }}>
      <DialogContent className="sm:max-w-[525px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Project</DialogTitle>
          <DialogDescription>
            Upload your audio file (MP3, WAV, M4A - Max 50MB) and provide details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input id="projectName" {...register("projectName")} placeholder="e.g., Weekly Team Meeting" className="mt-1 bg-background" />
            {errors.projectName && <p className="text-sm text-destructive mt-1">{errors.projectName.message}</p>}
          </div>

          <div>
            <Label htmlFor="language">Transcription Language</Label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} >
                  <SelectTrigger id="language" className="mt-1 bg-background">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.language && <p className="text-sm text-destructive mt-1">{errors.language.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="audioFile-input">Audio File</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-border hover:border-primary transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="flex text-sm text-muted-foreground">
                  <label
                    htmlFor="audioFile-input"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  >
                    <span>Upload a file</span>
                    <input id="audioFile-input" type="file" className="sr-only" {...register("audioFile")} accept="audio/mpeg,audio/wav,audio/x-m4a,audio/m4a" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {fileName && <p className="text-xs text-accent pt-1">{fileName}</p>}
                {!fileName && <p className="text-xs text-muted-foreground">MP3, WAV, M4A up to 50MB</p>}
              </div>
            </div>
            {errors.audioFile && <p className="text-sm text-destructive mt-1">{errors.audioFile.message as string}</p>}
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => { reset(); setFileName(null); onClose();}}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Proceed to Editor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;

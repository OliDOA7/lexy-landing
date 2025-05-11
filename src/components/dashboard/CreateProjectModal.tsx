
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
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
import { Loader2 } from "lucide-react";

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
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (projectData: Pick<Project, "name" | "language">) => Promise<string | null>;
  user: UserProfile | null;
  currentPlanConfig: PlanConfig | null;
  projects: Project[];
}

const CreateProjectModal = ({ isOpen, onClose, onAddProject, user, currentPlanConfig, projects }: CreateProjectModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      language: "auto",
    }
  });

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    if (!user || !currentPlanConfig) {
      toast({ title: "Error", description: "User or plan data is missing.", variant: "destructive" });
      return;
    }

    if (currentPlanConfig.projectLimit !== null && projects.length >= currentPlanConfig.projectLimit) {
      toast({ title: "Limit Reached", description: "You've reached your project limit for the current plan.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newProjectId = await onAddProject({
        name: data.projectName,
        language: data.language,
      });

      if (newProjectId) {
        reset();
        onClose(); 
        // Navigation to editor page is handled in DashboardPage
      } else {
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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-[525px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Project</DialogTitle>
          <DialogDescription>
            Enter a name for your project and select the primary audio language. You'll upload the audio file in the editor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Controller
                name="projectName"
                control={control}
                render={({ field }) => <Input id="projectName" {...field} placeholder="e.g., Weekly Team Meeting" className="mt-1 bg-background" />}
            />
            {errors.projectName && <p className="text-sm text-destructive mt-1">{errors.projectName.message}</p>}
          </div>

          <div>
            <Label htmlFor="language">Primary Audio Language</Label>
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
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => { reset(); onClose();}}>Cancel</Button>
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

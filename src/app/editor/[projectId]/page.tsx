
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Project, TranscriptionSegment, UserProfile, ProjectStatus } from "@/lib/types";
import MediaPlayer from "@/components/editor/MediaPlayer";
import TranscriptionTable from "@/components/editor/TranscriptionTable";
import EditorControls from "@/components/editor/EditorControls";
import { useToast } from "@/hooks/use-toast";
import { transcribeAudio, TranscribeAudioInput } from "@/ai/flows/transcribe-audio-flow";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock functions for Firebase interactions - REPLACE WITH ACTUAL FIREBASE SDK CALLS
const mockFirebase = {
  // Simulate fetching a project from Firestore
  getProject: async (projectId: string, userId: string): Promise<Project | null> => {
    console.log(`Mock Firebase: Fetching project ${projectId} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Find in mock initial data or a temporary store if updated
    const project = (window as any).mockProjects?.find((p: Project) => p.id === projectId && p.ownerId === userId) || null;
    if (project) return {...project, createdAt: new Date(project.createdAt), expiresAt: project.expiresAt ? new Date(project.expiresAt) : undefined};
    return null;
  },
  // Simulate updating a project in Firestore
  updateProject: async (projectId: string, userId: string, updates: Partial<Project>): Promise<boolean> => {
    console.log(`Mock Firebase: Updating project ${projectId} for user ${userId} with`, updates);
    await new Promise(resolve => setTimeout(resolve, 500));
    if ((window as any).mockProjects) {
        const projectIndex = (window as any).mockProjects.findIndex((p: Project) => p.id === projectId && p.ownerId === userId);
        if (projectIndex !== -1) {
            (window as any).mockProjects[projectIndex] = { ...(window as any).mockProjects[projectIndex], ...updates };
            return true;
        }
    }
    return false;
  },
  // Simulate getting a downloadable URL from Firebase Storage
  getAudioUrl: async (storagePath?: string): Promise<string | undefined> => {
    if (!storagePath) return undefined;
    console.log(`Mock Firebase: Getting audio URL for ${storagePath}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would return a gs:// or https:// URL.
    // For mock, let's assume a placeholder or a relative path if you have local mock audio.
    // Using picsum as placeholder for now. Replace with actual audio.
    if (storagePath.includes("mock-alpha.mp3")) return "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"; // Placeholder audio
    if (storagePath.includes("mock-beta.wav")) return "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";
    if (storagePath.includes("mock-gamma.mp3")) return "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";
    return `https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3`; // Default placeholder
  },
  // Mock current user (replace with actual Firebase Auth)
  getCurrentUser: async (): Promise<UserProfile | null> => {
    return { uid: "user123abc", name: "Demo User", email: "demo@example.com", planId: "starter" };
  }
};
// Initialize mock projects globally for persistence across mock calls (for demo only)
if (typeof window !== 'undefined' && !(window as any).mockProjects) {
    (window as any).mockProjects = [ // Simplified initial mock project for editor
        { id: "proj3", ownerId: "user123abc", name: "Lecture Recording - Gamma Initiative", duration: 5, language: "fr-FR", createdAt: new Date().toISOString(), status: "Uploaded", storagePath: "audio/user123abc/proj3/mock-gamma.mp3", fileType: "audio/mpeg", fileSize: 5242880, transcript: [], expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    ];
}


export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([]);
  
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errorState, setErrorState] = useState<{isError: boolean, message?: string}>({isError: false});


  useEffect(() => {
    async function fetchData() {
      setIsLoadingProject(true);
      setErrorState({isError: false});
      const user = await mockFirebase.getCurrentUser();
      setCurrentUser(user);

      if (user && projectId) {
        const fetchedProject = await mockFirebase.getProject(projectId, user.uid);
        if (fetchedProject) {
          setProject(fetchedProject);
          setTranscription(fetchedProject.transcript || []);
          if (fetchedProject.storagePath) {
            setIsLoadingAudio(true);
            const url = await mockFirebase.getAudioUrl(fetchedProject.storagePath);
            setAudioSrc(url);
            setIsLoadingAudio(false);
          }
        } else {
          toast({ title: "Error", description: "Project not found or access denied.", variant: "destructive" });
          setErrorState({isError: true, message: "Project not found or access denied."});
          // router.push("/dashboard"); // Optionally redirect
        }
      }
      setIsLoadingProject(false);
    }
    if (projectId) {
      fetchData();
    }
  }, [projectId, router, toast]);

  const handleTranscribe = async () => {
    if (!project || !project.storagePath || !currentUser) {
      toast({ title: "Error", description: "Project data or audio path missing.", variant: "destructive" });
      return;
    }
    if (project.status === "Completed" || project.status === "ProcessingTranscription") {
        toast({ title: "Info", description: "Transcription already processed or in progress.", variant: "default" });
        return;
    }

    setIsTranscribing(true);
    setErrorState({isError: false});
    await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ProcessingTranscription" as ProjectStatus });
    setProject(prev => prev ? {...prev, status: "ProcessingTranscription" as ProjectStatus} : null);

    try {
      // Ensure audioStoragePath is a URL Genkit can handle (HTTPS or data URI)
      // For mock, getAudioUrl provides a usable HTTPS URL
      const audioUrlForGenkit = await mockFirebase.getAudioUrl(project.storagePath);
      if (!audioUrlForGenkit) {
        throw new Error("Could not obtain a valid audio URL for transcription.");
      }

      const input: TranscribeAudioInput = {
        audioStoragePath: audioUrlForGenkit,
        languageHint: project.language === "auto" ? undefined : project.language,
      };
      const result = await transcribeAudio(input);
      setTranscription(result);
      setHasUnsavedChanges(true); // New transcript needs saving
      await mockFirebase.updateProject(projectId, currentUser.uid, { transcript: result, status: "Completed" as ProjectStatus });
      setProject(prev => prev ? {...prev, transcript: result, status: "Completed" as ProjectStatus} : null);
      toast({ title: "Transcription Complete", description: "Review and save your transcript." });
    } catch (error: any) {
      console.error("Transcription error:", error);
      toast({ title: "Transcription Failed", description: error.message || "An error occurred during transcription.", variant: "destructive" });
      setErrorState({isError: true, message: `Transcription Failed: ${error.message || "Unknown error"}`});
      await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ErrorTranscription" as ProjectStatus });
      setProject(prev => prev ? {...prev, status: "ErrorTranscription" as ProjectStatus} : null);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = async () => {
    if (!project || !currentUser) return;
    setIsSaving(true);
    setErrorState({isError: false});
    try {
      // Here, you might allow editing of transcription segments, then save them.
      // For now, we just save the existing `transcription` state.
      const success = await mockFirebase.updateProject(projectId, currentUser.uid, { transcript: transcription, status: "Completed" as ProjectStatus });
      if (success) {
        setHasUnsavedChanges(false);
        setProject(prev => prev ? {...prev, status: "Completed" as ProjectStatus} : null); // Reflect status change
        toast({ title: "Project Saved", description: "Your transcript has been saved." });
      } else {
        throw new Error("Failed to save project to database.");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast({ title: "Save Failed", description: error.message || "Could not save project.", variant: "destructive" });
      setErrorState({isError: true, message: `Save Failed: ${error.message || "Unknown error"}`});
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  if (isLoadingProject) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading project editor...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-destructive">Project Not Found</h1>
        <p className="text-muted-foreground mt-2">{errorState.message || "The project could not be loaded or you don't have access."}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-6">Go to Dashboard</Button>
      </div>
    );
  }

  const canTranscribe = project.status === "Uploaded" || project.status === "Draft" || project.status === "ErrorTranscription";


  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{project.name}</CardTitle>
          <CardDescription>
            Language: {project.language} | Duration: {project.duration} min | Status: <span className={`font-semibold ${project.status === 'Completed' ? 'text-green-500' : project.status.startsWith('Error') ? 'text-destructive' : 'text-blue-500'}`}>{project.status}</span>
            {project.expiresAt && <p className="text-xs text-muted-foreground mt-1">Audio file expires: {new Date(project.expiresAt).toLocaleDateString()}</p>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MediaPlayer audioSrc={audioSrc} isLoading={isLoadingAudio} />
          <TranscriptionTable segments={transcription} isLoading={isTranscribing} />
        </CardContent>
         <EditorControls
            onTranscribe={handleTranscribe}
            onSave={handleSave}
            onClose={handleClose}
            isTranscribing={isTranscribing}
            isSaving={isSaving}
            canTranscribe={!!project.storagePath && canTranscribe && !isTranscribing}
            hasChanges={hasUnsavedChanges}
            isError={errorState.isError}
            errorMessage={errorState.message}
          />
      </Card>
    </div>
  );
}

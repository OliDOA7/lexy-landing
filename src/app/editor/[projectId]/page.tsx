
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Project, TranscriptionSegment, UserProfile, ProjectStatus } from "@/lib/types";
import MediaPlayer from "@/components/editor/MediaPlayer";
import TranscriptionTable from "@/components/editor/TranscriptionTable";
import { useToast } from "@/hooks/use-toast";
import { transcribeAudio, TranscribeAudioInput } from "@/ai/flows/transcribe-audio-flow";
import { Loader2, Save, XSquare, Send, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock functions for Firebase interactions - REPLACE WITH ACTUAL FIREBASE SDK CALLS
const mockFirebase = {
  // Simulate fetching a project from Firestore
  getProject: async (projectId: string, userId: string): Promise<Project | null> => {
    console.log(`Mock Firebase: Fetching project ${projectId} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (typeof window !== 'undefined' && (window as any).mockProjects) {
      const projectFromGlobalStore = (window as any).mockProjects.find((p: any) => p.id === projectId && p.ownerId === userId);
      if (projectFromGlobalStore) {
        // Ensure dates are re-hydrated to Date objects
        return {
          ...projectFromGlobalStore,
          createdAt: new Date(projectFromGlobalStore.createdAt),
          expiresAt: projectFromGlobalStore.expiresAt ? new Date(projectFromGlobalStore.expiresAt) : undefined,
          // transcript should already be in the correct format
        };
      }
    }
    return null;
  },
  // Simulate updating a project in Firestore
  updateProject: async (projectId: string, userId: string, updates: Partial<Project>): Promise<boolean> => {
    console.log(`Mock Firebase: Updating project ${projectId} for user ${userId} with`, updates);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (typeof window !== 'undefined' && (window as any).mockProjects) {
        const projectIndex = (window as any).mockProjects.findIndex((p: any) => p.id === projectId && p.ownerId === userId);
        if (projectIndex !== -1) {
            // Prepare updates, ensuring dates are stored as ISO strings in the global mock
            const updatesForGlobalStore: any = { ...updates };
            if (updates.createdAt instanceof Date) {
              updatesForGlobalStore.createdAt = updates.createdAt.toISOString();
            }
            if (updates.expiresAt instanceof Date) {
              updatesForGlobalStore.expiresAt = updates.expiresAt.toISOString();
            }
            
            (window as any).mockProjects[projectIndex] = { 
              ...(window as any).mockProjects[projectIndex], 
              ...updatesForGlobalStore 
            };
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
    // Using a known accessible audio file for testing the transcription flow.
    // This URL should be a longer, more complex audio for proper testing of the prompt.
    // For now, using a common sample. In a real app, this would be a signed URL to the user's uploaded file.
    return "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"; // A reliable short audio sample
  },
  // Mock current user (replace with actual Firebase Auth)
  getCurrentUser: async (): Promise<UserProfile | null> => {
    return { uid: "user123abc", name: "Demo User", email: "demo@example.com", planId: "starter" };
  }
};

// Initialize (window as any).mockProjects as an empty array if it's not already defined.
if (typeof window !== 'undefined' && !(window as any).mockProjects) {
    (window as any).mockProjects = []; 
}


export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const searchParams = useSearchParams();
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


  // Initial data fetching
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
            setAudioSrc(url); // This URL will be used by MediaPlayer AND for transcription
            setIsLoadingAudio(false);
          }
        } else {
          toast({ title: "Error", description: "Project not found or access denied.", variant: "destructive" });
          setErrorState({isError: true, message: "Project not found or access denied."});
        }
      }
      setIsLoadingProject(false);
    }
    if (projectId) {
      fetchData();
    }
  }, [projectId, toast]);

  const memoizedHandleTranscribe = useCallback(async () => {
    if (!project || !currentUser) { // Audio source for transcription comes from audioSrc now
      toast({ title: "Error", description: "Project data or audio source missing for transcription.", variant: "destructive" });
      return;
    }
     if (!audioSrc) { // Check if audioSrc (the URL for the model) is available
      toast({ title: "Error", description: "Audio URL not available for transcription.", variant: "destructive" });
      return;
    }
    
    if (project.status === "Completed" || project.status === "ProcessingTranscription") {
        console.log("Auto-transcribe skipped: Project already processed or in progress.");
        if (searchParams.get('new') === 'true') {
            router.replace(`/editor/${projectId}`, { shallow: true });
        }
        return;
    }

    setIsTranscribing(true);
    setErrorState({isError: false});
    setTranscription([]); // Clear previous transcription if any
    toast({
        title: "Transcription Initiated",
        description: `"${project.name}" is now being transcribed. This may take a few minutes.`,
    });

    await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ProcessingTranscription" as ProjectStatus });
    setProject(prev => prev ? {...prev, status: "ProcessingTranscription" as ProjectStatus} : null);

    try {
      // Ensure audioSrc is used for Genkit flow as it's the accessible URL.
      const input: TranscribeAudioInput = {
        audioStoragePath: audioSrc, // Use the media-player-ready URL
        languageHint: project.language === "auto" ? undefined : project.language,
      };
      
      const result = await transcribeAudio(input); // Actual call to Genkit flow
      
      setTranscription(result);
      setHasUnsavedChanges(true); // Mark changes to be saved
      
      // Update project in mock DB with new transcript and status
      await mockFirebase.updateProject(projectId, currentUser.uid, { transcript: result, status: "Completed" as ProjectStatus });
      setProject(prev => prev ? {...prev, transcript: result, status: "Completed" as ProjectStatus} : null);
      
      toast({ title: "Transcription Complete", description: "Review and save your transcript." });

    } catch (error: any) {
      console.error("Transcription error:", error);
      let errorMessage = "An error occurred during transcription.";
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({ title: "Transcription Failed", description: errorMessage, variant: "destructive" });
      setErrorState({isError: true, message: `Transcription Failed: ${errorMessage}`});
      
      // Update project status to ErrorTranscription in mock DB
      await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ErrorTranscription" as ProjectStatus });
      setProject(prev => prev ? {...prev, status: "ErrorTranscription" as ProjectStatus} : null);
    } finally {
      setIsTranscribing(false);
       if (searchParams.get('new') === 'true') {
         router.replace(`/editor/${projectId}`, { shallow: true }); // Remove ?new=true after processing
      }
    }
  }, [project, currentUser, projectId, toast, router, searchParams, audioSrc]); // Added audioSrc dependency


  // Auto-transcription for new projects
  useEffect(() => {
    const isNewProject = searchParams.get('new') === 'true';

    if (
      isNewProject &&
      project && 
      project.status === "Uploaded" && 
      currentUser && 
      audioSrc && // Ensure audioSrc is loaded before attempting auto-transcription
      !isLoadingProject && 
      !isTranscribing 
    ) {
      memoizedHandleTranscribe();
    }
  }, [project, currentUser, isLoadingProject, isTranscribing, searchParams, projectId, memoizedHandleTranscribe, audioSrc]); // Added audioSrc


  const handleSave = async () => {
    if (!project || !currentUser) return;
    setIsSaving(true);
    setErrorState({isError: false});
    try {
      // Ensure the status is updated correctly, e.g., to 'Completed' or 'Draft' if user edited a completed one
      const newStatus = project.status === "ErrorTranscription" && transcription.length > 0 ? "Completed" : project.status;
      const success = await mockFirebase.updateProject(projectId, currentUser.uid, { transcript: transcription, status: newStatus as ProjectStatus });
      if (success) {
        setHasUnsavedChanges(false);
        setProject(prev => prev ? {...prev, status: newStatus as ProjectStatus, transcript: transcription} : null); 
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
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Project Not Found</h1>
        <p className="text-muted-foreground mt-2">{errorState.message || "The project could not be loaded or you don't have access."}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-6">Go to Dashboard</Button>
      </div>
    );
  }
  
  const showTranscribeButton = project && (project.status === "Uploaded" || project.status === "ErrorTranscription") && audioSrc && !isTranscribing;
  const disableSaveButton = isTranscribing || isSaving || !hasUnsavedChanges || (project.status !== 'Completed' && project.status !== 'Draft' && project.status !== "ErrorTranscription") ;


  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-2xl md:text-3xl">{project.name}</CardTitle>
              <CardDescription>
                Language: {project.language} | Duration: {project.duration} min | Status: <span className={`font-semibold ${project.status === 'Completed' ? 'text-green-500' : project.status.startsWith('Error') ? 'text-destructive' : project.status === 'ProcessingTranscription' ? 'text-blue-500 animate-pulse' : 'text-blue-500'}`}>{project.status}</span>
                {project.expiresAt && <p className="text-xs text-muted-foreground mt-1">Audio file expires: {new Date(project.expiresAt).toLocaleDateString()}</p>}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0 self-start sm:self-center">
              <Button variant="outline" onClick={handleClose} disabled={isTranscribing || isSaving}>
                <XSquare className="mr-2 h-4 w-4" />
                Close
              </Button>
              {showTranscribeButton && (
                <Button onClick={memoizedHandleTranscribe} disabled={isTranscribing || isSaving || isLoadingAudio}>
                  <Send className="mr-2 h-4 w-4" />
                  Transcribe
                </Button>
              )}
               {isTranscribing && (
                <Button disabled={true}>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transcribing...
                </Button>
               )}
              <Button onClick={handleSave} disabled={disableSaveButton}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </div>
          {errorState.isError && (
              <div className="mt-4 flex items-center text-sm text-destructive p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{errorState.message || "An error occurred."}</span>
              </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <MediaPlayer audioSrc={audioSrc} isLoading={isLoadingAudio} />
          <TranscriptionTable segments={transcription} isLoading={isTranscribing && transcription.length === 0 && project.status === 'ProcessingTranscription'} />
        </CardContent>
      </Card>
    </div>
  );
}

    

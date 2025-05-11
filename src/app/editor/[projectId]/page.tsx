"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Project, TranscriptionSegment, UserProfile, ProjectStatus } from "@/lib/types";
import MediaPlayer from "@/components/editor/MediaPlayer";
import TranscriptionTable from "@/components/editor/TranscriptionTable";
import { useToast } from "@/hooks/use-toast";
// Removed direct import of transcribeAudio Genkit flow
import { Loader2, Save, XSquare, Send, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Placeholder for your deployed Firebase Cloud Function URL
const TRANSCRIPTION_FUNCTION_URL = "YOUR_CLOUD_FUNCTION_URL/transcribeAudioHttp"; // Replace this!


const mockFirebase = {
  getProject: async (projectId: string, userId: string): Promise<Project | null> => {
    console.log(`Mock Firebase: Fetching project ${projectId} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (typeof window !== 'undefined' && (window as any).mockProjects) {
      const projectFromGlobalStore = (window as any).mockProjects.find((p: any) => p.id === projectId && p.ownerId === userId);
      if (projectFromGlobalStore) {
        return {
          ...projectFromGlobalStore,
          createdAt: new Date(projectFromGlobalStore.createdAt),
          expiresAt: projectFromGlobalStore.expiresAt ? new Date(projectFromGlobalStore.expiresAt) : undefined,
          // transcript is now expected to be an HTML string or undefined initially
          transcript: projectFromGlobalStore.transcriptHtml || projectFromGlobalStore.transcript, // Prioritize transcriptHtml
        };
      }
    }
    return null;
  },
  updateProject: async (projectId: string, userId: string, updates: Partial<Project> & { transcriptHtml?: string }): Promise<boolean> => {
    console.log(`Mock Firebase: Updating project ${projectId} for user ${userId} with`, updates);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (typeof window !== 'undefined' && (window as any).mockProjects) {
        const projectIndex = (window as any).mockProjects.findIndex((p: any) => p.id === projectId && p.ownerId === userId);
        if (projectIndex !== -1) {
            const updatesForGlobalStore: any = { ...updates };
            if (updates.createdAt instanceof Date) {
              updatesForGlobalStore.createdAt = updates.createdAt.toISOString();
            }
            if (updates.expiresAt instanceof Date) {
              updatesForGlobalStore.expiresAt = updates.expiresAt.toISOString();
            }
            // If transcriptHtml is part of updates, store it. The `transcript` field in Project type might need to accommodate this.
            // For now, let's assume `transcript` stores the HTML string.
            if (updates.transcriptHtml) {
                updatesForGlobalStore.transcript = updates.transcriptHtml;
                delete updatesForGlobalStore.transcriptHtml; // Avoid duplicate storage if `transcript` field is overloaded
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
  // Updated getAudioUrl: Returns the gsPath for transcription and a placeholder HTTPS URL for MediaPlayer.
  // In a real app, you'd generate a signed URL from gsPath for MediaPlayer.
  getAudioUrl: async (storagePath?: string): Promise<{ playerSrc?: string, gsPath?: string }> => {
    if (!storagePath) return { playerSrc: undefined, gsPath: undefined };
    console.log(`Mock Firebase: Getting audio URL for ${storagePath}`);
    await new Promise(resolve => setTimeout(resolve, 300));

    // For MediaPlayer, an HTTPS URL is needed. This would typically be a signed URL.
    // For transcription via Cloud Function, the gs:// path is fine.
    const playerSrc = storagePath.startsWith("gs://") 
      ? "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" // Placeholder if gsPath
      : storagePath; // Assume it's already an HTTPS URL if not gs://

    return { playerSrc, gsPath: storagePath.startsWith("gs://") ? storagePath : undefined };
  },
  getCurrentUser: async (): Promise<UserProfile | null> => {
    return { uid: "user123abc", name: "Demo User", email: "demo@example.com", planId: "plus" };
  }
};

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
  const [mediaPlayerSrc, setMediaPlayerSrc] = useState<string | undefined>(undefined); // For <audio> tag
  const [transcriptionHtml, setTranscriptionHtml] = useState<string | null>(null); // Stores HTML table string
  
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
          // If transcript is already HTML (e.g. from previous save), use it.
          // The Project type's `transcript` field might be overloaded to store this HTML.
          if (typeof fetchedProject.transcript === 'string') {
            setTranscriptionHtml(fetchedProject.transcript);
          } else {
            // If transcript is an array (old format) or undefined, clear HTML.
            setTranscriptionHtml(null); 
          }
          
          if (fetchedProject.storagePath) {
            setIsLoadingAudio(true);
            const { playerSrc } = await mockFirebase.getAudioUrl(fetchedProject.storagePath);
            setMediaPlayerSrc(playerSrc);
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
    if (!project || !currentUser || !project.storagePath) {
      toast({ title: "Error", description: "Project data or audio storage path missing for transcription.", variant: "destructive" });
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
    setTranscriptionHtml(null); // Clear previous transcription HTML
    toast({
        title: "Transcription Initiated",
        description: `"${project.name}" is now being transcribed. This may take a few minutes.`,
    });

    await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ProcessingTranscription" as ProjectStatus });
    setProject(prev => prev ? {...prev, status: "ProcessingTranscription" as ProjectStatus} : null);

    try {
      if (TRANSCRIPTION_FUNCTION_URL === "YOUR_CLOUD_FUNCTION_URL/transcribeAudioHttp") {
        throw new Error("Firebase Cloud Function URL is not configured.");
      }

      const response = await fetch(TRANSCRIPTION_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioStoragePath: project.storagePath, // Send gs:// URI
          languageHint: project.language === "auto" ? undefined : project.language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown server error" }));
        throw new Error(errorData.message || `Transcription service failed with status: ${response.status}`);
      }
      
      const resultHtml = await response.text(); // Expecting HTML string directly
      
      setTranscriptionHtml(resultHtml);
      setHasUnsavedChanges(true);
      
      await mockFirebase.updateProject(projectId, currentUser.uid, { transcript: resultHtml, status: "Completed" as ProjectStatus });
      setProject(prev => prev ? {...prev, transcript: resultHtml, status: "Completed" as ProjectStatus} : null);
      
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
      
      await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ErrorTranscription" as ProjectStatus });
      setProject(prev => prev ? {...prev, status: "ErrorTranscription" as ProjectStatus} : null);
    } finally {
      setIsTranscribing(false);
       if (searchParams.get('new') === 'true') {
         router.replace(`/editor/${projectId}`, { shallow: true });
      }
    }
  }, [project, currentUser, projectId, toast, router, searchParams]);


  useEffect(() => {
    const isNewProject = searchParams.get('new') === 'true';

    if (
      isNewProject &&
      project && 
      project.status === "Uploaded" && 
      currentUser && 
      project.storagePath && // Ensure gsPath is available
      !isLoadingProject && 
      !isTranscribing 
    ) {
      memoizedHandleTranscribe();
    }
  }, [project, currentUser, isLoadingProject, isTranscribing, searchParams, projectId, memoizedHandleTranscribe]);


  const handleSave = async () => {
    if (!project || !currentUser || transcriptionHtml === null) return;
    setIsSaving(true);
    setErrorState({isError: false});
    try {
      const newStatus = project.status === "ErrorTranscription" && transcriptionHtml.length > 0 ? "Completed" : project.status;
      // Save HTML string to `transcript` field or a new `transcriptHtml` field.
      // The Project type definition might need adjustment if a new field is used.
      const success = await mockFirebase.updateProject(projectId, currentUser.uid, { transcript: transcriptionHtml, status: newStatus as ProjectStatus });
      if (success) {
        setHasUnsavedChanges(false);
        setProject(prev => prev ? {...prev, status: newStatus as ProjectStatus, transcript: transcriptionHtml} : null); 
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
  
  const showTranscribeButton = project && (project.status === "Uploaded" || project.status === "ErrorTranscription") && project.storagePath && !isTranscribing;
  // Allow saving if there are changes or if it's completed/draft and HTML is present
  const disableSaveButton = isTranscribing || isSaving || !hasUnsavedChanges || !transcriptionHtml || (project.status !== 'Completed' && project.status !== 'Draft' && project.status !== "ErrorTranscription") ;


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
          <MediaPlayer audioSrc={mediaPlayerSrc} isLoading={isLoadingAudio} />
          <TranscriptionTable transcriptionHtml={transcriptionHtml} isLoading={isTranscribing && transcriptionHtml === null && project.status === 'ProcessingTranscription'} />
        </CardContent>
      </Card>
    </div>
  );
}
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
    // Using picsum as placeholder for now. Replace with actual audio.
    if (storagePath.includes("mock-alpha.mp3")) return "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"; 
    if (storagePath.includes("mock-beta.wav")) return "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";
    if (storagePath.includes("mock-gamma.mp3")) return "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";
    // Fallback for dynamically created project paths
    return `https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3`; 
  },
  // Mock current user (replace with actual Firebase Auth)
  getCurrentUser: async (): Promise<UserProfile | null> => {
    return { uid: "user123abc", name: "Demo User", email: "demo@example.com", planId: "starter" };
  }
};

// Initialize (window as any).mockProjects as an empty array if it's not already defined.
// DashboardPage should be the primary initializer with actual mock data.
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
            setAudioSrc(url);
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
    if (!project || !project.storagePath || !currentUser) {
      toast({ title: "Error", description: "Project data or audio path missing for transcription.", variant: "destructive" });
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
    toast({
        title: "Transcription Initiated",
        description: `"${project.name}" is now being transcribed.`,
    });

    await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ProcessingTranscription" as ProjectStatus });
    setProject(prev => prev ? {...prev, status: "ProcessingTranscription" as ProjectStatus} : null);

    try {
      const audioUrlForGenkit = await mockFirebase.getAudioUrl(project.storagePath);
      if (!audioUrlForGenkit) {
        throw new Error("Could not obtain a valid audio URL for transcription.");
      }
      const input: TranscribeAudioInput = {
        audioStoragePath: audioUrlForGenkit,
        languageHint: project.language === "auto" ? undefined : project.language,
      };
      // Simulate transcription delay
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      const result: TranscriptionSegment[] = [
          { timestamp: "00:00:05", speaker: "Operator", text: "This call is from a correctional facility." },
          { timestamp: "00:00:10", speaker: "Speaker A", text: "Hello, this is a mock transcription result." },
          { timestamp: "00:00:15", speaker: "Speaker B", text: "Okay, I understand. This is <u>mock</u> data." }
      ];
      // const result = await transcribeAudio(input); // Actual call
      setTranscription(result);
      setHasUnsavedChanges(true);
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
       if (searchParams.get('new') === 'true') {
         router.replace(`/editor/${projectId}`, { shallow: true }); // Remove ?new=true after processing
      }
    }
  }, [project, currentUser, projectId, toast, router, searchParams]);


  // Auto-transcription for new projects
  useEffect(() => {
    const isNewProject = searchParams.get('new') === 'true';

    if (
      isNewProject &&
      project && 
      project.status === "Uploaded" && 
      currentUser && 
      !isLoadingProject && 
      !isTranscribing 
    ) {
      memoizedHandleTranscribe();
      // router.replace(`/editor/${projectId}`, { shallow: true }); // Moved to finally block of memoizedHandleTranscribe
    }
  }, [project, currentUser, isLoadingProject, isTranscribing, searchParams, projectId, memoizedHandleTranscribe]);


  const handleSave = async () => {
    if (!project || !currentUser) return;
    setIsSaving(true);
    setErrorState({isError: false});
    try {
      const success = await mockFirebase.updateProject(projectId, currentUser.uid, { transcript: transcription, status: "Completed" as ProjectStatus });
      if (success) {
        setHasUnsavedChanges(false);
        setProject(prev => prev ? {...prev, status: "Completed" as ProjectStatus} : null); 
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
  
  const showTranscribeButton = project && (project.status === "Uploaded" || project.status === "ErrorTranscription") && project.storagePath;
  const disableSaveButton = isTranscribing || isSaving || !hasUnsavedChanges || (project.status !== 'Completed' && project.status !== 'Draft' && project.status !== "ErrorTranscription" /* Allow saving even if transcription errored if user manually edits */) ;


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
                  {isTranscribing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Transcribe
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

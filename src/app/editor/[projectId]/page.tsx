
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
            // Ensure dates are correctly handled if they are stringified
            if (updates.createdAt && typeof updates.createdAt === 'string') {
              (window as any).mockProjects[projectIndex].createdAt = new Date(updates.createdAt);
            }
            if (updates.expiresAt && typeof updates.expiresAt === 'string') {
              (window as any).mockProjects[projectIndex].expiresAt = new Date(updates.expiresAt);
            }
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

// Initialize mock projects globally for persistence across mock calls (for demo only)
if (typeof window !== 'undefined' && !(window as any).mockProjects) {
    (window as any).mockProjects = [ 
        { id: "proj1", ownerId: "user123abc", name: "Client Interview - Alpha Project", duration: 15, language: "en-US", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: "Completed", storagePath: "audio/user123abc/proj1/mock-alpha.mp3", transcript: [{timestamp: "00:00:10", speaker: "Speaker A", text: "This is a transcript for the Alpha project..."}], fileType: "audio/mpeg", fileSize: 15728640, expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "proj2", ownerId: "user123abc", name: "Internal Brainstorming Session - Project Beta", duration: 45, language: "es-ES", createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), status: "ProcessingTranscription", storagePath: "audio/user123abc/proj2/mock-beta.wav", fileType: "audio/wav", fileSize: 47185920, expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "proj3", ownerId: "user123abc", name: "Lecture Recording - Gamma Initiative", duration: 5, language: "fr-FR", createdAt: new Date().toISOString(), status: "Uploaded", storagePath: "audio/user123abc/proj3/mock-gamma.mp3", fileType: "audio/mpeg", fileSize: 5242880, transcript: [], expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    ];
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
      const result = await transcribeAudio(input);
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
    }
  }, [project, currentUser, projectId, toast, setProject, setTranscription, setIsTranscribing, setErrorState, setHasUnsavedChanges, router, searchParams]);


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
      router.replace(`/editor/${projectId}`, { shallow: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, currentUser, isLoadingProject, isTranscribing, searchParams, projectId, router, memoizedHandleTranscribe]);


  const handleSave = async () => {
    if (!project || !currentUser) return;
    setIsSaving(true);
    setErrorState({isError: false});
    try {
      // Simulate saving transcript to Firestore. Audio is assumed to be in Storage.
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
        <h1 className="text-2xl font-semibold text-destructive">Project Not Found</h1>
        <p className="text-muted-foreground mt-2">{errorState.message || "The project could not be loaded or you don't have access."}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-6">Go to Dashboard</Button>
      </div>
    );
  }
  
  const showTranscribeButton = project && (project.status === "Uploaded" || project.status === "ErrorTranscription") && project.storagePath;
  const disableSaveButton = isTranscribing || isSaving || !hasUnsavedChanges || (project.status !== 'Completed' && project.status !== 'Draft');


  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
              <CardTitle className="text-2xl md:text-3xl">{project.name}</CardTitle>
              <CardDescription>
                Language: {project.language} | Duration: {project.duration} min | Status: <span className={`font-semibold ${project.status === 'Completed' ? 'text-green-500' : project.status.startsWith('Error') ? 'text-destructive' : 'text-blue-500'}`}>{project.status}</span>
                {project.expiresAt && <p className="text-xs text-muted-foreground mt-1">Audio file expires: {new Date(project.expiresAt).toLocaleDateString()}</p>}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0 self-start sm:self-center">
              <Button variant="outline" onClick={handleClose} disabled={isTranscribing || isSaving}>
                <XSquare className="mr-2 h-4 w-4" />
                Close
              </Button>
              {showTranscribeButton && (
                <Button onClick={memoizedHandleTranscribe} disabled={isTranscribing || isSaving}>
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
          <TranscriptionTable segments={transcription} isLoading={isTranscribing && transcription.length === 0} />
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Project, UserProfile, ProjectStatus } from "@/lib/types";
import MediaPlayer from "@/components/editor/MediaPlayer";
import TranscriptionTable from "@/components/editor/TranscriptionTable";
import NewProjectInitialSetup from "@/components/editor/NewProjectInitialSetup";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, XSquare, Send, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added import

// Replace with your actual deployed Firebase Cloud Function URL
// For local development, this would be like: 'http://127.0.0.1:5001/lexy-s8xiw/us-central1/transcribeAudioHttp'
const TRANSCRIPTION_FUNCTION_URL = process.env.NEXT_PUBLIC_TRANSCRIPTION_FUNCTION_URL || "YOUR_CLOUD_FUNCTION_URL_HERE/transcribeAudioHttp";


const mockFirebase = {
  getProject: async (projectId: string, userId: string): Promise<Project | null> => {
    console.log(`Mock Firebase: Fetching project ${projectId} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (typeof window !== 'undefined' && (window as any).mockProjects) {
      const projectFromGlobalStore = (window as any).mockProjects.find((p: any) => p.id === projectId && p.ownerId === userId);
      if (projectFromGlobalStore) {
        return {
          ...projectFromGlobalStore,
          createdAt: new Date(projectFromGlobalStore.createdAt),
          expiresAt: projectFromGlobalStore.expiresAt ? new Date(projectFromGlobalStore.expiresAt) : undefined,
          // Ensure transcript is correctly typed (string for HTML, or specific structure if parsed)
          transcript: projectFromGlobalStore.transcript, 
        };
      }
    }
    return null;
  },
  updateProject: async (projectId: string, userId: string, updates: Partial<Project>): Promise<boolean> => {
    console.log(`Mock Firebase: Updating project ${projectId} for user ${userId} with`, updates);
    await new Promise(resolve => setTimeout(resolve, 300));

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
            
            (window as any).mockProjects[projectIndex] = { 
              ...(window as any).mockProjects[projectIndex], 
              ...updatesForGlobalStore 
            };
            return true;
        }
    }
    return false;
  },
  getAudioUrl: async (storagePath?: string): Promise<{ playerSrc?: string, gsPath?: string }> => {
    if (!storagePath) return { playerSrc: undefined, gsPath: undefined };
    console.log(`Mock Firebase: Getting audio URL for ${storagePath}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    // In a real app, playerSrc would be a signed URL from the gsPath.
    // For mock, if it's a gsPath, use a placeholder. If it's already HTTPS, use it.
    const playerSrc = storagePath.startsWith("gs://") 
      ? `https://storage.googleapis.com/${storagePath.substring(5)}` // Basic mock conversion
      : storagePath; 
    return { playerSrc, gsPath: storagePath.startsWith("gs://") ? storagePath : undefined };
  },
  getCurrentUser: async (): Promise<UserProfile | null> => {
    return { uid: "user123abc", name: "Demo User", email: "demo@example.com", planId: "plus" };
  }
};

if (typeof window !== 'undefined' && !(window as any).mockProjects) {
    (window as any).mockProjects = []; 
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [mediaPlayerSrc, setMediaPlayerSrc] = useState<string | undefined>(undefined);
  const [transcriptionHtml, setTranscriptionHtml] = useState<string | null>(null);
  
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errorState, setErrorState] = useState<{isError: boolean, message?: string}>({isError: false});

  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const [editableProjectName, setEditableProjectName] = useState("");
  const [showInitialNewProjectUI, setShowInitialNewProjectUI] = useState(false);
  const [audioDurationDisplay, setAudioDurationDisplay] = useState("N/A");


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
          setEditableProjectName(fetchedProject.name);
          if (typeof fetchedProject.transcript === 'string') {
            setTranscriptionHtml(fetchedProject.transcript);
          } else {
            // If transcript is an array of segments (old format or error), handle appropriately
            // For now, setting to null if not a string (expecting HTML string)
            setTranscriptionHtml(null); 
          }
          
          const isNewProjectFlow = searchParams.get('new') === 'true';
          if (fetchedProject.status === "Draft" && isNewProjectFlow && !fetchedProject.storagePath) {
            setShowInitialNewProjectUI(true);
          } else if (fetchedProject.storagePath) {
            setShowInitialNewProjectUI(false);
            setIsLoadingAudio(true);
            const { playerSrc } = await mockFirebase.getAudioUrl(fetchedProject.storagePath);
            setMediaPlayerSrc(playerSrc);
            setIsLoadingAudio(false);
          } else {
             setShowInitialNewProjectUI(false); // Default to editor if not new/draft without storagePath
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
  }, [projectId, toast, searchParams]);


  useEffect(() => {
    if (selectedFileForUpload) {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(selectedFileForUpload);
        audio.onloadedmetadata = () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            setAudioDurationDisplay(`${minutes}m ${seconds}s`);
            // Revoke object URL to free up resources after getting duration
            URL.revokeObjectURL(audio.src);
        };
        audio.onerror = () => {
            setAudioDurationDisplay("Error reading duration");
            URL.revokeObjectURL(audio.src);
        }
    } else {
        setAudioDurationDisplay("N/A");
    }
  }, [selectedFileForUpload]);


  const callTranscriptionService = useCallback(async (
    projectDetails: Pick<Project, 'name' | 'language'>,
    audioInputPath: string // Can be gs:// path or data URI
  ) => {
    if (!currentUser) {
      toast({ title: "Error", description: "User data missing for transcription.", variant: "destructive" });
      setIsTranscribing(false);
      return;
    }
  
    setIsTranscribing(true);
    setErrorState({ isError: false });
    setTranscriptionHtml(null); // Clear previous transcription
    toast({
      title: "Transcription Initiated",
      description: `"${projectDetails.name}" is now being transcribed. This may take a few minutes.`,
    });
  
    // Update project status in mock DB if it's the current project
    if (project && project.id === projectId) {
      await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ProcessingTranscription" as ProjectStatus });
      setProject(prev => prev ? { ...prev, status: "ProcessingTranscription" as ProjectStatus } : null);
    }
  
    try {
      // Check if the URL is the generic placeholder.
      if (TRANSCRIPTION_FUNCTION_URL.includes("YOUR_CLOUD_FUNCTION_URL_HERE")) {
        console.error("Transcription Function URL is not configured. Please set NEXT_PUBLIC_TRANSCRIPTION_FUNCTION_URL in your .env file or .env.local file.");
        throw new Error("Transcription service URL is not configured. Check environment variables.");
      }
  
      const response = await fetch(TRANSCRIPTION_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioStoragePath: audioInputPath, // Use the provided audioInputPath
          languageHint: projectDetails.language === "auto" ? undefined : projectDetails.language,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = { message: errorText || "Unknown server error during transcription."};
        }
        console.error("Transcription service error response:", errorData);
        throw new Error(errorData.message || `Transcription service failed with status: ${response.status}`);
      }
      
      const resultHtml = await response.text();
      setTranscriptionHtml(resultHtml);
      setHasUnsavedChanges(true); // Mark changes to be saved
      
      // Update project with transcript and status in mock DB if it's the current project
      if (project && project.id === projectId) {
        await mockFirebase.updateProject(projectId, currentUser.uid, { transcript: resultHtml, status: "Completed" as ProjectStatus });
        setProject(prev => prev ? { ...prev, transcript: resultHtml, status: "Completed" as ProjectStatus } : null);
      }
      
      toast({ title: "Transcription Complete", description: "Review and save your transcript." });
  
    } catch (error: any) {
      console.error("Transcription error:", error);
      const errorMessage = error.message || "An error occurred during transcription.";
      toast({ title: "Transcription Failed", description: errorMessage, variant: "destructive" });
      setErrorState({ isError: true, message: `Transcription Failed: ${errorMessage}` });
      
      // Update project status to error in mock DB if it's the current project
      if (project && project.id === projectId) {
        await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ErrorTranscription" as ProjectStatus });
        setProject(prev => prev ? { ...prev, status: "ErrorTranscription" as ProjectStatus } : null);
      }
    } finally {
      setIsTranscribing(false);
      // If it was a new project flow, remove the query param
      if (searchParams.get('new') === 'true') {
        router.replace(`/editor/${projectId}`, { shallow: true }); 
      }
    }
  }, [projectId, currentUser, toast, router, searchParams, project]); // Added project to dependencies
  

  const handleInitialTranscribe = async () => {
    if (!selectedFileForUpload || !project || !currentUser) {
        toast({ title: "Missing Information", description: "Please select an audio file and ensure project details are set.", variant: "destructive" });
        return;
    }

    setIsTranscribing(true); // Indicate processing starts for UI responsiveness

    // 1. Update project name if changed (already done via state binding, will be saved with other updates)
    if (editableProjectName !== project.name) {
        await mockFirebase.updateProject(projectId, currentUser.uid, { name: editableProjectName });
        setProject(prev => prev ? { ...prev, name: editableProjectName } : null);
    }

    // 2. Prepare audio data (convert to data URI for transcription)
    let audioDataUri;
    try {
      audioDataUri = await fileToDataUri(selectedFileForUpload);
    } catch (error) {
      console.error("Error converting file to Data URI:", error);
      toast({ title: "File Error", description: "Could not read the selected audio file.", variant: "destructive" });
      setIsTranscribing(false);
      return;
    }
    
    // Mock "Upload" file and update project details in the mock database
    // The actual storagePath for the database record remains a gs:// path.
    const gsStoragePath = `gs://lexy-s8xiw.firebasestorage.app/audio/${currentUser.uid}/${projectId}/${selectedFileForUpload.name}`;
    
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(selectedFileForUpload); // Use object URL for duration calculation
    
    const getDuration = new Promise<number>((resolve, reject) => {
        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(audio.src); // Clean up object URL
            resolve(audio.duration);
        };
        audio.onerror = () => {
            URL.revokeObjectURL(audio.src); // Clean up object URL
            reject(new Error("Failed to load audio metadata for duration."));
        };
    });

    let durationSeconds;
    try {
        durationSeconds = await getDuration;
    } catch (error) {
        console.error(error);
        toast({ title: "Audio Error", description: "Could not determine audio duration.", variant: "destructive" });
        setIsTranscribing(false);
        return;
    }
    const durationMinutes = Math.ceil(durationSeconds / 60);

    const projectUpdates: Partial<Project> = {
        storagePath: gsStoragePath, // Store gs:// path in the mock DB
        fileType: selectedFileForUpload.type,
        fileSize: selectedFileForUpload.size,
        duration: durationMinutes,
        status: "Uploaded" as ProjectStatus, // Status before transcription call
        name: editableProjectName, // ensure name is updated
    };
    await mockFirebase.updateProject(projectId, currentUser.uid, projectUpdates);
    const updatedProjectForDb = { ...project, ...projectUpdates };
    setProject(updatedProjectForDb); // Reflect updates in local state
    
    // Update player source with a mock HTTPS URL for the player component
    const { playerSrc } = await mockFirebase.getAudioUrl(gsStoragePath);
    setMediaPlayerSrc(playerSrc);

    // 3. Call transcription service using the data URI
    // Pass only necessary details for transcription to callTranscriptionService
    await callTranscriptionService(
      { name: updatedProjectForDb.name, language: updatedProjectForDb.language },
      audioDataUri // Pass data URI for transcription
    );

    // 4. Switch UI
    setShowInitialNewProjectUI(false);
    // isTranscribing state is managed within callTranscriptionService
  };


  const handleSave = async () => {
    if (!project || !currentUser || transcriptionHtml === null) return;
    setIsSaving(true);
    setErrorState({isError: false});
    try {
      // Determine new status: if it was an error but now has transcript, it's completed.
      const newStatus = (project.status === "ErrorTranscription" && transcriptionHtml.length > 0) 
                        ? "Completed" 
                        : project.status;

      const success = await mockFirebase.updateProject(projectId, currentUser.uid, { 
          transcript: transcriptionHtml, 
          status: newStatus as ProjectStatus,
          name: editableProjectName // Save potentially edited name
      });

      if (success) {
        setHasUnsavedChanges(false);
        setProject(prev => prev ? {...prev, status: newStatus as ProjectStatus, transcript: transcriptionHtml, name: editableProjectName} : null); 
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
      // Consider using a more user-friendly confirmation dialog (e.g., ShadCN AlertDialog)
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  // Initial loading state for the entire page
  if (isLoadingProject) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading project editor...</p>
      </div>
    );
  }
  
  // New project setup UI
  if (showInitialNewProjectUI && project) {
    return (
        <NewProjectInitialSetup
            project={project}
            selectedFile={selectedFileForUpload}
            onFileSelect={setSelectedFileForUpload}
            onTranscribe={handleInitialTranscribe}
            isProcessing={isTranscribing} // Only pass isTranscribing for this initial step
            editableProjectName={editableProjectName}
            onProjectNameChange={setEditableProjectName}
            audioDurationDisplay={audioDurationDisplay}
        />
    );
  }

  // If project fetch failed or no project found
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
  
  // Main editor view
  const showManualTranscribeButton = project && 
    (project.status === "Uploaded" || project.status === "ErrorTranscription" || project.status === "Draft") && // Allow re-transcribe from Draft if audio exists
    project.storagePath && !isTranscribing && !showInitialNewProjectUI;

  const disableSaveButton = isTranscribing || isSaving || !hasUnsavedChanges || !transcriptionHtml || 
    (project.status !== 'Completed' && project.status !== 'Draft' && project.status !== "ErrorTranscription" && project.status !== "Uploaded");


  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
               <Input 
                  value={editableProjectName} 
                  onChange={(e) => {
                    setEditableProjectName(e.target.value);
                    if (project && e.target.value !== project.name) setHasUnsavedChanges(true);
                  }}
                  className="text-2xl md:text-3xl font-semibold p-1 border-0 focus-visible:ring-1 focus-visible:ring-primary mb-1 bg-transparent"
                  disabled={isTranscribing || isSaving}
                />
              <CardDescription>
                Language: {project.language} | Duration: {project.duration > 0 ? `${project.duration} min` : audioDurationDisplay !== 'N/A' ? audioDurationDisplay : 'N/A'} | Status: <span className={`font-semibold ${project.status === 'Completed' ? 'text-green-500' : project.status.startsWith('Error') ? 'text-destructive' : project.status === 'ProcessingTranscription' ? 'text-blue-500 animate-pulse' : 'text-blue-500'}`}>{project.status}</span>
                {project.expiresAt && <p className="text-xs text-muted-foreground mt-1">Audio file expires: {new Date(project.expiresAt).toLocaleDateString()}</p>}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0 self-start sm:self-center">
              <Button variant="outline" onClick={handleClose} disabled={isTranscribing || isSaving}>
                <XSquare className="mr-2 h-4 w-4" />
                Close
              </Button>
              {showManualTranscribeButton && (
                <Button onClick={() => {
                  if (project.storagePath) { // Ensure storagePath exists for re-transcription
                     callTranscriptionService(
                        { name: editableProjectName, language: project.language },
                        project.storagePath // Use GCS path for re-transcribe
                     );
                  } else {
                    toast({ title: "Error", description: "Audio file not found for re-transcription.", variant: "destructive"});
                  }
                }} disabled={isTranscribing || isSaving || isLoadingAudio}>
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

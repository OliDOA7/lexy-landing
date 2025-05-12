
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Project, UserProfile, ProjectStatus, TranscriptionRow } from "@/lib/types";
import MediaPlayer from "@/components/editor/MediaPlayer";
import TranscriptionTable from "@/components/editor/TranscriptionTable";
import NewProjectInitialSetup from "@/components/editor/NewProjectInitialSetup";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, XSquare, Send, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 

const PLACEHOLDER_FUNCTION_URL_SUBSTRING = "PASTE_YOUR_FUNCTION_URL_HERE";
const LEGACY_PLACEHOLDER_FUNCTION_URL_SUBSTRING = "YOUR_CLOUD_FUNCTION_URL_HERE";


const TRANSCRIPTION_FUNCTION_URL = process.env.NEXT_PUBLIC_TRANSCRIPTION_FUNCTION_URL || `${PLACEHOLDER_FUNCTION_URL_SUBSTRING}/transcribeAudioHttp`;


const mockFirebase = {
  getProject: async (projectId: string, userId: string): Promise<Project | null> => {
    console.log(`Mock Firebase: Fetching project ${projectId} for user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (typeof window !== 'undefined' && (window as any).mockProjects) {
      const projectFromGlobalStore = (window as any).mockProjects.find((p: any) => p.id === projectId && p.ownerId === userId);
      if (projectFromGlobalStore) {
        // Ensure transcript is an array of TranscriptionRow or undefined
        let transcriptData = projectFromGlobalStore.transcript;
        if (typeof transcriptData === 'string') { 
            // This case should ideally not happen if we consistently store arrays
            console.warn("Project transcript was a string, expected array. Clearing for safety.");
            transcriptData = undefined; 
        }

        return {
          ...projectFromGlobalStore,
          createdAt: new Date(projectFromGlobalStore.createdAt),
          expiresAt: projectFromGlobalStore.expiresAt ? new Date(projectFromGlobalStore.expiresAt) : undefined,
          transcript: transcriptData, 
          detectedLanguages: projectFromGlobalStore.detectedLanguages || [],
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
            // Ensure transcript is stored correctly
            if (updates.transcript && Array.isArray(updates.transcript)) {
                updatesForGlobalStore.transcript = updates.transcript;
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
    const playerSrc = storagePath.startsWith("gs://") 
      ? `https://storage.googleapis.com/${storagePath.substring(5)}` // Basic conversion for mock
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
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionRow[] | null>(null); // Stores array of TranscriptionRow
  
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
          
          // Set transcriptionData from fetchedProject.transcript (should be TranscriptionRow[])
          if (Array.isArray(fetchedProject.transcript)) {
            setTranscriptionData(fetchedProject.transcript);
          } else {
            // Handle case where transcript might be old string format or null
            setTranscriptionData(null); 
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
             setShowInitialNewProjectUI(false); // Existing project but no audio yet, or error
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
            URL.revokeObjectURL(audio.src);
        };
        audio.onerror = () => {
            setAudioDurationDisplay("Error reading duration");
            URL.revokeObjectURL(audio.src);
        }
    } else if (project?.duration) {
        // Format duration from minutes to "Xm Ys" if needed, or just display minutes
        const totalSeconds = project.duration * 60;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        setAudioDurationDisplay(seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes} min`);
    }
     else {
        setAudioDurationDisplay("N/A");
    }
  }, [selectedFileForUpload, project]);


  const callTranscriptionService = useCallback(async (
    projectDetails: Pick<Project, 'name' | 'language'>,
    audioInputPath: string 
  ) => {
    if (!currentUser) {
      toast({ title: "Error", description: "User data missing for transcription.", variant: "destructive" });
      setIsTranscribing(false);
      return;
    }
  
    setIsTranscribing(true);
    setErrorState({ isError: false });
    setTranscriptionData(null); 
    toast({
      title: "Transcription Initiated",
      description: `"${projectDetails.name}" is now being transcribed. This may take a few minutes.`,
    });
  
    if (project && project.id === projectId) {
      await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ProcessingTranscription" as ProjectStatus });
      setProject(prev => prev ? { ...prev, status: "ProcessingTranscription" as ProjectStatus } : null);
    }
  
    try {
      if (TRANSCRIPTION_FUNCTION_URL.includes(PLACEHOLDER_FUNCTION_URL_SUBSTRING) || TRANSCRIPTION_FUNCTION_URL.includes(LEGACY_PLACEHOLDER_FUNCTION_URL_SUBSTRING)) {
        const errorMsg = `Transcription Function URL is not configured. Please set NEXT_PUBLIC_TRANSCRIPTION_FUNCTION_URL in your .env.local file, replacing the placeholder. Current URL: ${TRANSCRIPTION_FUNCTION_URL}`;
        console.error(errorMsg);
        throw new Error("Transcription service URL is not configured correctly. Please check your .env.local file and ensure the URL points to your deployed or emulated Firebase Function.");
      }
  
      const response = await fetch(TRANSCRIPTION_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioStoragePath: audioInputPath, 
          languageHint: projectDetails.language === "auto" ? undefined : projectDetails.language,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = { message: errorText || `Transcription service responded with status: ${response.status}`};
        }
        console.error("Transcription service error response:", errorData);
        throw new Error(errorData.message || `Transcription service failed with status: ${response.status}. Check Cloud Function logs for details.`);
      }
      
      const resultJson = await response.json(); // Expect JSON with transcriptionRows and detectedLanguages
      
      if (resultJson && resultJson.transcriptionRows) {
        setTranscriptionData(resultJson.transcriptionRows);
        setHasUnsavedChanges(true); 
        
        if (project && project.id === projectId) {
          await mockFirebase.updateProject(projectId, currentUser.uid, { 
            transcript: resultJson.transcriptionRows, 
            detectedLanguages: resultJson.detectedLanguages,
            status: "Completed" as ProjectStatus 
          });
          setProject(prev => prev ? { 
            ...prev, 
            transcript: resultJson.transcriptionRows, 
            detectedLanguages: resultJson.detectedLanguages,
            status: "Completed" as ProjectStatus 
          } : null);
        }
        toast({ title: "Transcription Complete", description: "Review and save your transcript." });
      } else {
        throw new Error("Transcription service returned an unexpected response format.");
      }
  
    } catch (error: any) {
      console.error("Transcription error:", error);
      const errorMessage = error.message || "An error occurred during transcription.";
      toast({ 
        title: "Transcription Failed", 
        description: `${errorMessage} Please ensure your Cloud Function is deployed and configured correctly. Check browser and Cloud Function logs for more details.`, 
        variant: "destructive",
        duration: 10000,
      });
      setErrorState({ isError: true, message: `Transcription Failed: ${errorMessage}` });
      
      if (project && project.id === projectId) {
        await mockFirebase.updateProject(projectId, currentUser.uid, { status: "ErrorTranscription" as ProjectStatus });
        setProject(prev => prev ? { ...prev, status: "ErrorTranscription" as ProjectStatus } : null);
      }
    } finally {
      setIsTranscribing(false);
      if (searchParams.get('new') === 'true') {
        // Remove 'new=true' from URL query params without full reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('new');
        router.replace(newUrl.pathname + newUrl.search, { shallow: true });
      }
    }
  }, [projectId, currentUser, toast, router, searchParams, project]); 
  

  const handleInitialTranscribe = async () => {
    if (!selectedFileForUpload || !project || !currentUser) {
        toast({ title: "Missing Information", description: "Please select an audio file and ensure project details are set.", variant: "destructive" });
        return;
    }

    setIsTranscribing(true); 

    if (editableProjectName !== project.name) {
        await mockFirebase.updateProject(projectId, currentUser.uid, { name: editableProjectName });
        setProject(prev => prev ? { ...prev, name: editableProjectName } : null);
    }

    let audioDataUri;
    try {
      audioDataUri = await fileToDataUri(selectedFileForUpload);
    } catch (error) {
      console.error("Error converting file to Data URI:", error);
      toast({ title: "File Error", description: "Could not read the selected audio file.", variant: "destructive" });
      setIsTranscribing(false);
      return;
    }
    
    const gsStoragePath = `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'lexy-s8xiw.firebasestorage.app'}/audio/${currentUser.uid}/${projectId}/${selectedFileForUpload.name}`;
    
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(selectedFileForUpload); 
    
    const getDuration = new Promise<number>((resolve, reject) => {
        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(audio.src); 
            resolve(audio.duration);
        };
        audio.onerror = () => {
            URL.revokeObjectURL(audio.src); 
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
        storagePath: gsStoragePath, 
        fileType: selectedFileForUpload.type,
        fileSize: selectedFileForUpload.size,
        duration: durationMinutes,
        status: "Uploaded" as ProjectStatus, 
        name: editableProjectName, 
    };
    await mockFirebase.updateProject(projectId, currentUser.uid, projectUpdates);
    const updatedProjectForDb = { ...project, ...projectUpdates }; // Ensure all fields are present
    setProject(updatedProjectForDb); 
    
    const { playerSrc } = await mockFirebase.getAudioUrl(gsStoragePath); // Simulate getting a playable URL
    setMediaPlayerSrc(playerSrc);

    // The Genkit flow `transcribe-audio-flow.ts` expects `audioStoragePath` as a URL or `gs://` path.
    // Using data URI for this example, but for production, upload to GCS first and pass gsStoragePath.
    await callTranscriptionService(
      { name: updatedProjectForDb.name, language: updatedProjectForDb.language },
      audioDataUri // Or gsStoragePath if cloud function reads from GCS
    );

    setShowInitialNewProjectUI(false);
  };


  const handleSave = async () => {
    if (!project || !currentUser || transcriptionData === null) return;
    setIsSaving(true);
    setErrorState({isError: false});
    try {
      const newStatus = (project.status === "ErrorTranscription" && transcriptionData.length > 0) 
                        ? "Completed" 
                        : project.status;

      const success = await mockFirebase.updateProject(projectId, currentUser.uid, { 
          transcript: transcriptionData, // Save array of TranscriptionRow
          status: newStatus as ProjectStatus,
          name: editableProjectName,
          // detectedLanguages might be saved if needed, currently handled in callTranscriptionService
      });

      if (success) {
        setHasUnsavedChanges(false);
        setProject(prev => prev ? {...prev, status: newStatus as ProjectStatus, transcript: transcriptionData, name: editableProjectName} : null); 
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
  
  if (showInitialNewProjectUI && project) {
    return (
        <NewProjectInitialSetup
            project={project}
            selectedFile={selectedFileForUpload}
            onFileSelect={setSelectedFileForUpload}
            onTranscribe={handleInitialTranscribe}
            isProcessing={isTranscribing} 
            editableProjectName={editableProjectName}
            onProjectNameChange={setEditableProjectName}
            audioDurationDisplay={audioDurationDisplay}
        />
    );
  }

  if (!project && !isLoadingProject) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-destructive">Project Not Found</h1>
        <p className="text-muted-foreground mt-2">{errorState.message || "The project could not be loaded or you don't have access."}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-6">Go to Dashboard</Button>
      </div>
    );
  }
  
  if (!project) return null;

  const showManualTranscribeButton = project && 
    (project.status === "Uploaded" || project.status === "ErrorTranscription" || project.status === "Draft") && 
    project.storagePath && !isTranscribing && !showInitialNewProjectUI;

  const disableSaveButton = isTranscribing || isSaving || !hasUnsavedChanges || !transcriptionData || 
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
                Language: {project.language} | Duration: {audioDurationDisplay} | Status: <span className={`font-semibold ${project.status === 'Completed' ? 'text-green-500' : project.status.startsWith('Error') ? 'text-destructive' : project.status === 'ProcessingTranscription' ? 'text-blue-500 animate-pulse' : 'text-blue-500'}`}>{project.status}</span>
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
                  if (project.storagePath) { 
                     callTranscriptionService(
                        { name: editableProjectName, language: project.language },
                        project.storagePath 
                     );
                  } else {
                    toast({ title: "Error", description: "Audio file path not found for re-transcription.", variant: "destructive"});
                  }
                }} disabled={isTranscribing || isSaving || isLoadingAudio}>
                  <Send className="mr-2 h-4 w-4" />
                  Transcribe
                </Button>
              )}
               {isTranscribing && project.status === 'ProcessingTranscription' && (
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
          <TranscriptionTable 
            data={transcriptionData} 
            isLoading={isTranscribing && transcriptionData === null && project.status === 'ProcessingTranscription'} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

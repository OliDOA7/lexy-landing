"use client";

import { useEffect, useState }from "react";
import UsageSummary from "@/components/dashboard/UsageSummary";
import ProjectsList from "@/components/dashboard/ProjectsList";
import type { UserProfile, Project, PlanConfig, ProjectStatus } from "@/lib/types";
import { PLANS_CONFIG } from "@/lib/config"; 
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";

// Mock user data - replace with actual auth logic
const mockUser: UserProfile = {
  uid: "user123abc",
  name: "Demo User",
  email: "demo@example.com",
  planId: "starter", 
};

// Mock projects data - this is the *initial* template / default set if global mock is empty
const mockProjectsInitial: Project[] = [
  {
    id: "proj1",
    ownerId: "user123abc",
    name: "Client Interview - Alpha Project",
    duration: 15, 
    language: "en-US",
    createdAt: new Date(Date.now() - 86400000 * 2), 
    status: "Completed",
    storagePath: "audio/user123abc/proj1/mock-alpha.mp3",
    transcript: [{timestamp: "00:00:10", speaker: "Speaker A", text: "This is a transcript for the Alpha project..."}],
    fileType: "audio/mpeg",
    fileSize: 15 * 1024 * 1024, 
    expiresAt: addDays(new Date(Date.now() - 86400000 * 2), PLANS_CONFIG.starter.storageDays || 0),
  },
  {
    id: "proj2",
    ownerId: "user123abc",
    name: "Internal Brainstorming Session - Project Beta",
    duration: 45,
    language: "es-ES",
    createdAt: new Date(Date.now() - 86400000 * 1), 
    status: "ProcessingTranscription",
    storagePath: "audio/user123abc/proj2/mock-beta.wav",
    fileType: "audio/wav",
    fileSize: 45 * 1024 * 1024,
    expiresAt: addDays(new Date(Date.now() - 86400000 * 1), PLANS_CONFIG.starter.storageDays || 0),
  },
  {
    id: "proj3",
    ownerId: "user123abc",
    name: "Lecture Recording - Gamma Initiative",
    duration: 5,
    language: "fr-FR",
    createdAt: new Date(),
    status: "Uploaded", 
    storagePath: "audio/user123abc/proj3/mock-gamma.mp3",
    fileType: "audio/mpeg",
    fileSize: 5 * 1024 * 1024,
    expiresAt: addDays(new Date(), PLANS_CONFIG.starter.storageDays || 0),
  },
];


export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlanConfig, setCurrentPlanConfig] = useState<PlanConfig | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Shorter delay
      
      setUser(mockUser); // Assume mockUser is fetched
      const planConfig = PLANS_CONFIG[mockUser.planId] || PLANS_CONFIG.free;
      setCurrentPlanConfig(planConfig);
      
      if (typeof window !== 'undefined') {
        if (!(window as any).mockProjects) {
          // Initialize global mock store if it doesn't exist.
          // Deep copy and ensure dates are handled correctly if they were strings.
          (window as any).mockProjects = mockProjectsInitial.map(p => ({
            ...p,
            createdAt: p.createdAt.toISOString(), // Store as ISO string in global mock
            expiresAt: p.expiresAt ? p.expiresAt.toISOString() : undefined,
          }));
        }
        
        // Always read from the global mock store for the dashboard's local state
        const globalMockProjects: any[] = (window as any).mockProjects || [];
        const userProjects = globalMockProjects
            .map((p: any) => ({ // Re-hydrate dates from ISO strings
                ...p,
                createdAt: new Date(p.createdAt),
                expiresAt: p.expiresAt ? new Date(p.expiresAt) : undefined,
            }))
            .filter((p: Project) => p.ownerId === mockUser.uid);
        setProjects(userProjects);
      }
      setIsLoading(false);
    };
    fetchData();

    const handleFocus = () => {
        // console.log("Dashboard focused, triggering refresh from global mock");
        setRefreshTrigger(prev => prev + 1); 
    };
    window.addEventListener('focus', handleFocus);
    return () => {
        window.removeEventListener('focus', handleFocus);
    };

  }, [refreshTrigger]); // Depend on refreshTrigger to re-run

  const handleAddProject = async (
    projectData: Omit<Project, "id" | "ownerId" | "createdAt" | "status" | "storagePath" | "transcript" | "expiresAt"> & { audioFile: File }
  ): Promise<string | null> => {
    if (!user || !currentPlanConfig) {
      toast({ title: "Error", description: "User or plan data is missing.", variant: "destructive" });
      return null;
    }

    setIsLoading(true); // Consider a more specific loading state like isCreatingProject
    const newProjectId = `proj${Date.now()}`;
    const storagePath = `audio/${user.uid}/${newProjectId}/${projectData.audioFile.name}`;
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    console.log(`Simulated upload of ${projectData.audioFile.name} to ${storagePath}`);

    const newProject: Project = {
      id: newProjectId,
      ownerId: user.uid,
      name: projectData.name,
      language: projectData.language,
      duration: projectData.duration, 
      createdAt: new Date(),
      status: "Uploaded" as ProjectStatus,
      storagePath: storagePath,
      fileType: projectData.fileType,
      fileSize: projectData.fileSize,
      expiresAt: addDays(new Date(), currentPlanConfig.storageDays ?? 0),
      transcript: [], 
    };

    // Update local state for immediate UI feedback
    setProjects(prevProjects => [newProject, ...prevProjects]);
    
    // Update global mock projects store
    if (typeof window !== 'undefined') {
        if (!(window as any).mockProjects) { (window as any).mockProjects = []; }
        // Store with ISO strings for dates for consistency if other parts serialize/deserialize
        (window as any).mockProjects.unshift({
            ...newProject,
            createdAt: newProject.createdAt.toISOString(),
            expiresAt: newProject.expiresAt ? newProject.expiresAt.toISOString() : undefined,
        });
    }

    setIsLoading(false);
    
    toast({
      title: "Project Created",
      description: `"${newProject.name}" created. Redirecting to editor for transcription...`,
    });
    router.push(`/editor/${newProjectId}?new=true`);
    return newProjectId;
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeletingProject(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update local state for immediate UI feedback
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));

    // Update global mock projects store
     if (typeof window !== 'undefined' && (window as any).mockProjects) {
        (window as any).mockProjects = (window as any).mockProjects.filter((p: any) => p.id !== projectId);
    }
    toast({ title: "Project Deleted", description: "The project has been removed." });
    setIsDeletingProject(false);
  };

  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const handleEditProject = (project: Project) => {
    router.push(`/editor/${project.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <UsageSummary user={user} projects={projects} currentPlanConfig={currentPlanConfig} />
      <ProjectsList
        user={user}
        projects={projects}
        isLoading={isLoading || isDeletingProject}
        currentPlanConfig={currentPlanConfig}
        onAddProject={handleAddProject} 
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
      />
    </div>
  );
}

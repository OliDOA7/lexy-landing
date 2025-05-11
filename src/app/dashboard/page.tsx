
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
  planId: "plus", 
};

// Removed mockProjectsInitial to stop generating dummy data


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
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      setUser(mockUser); 
      const planConfig = PLANS_CONFIG[mockUser.planId] || PLANS_CONFIG.free;
      setCurrentPlanConfig(planConfig);
      
      if (typeof window !== 'undefined') {
        // Initialize global mock store as an empty array if it doesn't exist.
        if (!(window as any).mockProjects) {
          (window as any).mockProjects = []; 
        }
        
        // Always read from the global mock store for the dashboard's local state
        const globalMockProjects: any[] = (window as any).mockProjects || [];
        const userProjects = globalMockProjects
            .map((p: any) => ({ 
                ...p,
                createdAt: new Date(p.createdAt), // Re-hydrate dates from ISO strings
                expiresAt: p.expiresAt ? new Date(p.expiresAt) : undefined,
            }))
            .filter((p: Project) => p.ownerId === mockUser.uid);
        setProjects(userProjects);
      }
      setIsLoading(false);
    };
    fetchData();

    const handleFocus = () => {
        setRefreshTrigger(prev => prev + 1); 
    };
    window.addEventListener('focus', handleFocus);
    return () => {
        window.removeEventListener('focus', handleFocus);
    };

  }, [refreshTrigger]); 

  const handleAddProject = async (
    projectData: Omit<Project, "id" | "ownerId" | "createdAt" | "status" | "storagePath" | "transcript" | "expiresAt"> & { audioFile: File }
  ): Promise<string | null> => {
    if (!user || !currentPlanConfig) {
      toast({ title: "Error", description: "User or plan data is missing.", variant: "destructive" });
      return null;
    }

    setIsLoading(true); 
    const newProjectId = `proj${Date.now()}`;
    // Updated storagePath to include the full gs:// URI
    const storagePath = `gs://lexy-s8xiw.firebasestorage.app/audio/${user.uid}/${newProjectId}/${projectData.audioFile.name}`;
    
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

    setProjects(prevProjects => [newProject, ...prevProjects]);
    
    if (typeof window !== 'undefined') {
        if (!(window as any).mockProjects) { (window as any).mockProjects = []; }
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

    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));

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


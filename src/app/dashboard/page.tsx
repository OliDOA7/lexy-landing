
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
        if (!(window as any).mockProjects) {
          (window as any).mockProjects = []; 
        }
        
        const globalMockProjects: any[] = (window as any).mockProjects || [];
        const userProjects = globalMockProjects
            .map((p: any) => ({ 
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
        setRefreshTrigger(prev => prev + 1); 
    };
    window.addEventListener('focus', handleFocus);
    return () => {
        window.removeEventListener('focus', handleFocus);
    };

  }, [refreshTrigger]); 

  const handleAddProject = async (
    projectData: Pick<Project, "name" | "language">
  ): Promise<string | null> => {
    if (!user || !currentPlanConfig) {
      toast({ title: "Error", description: "User or plan data is missing.", variant: "destructive" });
      return null;
    }

    setIsLoading(true); 
    const newProjectId = `proj${Date.now()}`;
    
    // Simulate a short delay for project creation
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const newProject: Project = {
      id: newProjectId,
      ownerId: user.uid,
      name: projectData.name,
      language: projectData.language,
      duration: 0, // Will be set after audio upload in editor
      createdAt: new Date(),
      status: "Draft" as ProjectStatus, // Initial status
      // storagePath, fileType, fileSize will be set in editor after file upload
      expiresAt: addDays(new Date(), currentPlanConfig.storageDays ?? 0), // Expiry based on plan
      transcript: [], 
    };

    setProjects(prevProjects => [newProject, ...prevProjects]);
    
    if (typeof window !== 'undefined') {
        if (!(window as any).mockProjects) { (window as any).mockProjects = []; }
        (window as any).mockProjects.unshift({
            ...newProject,
            createdAt: newProject.createdAt.toISOString(), // Store as ISO string
            expiresAt: newProject.expiresAt ? newProject.expiresAt.toISOString() : undefined,
        });
    }

    setIsLoading(false);
    
    toast({
      title: "Project Created",
      description: `"${newProject.name}" created. Redirecting to editor to upload audio...`,
    });
    router.push(`/editor/${newProjectId}?new=true`); // Indicate it's a new project
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



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

// Mock projects data - replace with Firestore fetching
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
    status: "Uploaded", // Changed status to Uploaded for editor flow
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      setUser(mockUser);
      const planConfig = PLANS_CONFIG[mockUser.planId] || PLANS_CONFIG.free;
      setCurrentPlanConfig(planConfig);
      
      setProjects(mockProjectsInitial.filter(p => p.ownerId === mockUser.uid));
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleAddProject = async (
    projectData: Omit<Project, "id" | "ownerId" | "createdAt" | "status" | "storagePath" | "transcript" | "expiresAt"> & { audioFile: File }
  ): Promise<string | null> => { // Return new project ID or null on failure
    if (!user || !currentPlanConfig) {
      toast({ title: "Error", description: "User or plan data is missing.", variant: "destructive" });
      return null;
    }

    setIsLoading(true);
    const newProjectId = `proj${Date.now()}`;
    const storagePath = `audio/${user.uid}/${newProjectId}/${projectData.audioFile.name}`;
    
    // Simulate file upload to Firebase Storage
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    console.log(`Simulated upload of ${projectData.audioFile.name} to ${storagePath}`);

    const newProject: Project = {
      id: newProjectId,
      ownerId: user.uid,
      name: projectData.name,
      language: projectData.language,
      duration: projectData.duration, // Estimated duration
      createdAt: new Date(),
      status: "Uploaded" as ProjectStatus,
      storagePath: storagePath,
      fileType: projectData.fileType,
      fileSize: projectData.fileSize,
      expiresAt: addDays(new Date(), currentPlanConfig.storageDays ?? 0),
      transcript: [], // Initialize with empty transcript
    };

    // Simulate adding to Firestore and update local state
    setProjects(prevProjects => [newProject, ...prevProjects]);
    setIsLoading(false);
    
    toast({
      title: "Project Created",
      description: `"${newProject.name}" created. Redirecting to editor...`,
    });
    router.push(`/editor/${newProjectId}`);
    return newProjectId;
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeletingProject(true);
    // Simulate project deletion from Firestore and Storage
    await new Promise(resolve => setTimeout(resolve, 500));
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    toast({ title: "Project Deleted", description: "The project has been removed." });
    setIsDeletingProject(false);
  };

  const [isDeletingProject, setIsDeletingProject] = useState(false);


  const handleEditProject = (project: Project) => {
    // Navigate to the editor page for this project
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
        onAddProject={handleAddProject} // Updated to return ID for navigation
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
      />
    </div>
  );
}

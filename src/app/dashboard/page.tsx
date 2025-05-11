
"use client";

import { useEffect, useState }from "react";
import UsageSummary from "@/components/dashboard/UsageSummary";
import ProjectsList from "@/components/dashboard/ProjectsList";
import type { UserProfile, Project, PlanConfig } from "@/lib/types";
import { PLANS_CONFIG } from "@/lib/config"; // Assuming plan configurations are here
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Mock user data - replace with actual auth logic
const mockUser: UserProfile = {
  uid: "user123abc",
  name: "Demo User",
  email: "demo@example.com",
  planId: "starter", // Default plan for mock
};

// Mock projects data - replace with Firestore fetching
const mockProjectsInitial: Project[] = [
  {
    id: "proj1",
    ownerId: "user123abc",
    name: "Client Interview - Alpha Project",
    duration: 15, // minutes
    language: "English (US)",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    status: "Completed",
    fileURL: "/audio/mock-alpha.mp3",
    transcript: "This is a transcript for the Alpha project...",
    fileType: "audio/mpeg",
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  {
    id: "proj2",
    ownerId: "user123abc",
    name: "Internal Brainstorming Session - Project Beta",
    duration: 45,
    language: "Spanish (Spain)",
    createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
    status: "Processing",
    fileURL: "/audio/mock-beta.wav",
    fileType: "audio/wav",
    fileSize: 45 * 1024 * 1024,
  },
  {
    id: "proj3",
    ownerId: "user123abc",
    name: "Lecture Recording - Gamma Initiative",
    duration: 5,
    language: "French (France)",
    createdAt: new Date(),
    status: "Draft",
    fileType: "audio/mpeg",
    fileSize: 5 * 1024 * 1024,
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
    // Simulate fetching user and project data
    const fetchData = async () => {
      setIsLoading(true);
      // In a real app, fetch user from Firebase Auth, then user's plan from Firestore
      // For now, use mockUser and derive plan config
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      setUser(mockUser);
      const planConfig = PLANS_CONFIG[mockUser.planId] || PLANS_CONFIG.free;
      setCurrentPlanConfig(planConfig);
      
      // Fetch projects for this user (mocked)
      setProjects(mockProjectsInitial.filter(p => p.ownerId === mockUser.uid));
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleAddProject = async (
    projectData: Omit<Project, "id" | "ownerId" | "createdAt" | "status" | "fileURL" | "transcript"> & { audioFile: File }
  ) => {
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    // Simulate project creation and adding to list
    const newProject: Project = {
      ...projectData,
      id: `proj${Date.now()}`, // Generate a unique ID
      ownerId: user.uid,
      createdAt: new Date(),
      status: "Processing", // Initial status
      // fileURL and transcript would be set after processing
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
    // Here you would typically upload file to storage and save metadata to Firestore
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
    
    // Simulate completion
    setProjects(prevProjects => prevProjects.map(p => p.id === newProject.id ? {...p, status: "Completed", transcript: "Mock transcript generated."} : p));
  };

  const handleDeleteProject = async (projectId: string) => {
    // Simulate project deletion
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    // Here you would delete from Firestore and storage
     await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleEditProject = (project: Project) => {
    // Navigate to an editor page or open an edit modal
    // For now, just log it or show a toast
    console.log("Editing project:", project);
    // Example: router.push(`/dashboard/edit-project/${project.id}`);
    toast({ title: "Edit Project", description: `Opening editor for ${project.name}... (Editor not implemented)`});
  };


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <UsageSummary user={user} projects={projects} currentPlanConfig={currentPlanConfig} />
      <ProjectsList
        user={user}
        projects={projects}
        isLoading={isLoading}
        currentPlanConfig={currentPlanConfig}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
      />
    </div>
  );
}

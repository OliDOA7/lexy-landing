
"use client";

import { useState } from "react";
import type { Project, UserProfile, PlanConfig } from "@/lib/types";
import ProjectItem from "./ProjectItem";
import CreateProjectModal from "./CreateProjectModal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FilePlus, Grip, List, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ProjectsListProps {
  user: UserProfile | null;
  projects: Project[];
  isLoading: boolean;
  currentPlanConfig: PlanConfig | null;
  onAddProject: (projectData: Omit<Project, "id" | "ownerId" | "createdAt" | "status" | "storagePath" | "transcript" | "expiresAt"> & { audioFile: File }) => Promise<string | null>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onEditProject: (project: Project) => void;
}

const ProjectsList = ({ user, projects, isLoading, currentPlanConfig, onAddProject, onDeleteProject, onEditProject }: ProjectsListProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleCreateNewProjectClick = () => {
    if (!user || !currentPlanConfig) {
         toast({ title: "Error", description: "Cannot create project. User or plan data missing.", variant: "destructive" });
        return;
    }
    if (currentPlanConfig.projectLimit !== null && projects.length >= currentPlanConfig.projectLimit) {
        toast({ title: "Project Limit Reached", description: `You can only create ${currentPlanConfig.projectLimit} projects on the ${currentPlanConfig.name} plan.`, variant: "destructive" });
        return;
    }
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteProject(projectToDelete);
      // Toast handled by DashboardPage
    } catch (error) {
      // Toast handled by DashboardPage if it throws, or generic here
      toast({ title: "Deletion Failed", description: "Could not delete project. Please try again.", variant: "destructive" });
      console.error("Deletion error:", error);
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  const openDeleteDialog = (projectId: string) => {
    setProjectToDelete(projectId);
  };
  
  const handleEdit = (project: Project) => {
    onEditProject(project); // This will navigate to the editor page
  };


  if (isLoading && projects.length === 0) { // Show loader only if projects are truly loading initially
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Your Projects</h2>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} aria-label="Grid view">
            <Grip className="h-5 w-5" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
            <List className="h-5 w-5" />
          </Button>
          <Button onClick={handleCreateNewProjectClick} className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <FilePlus className="h-5 w-5 mr-2" />
            Create New Project
          </Button>
        </div>
      </div>

      {isLoading && projects.length > 0 && ( // Inline loader when projects exist but are updating
        <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2 text-sm text-muted-foreground">Updating projects...</p>
        </div>
      )}

      {!isLoading && projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card">
          <FilePlus className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No projects yet.</h3>
          <p className="text-muted-foreground mb-6">Start by creating your first transcription project.</p>
          <Button onClick={handleCreateNewProjectClick} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
          {projects.map((project) => (
            <ProjectItem key={project.id} project={project} viewMode={viewMode} onEdit={() => handleEdit(project)} onDelete={() => openDeleteDialog(project.id)} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProject={onAddProject} // This prop is now correctly typed
        user={user}
        currentPlanConfig={currentPlanConfig}
        projects={projects}
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? All associated data will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectsList;

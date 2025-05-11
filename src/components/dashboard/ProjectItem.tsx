
"use client";

import type { Project } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit3, FileText, Globe, AlertTriangle, Trash2, MoreVertical, CheckCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectItemProps {
  project: Project;
  viewMode: "grid" | "list";
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

const ProjectItem = ({ project, viewMode, onEdit, onDelete }: ProjectItemProps) => {
  const getStatusBadgeVariant = (status: Project["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30";
      case "Processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30";
      case "Draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30";
      case "Error":
        return "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: Project["status"]) => {
    switch(status) {
      case "Completed": return <CheckCircle className="w-3 h-3 mr-1.5" />;
      case "Processing": return <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />;
      case "Draft": return <Edit3 className="w-3 h-3 mr-1.5" />;
      case "Error": return <AlertTriangle className="w-3 h-3 mr-1.5" />;
      default: return null;
    }
  }

  const formattedDate = formatDistanceToNow(new Date(project.createdAt), { addSuffix: true });

  if (viewMode === "grid") {
    return (
      <Card className="bg-card shadow-lg hover:shadow-primary/20 transition-shadow duration-300 flex flex-col h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg mb-1 text-primary-foreground line-clamp-2">{project.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project.id)} className="cursor-pointer">
                  <Edit3 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="text-xs text-muted-foreground">{formattedDate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm flex-grow">
          <div className="flex items-center text-muted-foreground">
            <FileText className="w-4 h-4 mr-2 text-accent" />
            <span>{project.duration} min{project.duration > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Globe className="w-4 h-4 mr-2 text-accent" />
            <span>{project.language}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-4">
           <Badge variant="outline" className={`text-xs ${getStatusBadgeVariant(project.status)}`}>
            {getStatusIcon(project.status)}
            {project.status}
          </Badge>
        </CardFooter>
      </Card>
    );
  }

  // List View
  return (
    <div className="flex items-center justify-between p-4 border-b border-border hover:bg-accent/5 transition-colors duration-200 rounded-lg">
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <FileText className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="flex-grow min-w-0">
          <h3 className="text-md font-semibold text-primary-foreground truncate">{project.name}</h3>
          <p className="text-xs text-muted-foreground">
            {project.duration} min{project.duration > 1 ? 's' : ''} &bull; {project.language} &bull; {formattedDate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <Badge variant="outline" className={`text-xs hidden sm:flex items-center ${getStatusBadgeVariant(project.status)}`}>
           {getStatusIcon(project.status)}
           {project.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project.id)} className="cursor-pointer">
              <Edit3 className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
             <DropdownMenuItem className="sm:hidden flex items-center cursor-default">
               {getStatusIcon(project.status)}
               <span>{project.status}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectItem;

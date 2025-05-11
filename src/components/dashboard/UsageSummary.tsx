
"use client";

import type { UserProfile, Project, PlanConfig } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface UsageSummaryProps {
  user: UserProfile | null;
  projects: Project[];
  currentPlanConfig: PlanConfig | null;
}

const UsageSummary = ({ user, projects, currentPlanConfig }: UsageSummaryProps) => {
  const totalMinutesTranscribed = useMemo(() => {
    return projects.reduce((sum, project) => sum + project.duration, 0);
  }, [projects]);

  const minutesLimit = useMemo(() => {
    if (!currentPlanConfig) return null;
    return currentPlanConfig.minuteLimitMonthly ?? currentPlanConfig.minuteLimitDaily ?? null;
  }, [currentPlanConfig]);

  const limitType = useMemo(() => {
    if (!currentPlanConfig) return "";
    if (currentPlanConfig.minuteLimitMonthly) return "monthly";
    if (currentPlanConfig.minuteLimitDaily) return "daily";
    return "";
  },[currentPlanConfig]);

  const remainingMinutes = useMemo(() => {
    if (minutesLimit === null) return null; // Unlimited or not applicable
    return Math.max(0, minutesLimit - totalMinutesTranscribed);
  }, [minutesLimit, totalMinutesTranscribed]);

  const usagePercentage = useMemo(() => {
    if (minutesLimit === null || minutesLimit === 0) return 0;
    return Math.min(100, (totalMinutesTranscribed / minutesLimit) * 100);
  }, [totalMinutesTranscribed, minutesLimit]);

  const projectCount = projects.length;
  const projectLimit = currentPlanConfig?.projectLimit;
  const projectUsagePercentage = projectLimit ? Math.min(100, (projectCount / projectLimit) * 100) : 0;


  if (!user || !currentPlanConfig) {
    return (
      <Card className="bg-card shadow-xl">
        <CardHeader>
          <CardTitle>Usage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading user data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-xl w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-2xl">Welcome, {user.name || "User"}!</CardTitle>
            <CardDescription>Your current plan: <span className="font-semibold text-primary">{currentPlanConfig.name}</span></CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            UID: {user.uid.substring(0,8)}...
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Transcription Minutes Used ({limitType})
            </h3>
            <p className="text-sm font-semibold">
              {totalMinutesTranscribed} / {minutesLimit !== null ? minutesLimit : "Unlimited"} mins
            </p>
          </div>
          {minutesLimit !== null ? (
            <Progress value={usagePercentage} aria-label={`${usagePercentage}% minutes used`} className="h-3 rounded-full bg-primary/20 [&>div]:bg-primary" />
          ) : (
             <div className="flex items-center text-green-500">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Unlimited Minutes</span>
            </div>
          )}
           {remainingMinutes !== null && remainingMinutes <= (minutesLimit ?? 0) * 0.1 && minutesLimit !==0 && ( // Show warning if less than 10% remaining
            <p className="mt-2 text-xs text-destructive flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              You are approaching your {limitType} minute limit.
            </p>
          )}
        </div>

        {projectLimit !== null && (
           <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Projects Created
              </h3>
              <p className="text-sm font-semibold">
                {projectCount} / {projectLimit} projects
              </p>
            </div>
            <Progress value={projectUsagePercentage} aria-label={`${projectUsagePercentage}% projects used`} className="h-3 rounded-full bg-secondary/20 [&>div]:bg-secondary" />
            {projectCount >= projectLimit && (
                <p className="mt-2 text-xs text-destructive flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    You have reached your project limit.
                </p>
            )}
          </div>
        )}
         <div className="flex items-center text-sm text-muted-foreground pt-2">
            <TrendingUp className="w-4 h-4 mr-2 text-accent" />
            Keep track of your limits to ensure uninterrupted service.
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageSummary;

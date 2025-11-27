import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Video,
  Loader2,
  AlertCircle,
  Play,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";
import {
  interviewerInterviewService,
  type AssignedInterview,
} from "@/services/interviewerInterview.service";
import { ROUTES } from "@/routes/routes.config";
import { toast } from "sonner";

// Helper function to format date for display
const formatDisplayDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Date not set";
  try {
    const date = parseISO(dateString);
    if (!date || isNaN(date.getTime())) return "Invalid date";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  } catch {
    return "Invalid date";
  }
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case "scheduled":
      return "default";
    case "in_progress":
      return "secondary";
    case "completed":
      return "default";
    case "cancelled":
      return "destructive";
    case "no_show":
      return "destructive";
    default:
      return "secondary";
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return CheckCircle;
    case "cancelled":
    case "no_show":
      return XCircle;
    case "in_progress":
      return AlertTriangle;
    default:
      return Calendar;
  }
};

export default function AssignedInterviews() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch assigned interviews
  const {
    data: interviewsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["interviewerAssignedInterviews"],
    queryFn: () => interviewerInterviewService.getAssignedInterviews(),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      interviewerInterviewService.updateInterviewStatus(id, { status: status as any }),
    onSuccess: () => {
      toast.success("Interview status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["interviewerAssignedInterviews"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update interview status");
    },
  });

  const interviews: AssignedInterview[] = interviewsData?.data || [];

  // Helper function to safely parse date
  const safeParseISO = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
      return parseISO(dateString);
    } catch {
      return null;
    }
  };

  // Separate upcoming and past interviews
  const upcomingInterviews = interviews
    .filter((interview) => {
      if (!interview.scheduledDate) return false;
      const interviewDate = safeParseISO(interview.scheduledDate);
      if (!interviewDate) return false;
      return (
        !isPast(interviewDate) &&
        interview.status !== "completed" &&
        interview.status !== "cancelled"
      );
    })
    .sort((a, b) => {
      const dateA = safeParseISO(a.scheduledDate);
      const dateB = safeParseISO(b.scheduledDate);
      if (!dateA || !dateB) return 0;
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (a.timeSlot || "").localeCompare(b.timeSlot || "");
    });

  const pastInterviews = interviews
    .filter((interview) => {
      if (!interview.scheduledDate) {
        return interview.status === "completed" || interview.status === "cancelled";
      }
      const interviewDate = safeParseISO(interview.scheduledDate);
      if (!interviewDate) {
        return interview.status === "completed" || interview.status === "cancelled";
      }
      return (
        isPast(interviewDate) ||
        interview.status === "completed" ||
        interview.status === "cancelled"
      );
    })
    .sort((a, b) => {
      const dateA = safeParseISO(a.scheduledDate);
      const dateB = safeParseISO(b.scheduledDate);
      if (!dateA || !dateB) return 0;
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      if (timeA !== timeB) return timeB - timeA;
      return (b.timeSlot || "").localeCompare(a.timeSlot || "");
    });

  const handleStartInterview = (interview: AssignedInterview) => {
    // Update status to in_progress
    updateStatusMutation.mutate({
      id: interview._id,
      status: "in_progress",
    });
    
    // Navigate to interview session screen - using meeting link if available
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    } else {
      // Fallback: navigate to session screen (reusing trainee SessionScreen for now)
      navigate(`/dashboard/trainee/sessions/${interview._id}`, { 
        state: { isInterviewer: true } 
      });
    }
  };

  const handleJoinInterview = (interview: AssignedInterview) => {
    // Navigate to interview session screen - using meeting link if available
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    } else {
      // Fallback: navigate to session screen
      navigate(`/dashboard/trainee/sessions/${interview._id}`, { 
        state: { isInterviewer: true } 
      });
    }
  };

  const handleViewDetails = (interview: AssignedInterview) => {
    // Show interview details in a modal or navigate to detail page
    // For now, navigate to feedback page with interview ID
    navigate(ROUTES.INTERVIEWER_FEEDBACK, {
      state: { interviewId: interview._id },
    });
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assigned Interviews</h1>
          <p className="text-muted-foreground">View and manage your assigned interview sessions</p>
        </div>
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load interviews</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An error occurred while loading interviews"}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assigned Interviews</h1>
          <p className="text-muted-foreground">View and manage your assigned interview sessions</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.INTERVIEWER_CALENDAR)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          View Calendar
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assigned interviews...</p>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Interviews ({pastInterviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Interviews */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingInterviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming interviews</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any scheduled interviews at the moment
                </p>
                <Button onClick={() => navigate(ROUTES.INTERVIEWER_DASHBOARD)}>
                  View Dashboard
                </Button>
              </Card>
            ) : (
              <>
                {upcomingInterviews.map((interview, index) => {
                  const StatusIcon = getStatusIcon(interview.status);

                  return (
                    <motion.div
                      key={interview._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="p-6 hover-lift">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Video className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                  {interview.trainee?.name || "Unknown Trainee"}
                                </h3>
                                {interview.focusArea && (
                                  <Badge variant="outline">{interview.focusArea}</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDisplayDate(interview.scheduledDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {interview.timeSlot || "Time not set"} • {interview.duration || 0} min
                                </span>
                                {interview.difficulty && (
                                  <Badge variant="outline">
                                    {interview.difficulty.charAt(0).toUpperCase() +
                                      interview.difficulty.slice(1)}
                                  </Badge>
                                )}
                                <Badge variant={getStatusVariant(interview.status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {interview.status
                                    .replace("_", " ")
                                    .charAt(0)
                                    .toUpperCase() + interview.status.replace("_", " ").slice(1)}
                                </Badge>
                                {interview.language && (
                                  <Badge variant="secondary">
                                    {interview.language.charAt(0).toUpperCase() +
                                      interview.language.slice(1)}
                                  </Badge>
                                )}
                              </div>
                              {interview.trainee?.email && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Email: {interview.trainee.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {interview.status === "scheduled" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(interview)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleStartInterview(interview)}
                                  className="bg-gradient-primary text-primary-foreground"
                                  disabled={updateStatusMutation.isPending}
                                >
                                  {updateStatusMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                  )}
                                  Start Interview
                                </Button>
                              </>
                            )}
                            {interview.status === "in_progress" && (
                              <Button
                                size="sm"
                                onClick={() => handleJoinInterview(interview)}
                                className="bg-gradient-primary text-primary-foreground"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Join Interview
                              </Button>
                            )}
                            {interview.status === "cancelled" && (
                              <Badge variant="destructive">Cancelled</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </>
            )}
          </TabsContent>

          {/* Past Interviews */}
          <TabsContent value="past" className="space-y-4">
            {pastInterviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past interviews</h3>
                <p className="text-muted-foreground mb-4">
                  Your completed interview sessions will appear here
                </p>
              </Card>
            ) : (
              <>
                {pastInterviews.map((interview, index) => {
                  const StatusIcon = getStatusIcon(interview.status);

                  return (
                    <motion.div
                      key={interview._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="p-6 hover-lift">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 rounded-lg bg-muted">
                              <Video className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">
                                  {interview.trainee?.name || "Unknown Trainee"}
                                </h3>
                                {interview.focusArea && (
                                  <Badge variant="outline">{interview.focusArea}</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDisplayDate(interview.scheduledDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {interview.timeSlot || "Time not set"} • {interview.duration || 0} min
                                </span>
                                <Badge variant={getStatusVariant(interview.status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {interview.status
                                    .replace("_", " ")
                                    .charAt(0)
                                    .toUpperCase() + interview.status.replace("_", " ").slice(1)}
                                </Badge>
                              </div>
                              {interview.trainee?.email && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Email: {interview.trainee.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {interview.status === "completed" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(interview)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    navigate(ROUTES.INTERVIEWER_FEEDBACK, {
                                      state: { interviewId: interview._id },
                                    });
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Review Feedback
                                </Button>
                              </>
                            )}
                            {interview.status === "cancelled" && (
                              <Badge variant="destructive">Cancelled</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

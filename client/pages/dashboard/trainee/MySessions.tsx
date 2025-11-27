import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  Users,
  Brain,
  Heart,
  Play,
  Eye,
  Loader2,
  AlertCircle,
  CalendarClock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";
import { bookingService, type Interview, type InterviewMode } from "@/services/booking.service";
import { ROUTES } from "@/routes/routes.config";

// Helper function to get mode icon
const getModeIcon = (mode: InterviewMode) => {
  switch (mode) {
    case "ai":
      return Brain;
    case "peer":
      return Users;
    case "family":
      return Heart;
    case "live":
      return Video;
    default:
      return Brain;
  }
};

// Helper function to get mode title
const getModeTitle = (mode: InterviewMode) => {
  switch (mode) {
    case "ai":
      return "AI-Powered Interview";
    case "peer":
      return "Peer-to-Peer";
    case "family":
      return "Family & Friends";
    case "live":
      return "Live Mock Interview";
    default:
      return "Interview";
  }
};

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

// Helper function to format relative date for past sessions
const formatPastDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Date not set";
  try {
    const date = parseISO(dateString);
    if (!date || isNaN(date.getTime())) return "Invalid date";
    
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return format(date, "MMM d, yyyy");
  } catch {
    return "Invalid date";
  }
};

export default function MySessions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user's bookings
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userSessions"],
    queryFn: () => bookingService.getBookings(),
  });

  const sessions: Interview[] = bookingsData?.data || [];

  // Helper function to safely parse date
  const safeParseISO = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
      return parseISO(dateString);
    } catch {
      return null;
    }
  };

  // Separate upcoming and past sessions
  const upcomingSessions = sessions
    .filter((session) => {
      // Skip sessions without valid scheduledDate
      if (!session.scheduledDate) return false;
      
      const sessionDate = safeParseISO(session.scheduledDate);
      if (!sessionDate) return false;
      
      return !isPast(sessionDate) && session.status !== "completed" && session.status !== "cancelled";
    })
    .sort((a, b) => {
      const dateA = safeParseISO(a.scheduledDate);
      const dateB = safeParseISO(b.scheduledDate);
      
      if (!dateA || !dateB) {
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        return -1;
      }
      
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      
      if (timeA !== timeB) return timeA - timeB;
      // If same date, sort by time
      return (a.timeSlot || "").localeCompare(b.timeSlot || "");
    });

  const pastSessions = sessions
    .filter((session) => {
      // If no scheduledDate, check status
      if (!session.scheduledDate) {
        return session.status === "completed" || session.status === "cancelled";
      }
      
      const sessionDate = safeParseISO(session.scheduledDate);
      if (!sessionDate) {
        return session.status === "completed" || session.status === "cancelled";
      }
      
      return isPast(sessionDate) || session.status === "completed" || session.status === "cancelled";
    })
    .sort((a, b) => {
      const dateA = safeParseISO(a.scheduledDate);
      const dateB = safeParseISO(b.scheduledDate);
      
      if (!dateA || !dateB) {
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        return -1;
      }
      
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      
      if (timeA !== timeB) return timeB - timeA; // Descending for past sessions
      // If same date, sort by time (descending)
      return (b.timeSlot || "").localeCompare(a.timeSlot || "");
    });

  // Refetch sessions when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Sessions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your scheduled and completed interview sessions
          </p>
        </div>
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load sessions</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An error occurred while loading your sessions"}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Sessions</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your scheduled and completed interview sessions
        </p>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your sessions...</p>
        </Card>
      ) : (
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Sessions ({pastSessions.length})
            </TabsTrigger>
        </TabsList>

        {/* Upcoming Sessions */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
              <p className="text-muted-foreground mb-4">
                Schedule your first interview session to get started
              </p>
                <Button onClick={() => navigate(ROUTES.TRAINEE_SCHEDULE)}>
                Schedule Session
              </Button>
            </Card>
          ) : (
            <>
                {upcomingSessions.map((session, index) => {
                  const ModeIcon = getModeIcon(session.mode);
                  const statusColors = {
                    scheduled: "bg-blue-500 hover:bg-blue-600 text-white",
                    in_progress: "bg-yellow-500 hover:bg-yellow-600 text-white",
                    completed: "bg-green-500 hover:bg-green-600 text-white",
                    cancelled: "bg-red-500 hover:bg-red-600 text-white",
                    no_show: "bg-orange-500 hover:bg-orange-600 text-white",
                  };

                  return (
                <motion.div
                      key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-6 hover-lift">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                              <ModeIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {getModeTitle(session.mode)}
                                </h3>
                                {session.focusArea && (
                                  <Badge variant="outline">{session.focusArea}</Badge>
                                )}
                              </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                                  {formatDisplayDate(session.scheduledDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                                  {session.timeSlot || "Time not set"} • {session.duration || 0} min
                            </span>
                                <Badge variant="secondary">{getModeTitle(session.mode)}</Badge>
                                {session.difficulty && (
                                  <Badge variant="outline">
                                    {session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
                                  </Badge>
                                )}
                                {session.status && (
                                  <Badge
                                    variant={session.status === "cancelled" ? "destructive" : "secondary"}
                                    className={`rounded-full ${
                                      session.status === "scheduled"
                                        ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                                        : session.status === "completed"
                                        ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                                        : session.status === "in_progress"
                                        ? "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-600"
                                        : ""
                                    }`}
                                  >
                                    {session.status.replace("_", " ").charAt(0).toUpperCase() +
                                      session.status.replace("_", " ").slice(1)}
                                  </Badge>
                                )}
                              </div>
                              {session.interviewerId && typeof session.interviewerId === "object" && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Interviewer: {session.interviewerId.name}
                                </p>
                              )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                            {/* Show Reschedule button for all upcoming sessions (these are already filtered to be scheduled/not completed/cancelled) */}
                            {session.status?.toLowerCase() !== "in_progress" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    navigate(`${ROUTES.TRAINEE_SESSIONS}/${session._id}/reschedule`);
                                  }}
                                >
                                  <CalendarClock className="h-4 w-4 mr-2" />
                                  Reschedule
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    // Navigate to session detail/start page
                                    navigate(`${ROUTES.TRAINEE_SESSIONS}/${session._id}`);
                                  }}
                                  className="bg-gradient-primary text-primary-foreground text-xs sm:text-sm"
                                >
                                  <Play className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                  <span>Start</span>
                                </Button>
                              </>
                            )}
                            {session.status === "in_progress" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  navigate(`${ROUTES.TRAINEE_SESSIONS}/${session._id}`);
                                }}
                                className="bg-gradient-primary text-primary-foreground text-xs sm:text-sm"
                              >
                                <Play className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                                <span>Join Session</span>
                              </Button>
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

        {/* Past Sessions */}
        <TabsContent value="past" className="space-y-4">
            {pastSessions.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past sessions</h3>
                <p className="text-muted-foreground mb-4">
                  Your completed interview sessions will appear here
                </p>
                <Button onClick={() => navigate(ROUTES.TRAINEE_SCHEDULE)}>
                  Schedule New Session
                </Button>
              </Card>
            ) : (
              <>
                {pastSessions.map((session, index) => {
                  const ModeIcon = getModeIcon(session.mode);

                  return (
            <motion.div
                      key={session._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="p-6 hover-lift">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                              <ModeIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {getModeTitle(session.mode)}
                                </h3>
                                {session.focusArea && (
                                  <Badge variant="outline">{session.focusArea}</Badge>
                                )}
                              </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                                  {formatPastDate(session.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                                  {session.timeSlot || "Time not set"} • {session.duration || 0} min
                        </span>
                                <Badge variant="secondary">{getModeTitle(session.mode)}</Badge>
                                {session.status && (
                                  <Badge
                                    variant={session.status === "cancelled" ? "destructive" : "secondary"}
                                    className={`rounded-full ${
                                      session.status === "scheduled"
                                        ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-600"
                                        : session.status === "completed"
                                        ? "bg-green-500 text-white hover:bg-green-600 border-green-600"
                                        : session.status === "in_progress"
                                        ? "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-600"
                                        : ""
                                    }`}
                                  >
                                    {session.status.replace("_", " ").charAt(0).toUpperCase() +
                                      session.status.replace("_", " ").slice(1)}
                                  </Badge>
                                )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                            {session.status === "completed" && (
                              <>
                    <Button
                      variant="outline"
                      size="sm"
                                  onClick={() => {
                                    // Navigate to feedback page or session details based on mode
                                    if (session.mode === "ai") {
                                      // AI sessions might have detailed feedback
                                      navigate(ROUTES.TRAINEE_FEEDBACK, {
                                        state: { sessionId: session._id },
                                      });
                                    } else {
                                      // For other modes, show session details
                                      navigate(`${ROUTES.TRAINEE_SESSIONS}/${session._id}`);
                                    }
                                  }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Navigate to feedback page
                                    navigate(ROUTES.TRAINEE_FEEDBACK, {
                                      state: { sessionId: session._id },
                                    });
                                  }}
                                >
                      View Feedback
                    </Button>
                              </>
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

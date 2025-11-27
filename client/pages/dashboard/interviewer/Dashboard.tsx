import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboard.service";
import {
  Users,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  AlertCircle,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/routes.config";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to format date
const formatDisplayDate = (dateString: string | null) => {
  if (!dateString) return "Date TBD";
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  } catch {
    return "Date TBD";
  }
};

// Helper to get mode title
const getModeTitle = (mode: string) => {
  switch (mode) {
    case "ai":
      return "AI-Powered";
    case "peer":
      return "Peer-to-Peer";
    case "family":
      return "Family & Friends";
    case "live":
      return "Live Mock";
    default:
      return mode;
  }
};

// Helper to get difficulty color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800 border-green-200";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "advanced":
    case "expert":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function InterviewerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['interviewerDashboard'],
    queryFn: () => dashboardService.getInterviewerDashboard(),
    staleTime: 30000, // 30 seconds
  });

  const stats = dashboardData?.data?.stats;
  const upcomingInterviews = dashboardData?.data?.upcomingInterviews || [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-20 lg:pb-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-20 lg:pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Failed to load dashboard</p>
            <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </div>
      </div>
    );
  }

  const userName = user?.name || 'Interviewer';

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your assigned interviews and provide valuable feedback to candidates
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold">{stats?.totalInterviews || 0}</div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium">Total Interviews</p>
            <p className="text-xs text-muted-foreground">
              {stats?.completedInterviews || 0} completed
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold">{stats?.completionRate || 0}%</div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium">Completion Rate</p>
            <p className="text-xs text-muted-foreground">
              {stats?.completedInterviews || 0} / {stats?.totalInterviews || 0}
            </p>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold">{stats?.activeSessions || 0}</div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium">Active Sessions</p>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold">{stats?.todayCount || 0}</div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium">Today's Interviews</p>
            <p className="text-xs text-muted-foreground">
              {upcomingInterviews.length} upcoming
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Upcoming Interviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Assigned Interviews
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.INTERVIEWER_ASSIGNED)}
              className="text-xs sm:text-sm"
            >
              View All
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {upcomingInterviews.length > 0 ? (
              upcomingInterviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 sm:p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                        <AvatarFallback>
                          {interview.trainee?.name
                            ?.split(" ")
                            .map(n => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold truncate">
                          {interview.trainee?.name || "Trainee"}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatDisplayDate(interview.scheduledDate)} at {interview.timeSlot}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {interview.difficulty && (
                            <Badge variant="outline" className={`text-xs ${getDifficultyColor(interview.difficulty)}`}>
                              {interview.difficulty}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {getModeTitle(interview.mode)}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {interview.duration} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`${ROUTES.INTERVIEWER_ASSIGNED}/${interview._id}`)}
                        className="text-xs sm:text-sm"
                      >
                        <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm sm:text-base font-medium mb-2">No upcoming interviews</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Your assigned interviews will appear here
                </p>
                <Button onClick={() => navigate(ROUTES.INTERVIEWER_CALENDAR)}>
                  View Calendar
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

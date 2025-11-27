import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Video,
  Users,
  Brain,
  Heart,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboard.service";
import { ROUTES } from "@/routes/routes.config";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to get mode icon
const getModeIcon = (mode: string) => {
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
const getModeTitle = (mode: string) => {
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['traineeDashboard'],
    queryFn: () => dashboardService.getTraineeDashboard(),
    staleTime: 30000, // 30 seconds
  });

  const stats = dashboardData?.data?.stats;
  const upcomingSessions = dashboardData?.data?.upcomingSessions || [];

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

  const userName = user?.name || 'Trainee';
  const upcomingCount = upcomingSessions.length;

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
          {upcomingCount > 0 
            ? `You have ${upcomingCount} upcoming session${upcomingCount > 1 ? 's' : ''} this week.`
            : "Ready to practice? Schedule your next interview session."}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold">{stats?.totalInterviews || 0}</div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium">Total Interviews</p>
              <p className="text-xs text-muted-foreground">
                {stats?.completedSessions || 0} completed
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold">{stats?.upcomingCount || 0}</div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium">Upcoming Sessions</p>
              <p className="text-xs text-muted-foreground">Scheduled interviews</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold">{stats?.completedThisMonth || 0}</div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium">This Month</p>
              <p className="text-xs text-muted-foreground">Completed interviews</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold">
                  {stats?.completionRate || 0}%
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium">Completion Rate</p>
              <p className="text-xs text-muted-foreground">
                {stats?.completedSessions || 0} completed sessions
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">Upcoming Sessions</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(ROUTES.TRAINEE_SESSIONS)}
              className="text-xs sm:text-sm"
            >
              View All
              <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session, index) => {
                const ModeIcon = getModeIcon(session.mode);
                const modeTitle = getModeTitle(session.mode);
                
                return (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="p-3 sm:p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                    onClick={() => navigate(`${ROUTES.TRAINEE_SESSIONS}/${session._id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <ModeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                          <h3 className="text-sm sm:text-base font-semibold truncate">{modeTitle}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatDisplayDate(session.scheduledDate)} at {session.timeSlot}
                        </p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration} min
                      </span>
                      {session.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {session.difficulty}
                        </Badge>
                      )}
                      {session.language && (
                        <Badge variant="secondary" className="text-xs">
                          {session.language}
                        </Badge>
                      )}
                      {session.interviewer && (
                        <span className="text-xs">with {session.interviewer.name}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm sm:text-base font-medium mb-2">No upcoming sessions</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Schedule your first interview session to get started
                </p>
                <Button onClick={() => navigate(ROUTES.TRAINEE_SCHEDULE)}>
                  Schedule Interview
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

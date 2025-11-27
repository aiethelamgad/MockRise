import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardService } from "@/services/dashboard.service";
import {
  Users,
  BarChart3,
  Settings,
  UserPlus,
  Video,
  TrendingUp,
  Library,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ROUTES } from "@/routes/routes.config";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => dashboardService.getAdminDashboard(),
    staleTime: 30000, // 30 seconds
  });

  const stats = dashboardData?.data?.stats;
  const notifications = dashboardData?.data?.recentNotifications || [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-8 pb-20 lg:pb-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="space-y-8 pb-20 lg:pb-8">
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

  const userName = user?.name || 'Admin';

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
          Platform overview and quick access to key management areas
        </p>
      </motion.div>

      {/* Platform Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Users</h3>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats?.users?.total?.toLocaleString() || 0}</p>
          {stats?.users?.growth !== undefined && (
            <p className="text-xs sm:text-sm text-success mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{stats.users.growth}% growth
            </p>
          )}
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Active Users</h3>
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats?.users?.active?.toLocaleString() || 0}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {stats?.users?.total ? Math.round((stats.users.active / stats.users.total) * 100) : 0}% of total
          </p>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Interviews</h3>
            <Video className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats?.interviews?.total?.toLocaleString() || 0}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {stats?.interviews?.newThisMonth || 0} this month
          </p>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Success Rate</h3>
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats?.interviews?.successRate || 0}%</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {stats?.interviews?.completed || 0} completed
          </p>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Notifications */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Recent Notifications
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.ADMIN_NOTIFICATIONS)}
              className="text-xs sm:text-sm"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border ${notification.isRead ? 'bg-muted/20' : 'bg-primary/5 border-primary/20'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                      {notification.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent notifications</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-center gap-2"
              onClick={() => navigate(ROUTES.ADMIN_USERS)}
            >
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-center gap-2"
              onClick={() => navigate(ROUTES.ADMIN_INTERVIEWS)}
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Interviews</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-center gap-2"
              onClick={() => navigate(ROUTES.ADMIN_RESOURCES)}
            >
              <Library className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Resources</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-center gap-2"
              onClick={() => navigate(ROUTES.ADMIN_NOTIFICATIONS)}
            >
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Notifications</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

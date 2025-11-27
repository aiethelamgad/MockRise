import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { notificationService } from "@/services/notification.service";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return CheckCircle2;
    case "warning":
      return AlertCircle;
    case "error":
      return AlertCircle;
    default:
      return Info;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "success":
      return "text-accent";
    case "warning":
      return "text-warning";
    case "error":
      return "text-destructive";
    default:
      return "text-primary";
  }
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();
  const notificationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const highlightedNotificationId = (location.state as any)?.notificationId as string | undefined;

  // Fetch all notifications
  const {
    data: notificationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: () => notificationService.getNotifications({ limit: 100 }),
  });

  const notifications = notificationsData?.data || [];

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refreshNotifications();
      toast.success("Notification deleted");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refreshNotifications();
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refreshNotifications();
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteMutation.mutate(notificationId);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle scrolling to and highlighting a specific notification
  useEffect(() => {
    if (!highlightedNotificationId || notifications.length === 0) return;

    // Find the notification that matches the highlighted ID
    const targetNotification = notifications.find(
      n => String(n._id) === String(highlightedNotificationId) ||
           String(n._id?.toString()) === String(highlightedNotificationId)
    );

    if (!targetNotification) return;

    // Wait for DOM to be ready, then scroll to the notification
    const scrollToNotification = () => {
      const notificationElement = notificationRefs.current[targetNotification._id];
      
      if (notificationElement) {
        // Scroll to the notification with offset for header
        const offset = 100;
        const elementPosition = notificationElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });

        // Mark as read automatically if unread
        if (!targetNotification.isRead) {
          markAsReadMutation.mutate(targetNotification._id);
        }
      } else {
        // Element not found yet, retry after a delay
        setTimeout(scrollToNotification, 200);
      }
    };

    // Initial attempt after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(scrollToNotification, 500);

    // Clear the state after scrolling completes
    const clearStateTimeout = setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null });
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(clearStateTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedNotificationId, notifications.length]);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage all your notifications
          </p>
        </div>
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load notifications</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage all your notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading notifications...</p>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            You don't have any notifications yet
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            const notificationDate = new Date(notification.createdAt);

            // Match by _id (from API) - notification.id from panel maps to _id here
            const isHighlighted = highlightedNotificationId && 
                                  (String(highlightedNotificationId) === String(notification._id));
            
            return (
              <motion.div
                key={notification._id}
                ref={(el) => {
                  if (notification._id) {
                    notificationRefs.current[notification._id] = el;
                  }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  className={`p-6 hover:bg-muted/50 transition-colors group ${
                    !notification.isRead ? "bg-primary/5 border-primary/20" : ""
                  } ${
                    isHighlighted ? "ring-2 ring-primary ring-offset-2 shadow-lg bg-primary/10" : ""
                  }`}
                  style={isHighlighted ? { 
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 3'
                  } : undefined}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${colorClass} bg-background`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground whitespace-pre-wrap break-words">
                            {notification.message}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                          onClick={(e) => handleDelete(e, notification._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{format(notificationDate, "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification._id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}


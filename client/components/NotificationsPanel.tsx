import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, X, Clock, AlertCircle, CheckCircle2, Info, Trash2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount, refreshNotifications } = useNotifications();

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

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteMutation.mutate(notificationId);
  };

  const getNotificationsRoute = () => {
    if (!user) return "/dashboard/trainee/notifications";
    switch (user.role) {
      case "admin":
        return "/dashboard/admin/notifications";
      case "interviewer":
        return "/dashboard/interviewer/notifications";
      case "trainee":
        return "/dashboard/trainee/notifications";
      default:
        return "/dashboard/trainee/notifications";
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'Just now';
  };

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

  return (
    <>
      {/* Notification Bell */}
      <EnhancedButton
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-muted hover:text-primary transition-colors duration-200"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-xs">
            {unreadCount}
          </Badge>
        )}
      </EnhancedButton>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-16 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-80 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-5rem)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <EnhancedButton
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </EnhancedButton>
                  )}
                  <EnhancedButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </EnhancedButton>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const colorClass = getNotificationColor(notification.type);
                      
                      // Check if message is likely truncated
                      // line-clamp-3 shows approximately 3 lines
                      // More accurate: check if message has multiple lines or is very long
                      const messageLines = notification.message.split('\n').length;
                      const isLikelyTruncated = notification.message.length > 180 || messageLines > 3;
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative ${
                            !notification.isRead ? "bg-primary/5" : ""
                          }`}
                          onClick={() => {
                            if (isLikelyTruncated) {
                              // Navigate to full notifications page with notification ID
                              // Use notification.id which maps to _id in the API
                              setIsOpen(false);
                              navigate(getNotificationsRoute(), {
                                state: { notificationId: notification.id }
                              });
                            } else {
                              // For short notifications, mark as read and handle special navigation
                              markAsRead(notification.id);
                              // If notification is about pending interviewers, navigate to that page
                              if (notification.title.toLowerCase().includes('pending interviewer')) {
                                setIsOpen(false);
                                navigate('/dashboard/admin/pending-interviewers');
                              }
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${colorClass}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2 whitespace-pre-wrap break-words line-clamp-3">
                                {notification.message}
                              </p>
                              {isLikelyTruncated && (
                                <p className="text-xs text-primary italic mb-2">Click to view full message...</p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                </div>
                                {!notification.id.startsWith('client-') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity flex-shrink-0"
                                    onClick={(e) => handleDelete(e, notification.id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <EnhancedButton 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(getNotificationsRoute());
                  }}
                >
                  View all notifications
                </EnhancedButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

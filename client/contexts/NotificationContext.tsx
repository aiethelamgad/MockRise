import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { notificationService, Notification as ApiNotification } from '@/services/notification.service';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'success' | 'warning' | 'info' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Convert API notification to context notification format
const mapApiNotification = (apiNotif: ApiNotification): Notification => ({
  id: apiNotif._id,
  title: apiNotif.title,
  message: apiNotif.message,
  timestamp: new Date(apiNotif.createdAt),
  isRead: apiNotif.isRead,
  type: apiNotif.type,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    // Wait for auth to be ready (user could be null initially while loading)
    if (authLoading || !user) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const response = await notificationService.getNotifications({ limit: 50 });
      const mappedNotifications = response.data.map(mapApiNotification);
      setNotifications(mappedNotifications);
    } catch (error) {
      // Error fetching notifications - non-critical, keep existing notifications
      // Keep existing notifications on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch notifications when user changes or component mounts
  useEffect(() => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      return;
    }

    fetchNotifications();

    // Poll for new notifications every 30 seconds (only if user is authenticated)
    const interval = setInterval(() => {
      if (user) {
        fetchNotifications();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, authLoading, user]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    // For client-side notifications (like success messages), add to local state
    // Backend notifications are fetched via polling
    const newNotification: Notification = {
      ...notification,
      id: `client-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove success notifications after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistically update UI
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    // Only call API if it's a backend notification (not client- prefixed)
    if (!id.startsWith('client-')) {
      try {
        await notificationService.markAsRead(id);
        // Refresh to ensure sync
        fetchNotifications();
      } catch (error) {
        // Error marking notification as read - revert optimistic update
        // Revert optimistic update on error
        fetchNotifications();
      }
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      await notificationService.markAllAsRead();
      // Refresh to ensure sync
      fetchNotifications();
    } catch (error) {
      // Error marking all notifications as read - revert optimistic update
      // Revert optimistic update on error
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const removeNotification = useCallback(async (id: string) => {
    // Optimistically remove from UI
    setNotifications(prev => prev.filter(n => n.id !== id));

    // Only call API if it's a backend notification
    if (!id.startsWith('client-')) {
      try {
        await notificationService.deleteNotification(id);
      } catch (error) {
        // Error deleting notification - refresh to restore
        // Refresh to restore on error
        fetchNotifications();
      }
    }
  }, [fetchNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications,
        unreadCount,
        loading,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};


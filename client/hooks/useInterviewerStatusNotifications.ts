import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

/**
 * Hook to show notifications based on interviewer status
 * Should be called after login/registration or when user data is fetched
 */
export function useInterviewerStatusNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user || user.role !== 'interviewer') {
      return;
    }

    // Show notification based on status
    if (user.status === 'approved' && user.isApproved) {
      // Only show once per session - check localStorage
      const notificationKey = `interviewer-approved-${user.id}`;
      const hasShown = sessionStorage.getItem(notificationKey);
      
      if (!hasShown) {
        addNotification({
          title: 'Application Approved',
          message: 'Your interviewer application has been approved. You now have access to the interviewer dashboard.',
          type: 'success',
        });
        sessionStorage.setItem(notificationKey, 'true');
      }
    } else if (user.status === 'rejected') {
      const notificationKey = `interviewer-rejected-${user.id}`;
      const hasShown = sessionStorage.getItem(notificationKey);
      
      if (!hasShown) {
        addNotification({
          title: 'Application Rejected',
          message: 'Your interviewer application has been rejected. Please contact support if you have questions.',
          type: 'error',
        });
        sessionStorage.setItem(notificationKey, 'true');
      }
    }
  }, [user, addNotification]);
}


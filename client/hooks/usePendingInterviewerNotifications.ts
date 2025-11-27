import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { interviewerService } from '@/services/interviewer.service';

/**
 * Hook to monitor and notify admins about new pending interviewer applications
 */
export function usePendingInterviewerNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const lastCountRef = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run for admin users and ensure user is loaded
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return;
    }

    // Guard against addNotification being undefined
    if (!addNotification) {
      return;
    }

    const checkPendingApplications = async () => {
      try {
        const response = await interviewerService.getPending();
        const currentCount = response.count || 0;

        // Check if there are new applications
        if (lastCountRef.current > 0 && currentCount > lastCountRef.current) {
          const newCount = currentCount - lastCountRef.current;
          try {
            addNotification({
              title: 'New Pending Interviewer Application' + (newCount > 1 ? 's' : ''),
              message: `${newCount} new interviewer application${newCount > 1 ? 's' : ''} ${newCount > 1 ? 'have' : 'has'} been submitted and is awaiting review.`,
              type: 'info',
            });
          } catch (notifError) {
            // Error adding notification - non-critical, silently fail
          }
        }

        // Update the last known count
        lastCountRef.current = currentCount;
      } catch (error) {
        // Error checking pending interviewers - polling failure, silently fail
        // Silently fail - don't show error to user for polling failures
      }
    };

    // Delay initial check to ensure everything is ready
    const initialTimeout = setTimeout(() => {
      checkPendingApplications();
    }, 1000);

    // Poll every 30 seconds for new applications
    pollingIntervalRef.current = setInterval(checkPendingApplications, 30000);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user, addNotification]);

  // Refresh count when navigating to pending interviewers page
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return;
    }

    const refreshCount = async () => {
      try {
        const response = await interviewerService.getPending();
        lastCountRef.current = response.count || 0;
      } catch (error) {
        // Error refreshing pending count - silently fail and reset to 0
        // Silently fail - set to 0 if error
        lastCountRef.current = 0;
      }
    };

    // Delay refresh to ensure auth is ready
    const timeout = setTimeout(refreshCount, 500);
    
    return () => clearTimeout(timeout);
  }, [user]);
}


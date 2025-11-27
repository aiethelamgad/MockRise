import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/routes/routes.config';

/**
 * Component to handle automatic redirects based on user authentication status
 * This ensures rejected/pending users are redirected correctly on page refresh
 */
export function AuthRedirectHandler() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip redirect handling on public routes (like landing page)
    const isPublicRoute = [
      ROUTES.HOME,
      ROUTES.LOGIN,
      ROUTES.PRICING,
      ROUTES.RESOURCES,
      ROUTES.FAQ,
      ROUTES.FORGOT_PASSWORD
    ].includes(location.pathname) || 
    location.pathname.startsWith(ROUTES.RESET_PASSWORD);
    
    if (isPublicRoute) {
      return; // Don't process redirects on public routes
    }

    // Wait for auth to finish loading
    // This includes waiting for OAuth token processing
    if (loading) return;

    // Only redirect if user is authenticated
    if (!user) return;

    // Get current path
    const currentPath = location.pathname;

    // Skip redirect if already on these pages (allow normal navigation)
    // Also skip dashboard pages - they have their own guards
    const skipRedirectPages = [
      ROUTES.REJECTED_NOTICE,
      ROUTES.PENDING_VERIFICATION,
      ROUTES.LOGIN,
      ROUTES.OAUTH_ROLE_SELECTION,
    ];

    // Skip if on any dashboard route - dashboard routes have their own guards
    if (currentPath.startsWith('/dashboard')) {
      return;
    }

    if (skipRedirectPages.includes(currentPath)) {
      return;
    }

    // Handle OAuth role selection - redirect if user needs to select role
    if (user.oauthRolePending) {
      navigate(ROUTES.OAUTH_ROLE_SELECTION, { replace: true });
      return;
    }

    // Handle rejected interviewer redirect - ALWAYS redirect to rejected notice
    if (user.role === 'interviewer' && user.status === 'rejected') {
      navigate(ROUTES.REJECTED_NOTICE, { replace: true });
      return;
    }

    // Handle pending interviewer redirect
    if (user.role === 'interviewer' && user.status === 'pending_verification') {
      navigate(ROUTES.PENDING_VERIFICATION, { replace: true });
      return;
    }
  }, [user, loading, navigate, location.pathname]);

  // This component doesn't render anything
  return null;
}


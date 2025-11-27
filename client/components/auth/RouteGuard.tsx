import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Navigate } from "react-router-dom";
import { UserRole } from "@/types/dashboard";
import { ROUTES } from "@/routes/routes.config";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
}

export function RouteGuard({ children, requiredRoles }: RouteGuardProps) {
  const { user, loading, isAuthorized, fetchUser } = useAuth();
  const location = useLocation();

  // Ensure user is fetched when route guard is mounted (protected route)
  useEffect(() => {
    if (!loading && !user) {
      fetchUser();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    // You can render a loading spinner here
    return null;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role authorization
  if (!isAuthorized(requiredRoles)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  // Special check for interviewers: must be approved to access dashboard
  if (user.role === 'interviewer' && requiredRoles.includes('interviewer')) {
    if (user.status === 'pending_verification') {
      return <Navigate to={ROUTES.PENDING_VERIFICATION} replace />;
    }
    if (user.status === 'rejected') {
      return <Navigate to={ROUTES.REJECTED_NOTICE} replace />;
    }
    if (user.status !== 'approved') {
      return <Navigate to={ROUTES.PENDING_VERIFICATION} replace />;
    }
  }

  return <>{children}</>;
}
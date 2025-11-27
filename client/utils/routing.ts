import { UserRole } from '@/types/dashboard';
import { ROUTES } from '@/routes/routes.config';

/**
 * Get the dashboard route for a given user role
 * Routes follow the pattern: /dashboard/{role}
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'super_admin':
    case 'hr_admin':
      return ROUTES.ADMIN_DASHBOARD;
    case 'interviewer':
      return ROUTES.INTERVIEWER_DASHBOARD;
    case 'trainee':
    default:
      return ROUTES.TRAINEE_DASHBOARD;
  }
}


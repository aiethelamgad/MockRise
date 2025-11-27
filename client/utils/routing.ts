/**
 * Routing utilities for environment-aware navigation
 * 
 * Provides helper functions for consistent routing across the application.
 * All routes are relative paths that work in both development and production.
 */

import { ROUTES } from '@/routes/routes.config';

/**
 * Get dashboard path for a given role
 * @param role - User role
 * @returns Dashboard path
 */
export const getDashboardPath = (role: string): string => {
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
};

/**
 * Get redirect path based on user role and status
 * Matches server-side logic in token.service.js
 * @param role - User role
 * @param status - User status
 * @returns Redirect path
 */
export const getRedirectPath = (role: string, status?: string): string => {
    switch (role) {
        case 'admin':
        case 'super_admin':
        case 'hr_admin':
            return ROUTES.ADMIN_DASHBOARD;
        case 'interviewer':
            // Check interviewer status
            if (status === 'pending_verification') {
                return ROUTES.PENDING_VERIFICATION;
            }
            if (status === 'rejected') {
                return ROUTES.REJECTED_NOTICE;
            }
            if (status === 'approved') {
                return ROUTES.INTERVIEWER_DASHBOARD;
            }
            // Default fallback for interviewers without status
            return ROUTES.PENDING_VERIFICATION;
        case 'trainee':
        default:
            return ROUTES.TRAINEE_DASHBOARD;
    }
};

/**
 * Normalize role for routing (handles super_admin -> admin)
 * @param role - User role
 * @returns Normalized role path segment
 */
export const normalizeRoleForPath = (role: string): string => {
    if (role === 'super_admin' || role === 'hr_admin') {
        return 'admin';
    }
    return role;
};

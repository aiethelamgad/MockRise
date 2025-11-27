/**
 * Route configuration constants
 */
export const ROUTES = {
    // Public routes
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    PRICING: '/pricing',
    RESOURCES: '/resources',
    // HELP: '/help',
    FAQ: '/faq',
    STYLE_GUIDE: '/styleguide',
    PENDING_VERIFICATION: '/pending-verification',
    REJECTED_NOTICE: '/rejected-notice',
    OAUTH_ROLE_SELECTION: '/oauth/select-role',
    UNAUTHORIZED: '/unauthorized',
    
    // Trainee dashboard routes
    TRAINEE_DASHBOARD: '/dashboard/trainee',
    TRAINEE_SCHEDULE: '/dashboard/trainee/schedule',
    TRAINEE_SESSIONS: '/dashboard/trainee/sessions',
    TRAINEE_SESSION_DETAIL: '/dashboard/trainee/sessions/:sessionId',
    TRAINEE_SPEECH_ANALYSIS: '/dashboard/trainee/speech-analysis',
    TRAINEE_FEEDBACK: '/dashboard/trainee/feedback',
    TRAINEE_SETTINGS: '/dashboard/trainee/settings',
    TRAINEE_NOTIFICATIONS: '/dashboard/trainee/notifications',
    
    // Interviewer dashboard routes
    INTERVIEWER_DASHBOARD: '/dashboard/interviewer',
    INTERVIEWER_ASSIGNED: '/dashboard/interviewer/assigned',
    INTERVIEWER_CALENDAR: '/dashboard/interviewer/calendar',
    INTERVIEWER_QUESTIONS: '/dashboard/interviewer/questions',
    INTERVIEWER_FEEDBACK: '/dashboard/interviewer/feedback',
    INTERVIEWER_STATS: '/dashboard/interviewer/stats',
    INTERVIEWER_SETTINGS: '/dashboard/interviewer/settings',
    INTERVIEWER_NOTIFICATIONS: '/dashboard/interviewer/notifications',
    
    // Admin dashboard routes
    ADMIN_DASHBOARD: '/dashboard/admin',
    ADMIN_PENDING_INTERVIEWERS: '/dashboard/admin/pending-interviewers',
    ADMIN_USERS: '/dashboard/admin/users',
    ADMIN_INTERVIEWS: '/dashboard/admin/interviews',
    ADMIN_RESOURCES: '/dashboard/admin/resources',
    ADMIN_ANALYTICS: '/dashboard/admin/analytics',
    ADMIN_CONFIG: '/dashboard/admin/config',
    ADMIN_PROFILE: '/dashboard/admin/profile',
    ADMIN_NOTIFICATIONS: '/dashboard/admin/notifications',
    
    // Error routes
    NOT_FOUND: '*',
} as const;


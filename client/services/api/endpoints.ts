/**
 * API Endpoints - Centralized endpoint definitions
 */
export const API_ENDPOINTS = {
    // Auth endpoints
    auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        me: '/api/auth/me',
        google: '/api/auth/google',
        github: '/api/auth/github',
        assignRole: '/api/auth/assign-role',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: (token: string) => `/api/auth/reset-password/${token}`,
    },
    // Dashboard endpoints
    dashboard: {
        trainee: '/api/dashboard/trainee',
        interviewer: '/api/dashboard/interviewer',
        admin: '/api/dashboard/admin',
    },
    // Interviewer endpoints
    interviewers: {
        pending: '/api/interviewers/pending',
        approve: (id: string) => `/api/interviewers/${id}/approve`,
        reject: (id: string) => `/api/interviewers/${id}/reject`,
    },
    // Upload endpoints
    upload: {
        resume: '/api/upload/resume',
        getResume: (filename: string) => `/api/uploads/resumes/${filename}`,
    },
    // Notification endpoints
    notifications: {
        getAll: '/api/notifications',
        markAsRead: (id: string) => `/api/notifications/${id}/read`,
        markAllAsRead: '/api/notifications/read-all',
        delete: (id: string) => `/api/notifications/${id}`,
    },
    // User management endpoints
    users: {
        getAll: '/api/users',
        getById: (id: string) => `/api/users/${id}`,
        create: '/api/users',
        update: (id: string) => `/api/users/${id}`,
        delete: (id: string) => `/api/users/${id}`,
        changeRole: (id: string) => `/api/users/${id}/role`,
        sendEmail: (id: string) => `/api/users/${id}/send-email`,
        export: '/api/users/export',
    },
    // Resource endpoints
    resources: {
        getAll: '/api/resources',
        getById: (id: string) => `/api/resources/${id}`,
        create: '/api/resources',
        update: (id: string) => `/api/resources/${id}`,
        delete: (id: string) => `/api/resources/${id}`,
        incrementViews: (id: string) => `/api/resources/${id}/view`,
    },
    // Booking endpoints
    bookings: {
        getSlots: '/api/bookings/slots',
        getAll: '/api/bookings',
        create: '/api/bookings/create',
        reschedule: (id: string) => `/api/bookings/${id}/reschedule`,
    },
    // Interviewer availability endpoints
    interviewer: {
        availability: '/api/interviewer/availability',
        addAvailability: '/api/interviewer/availability/add',
        deleteAvailability: (slotId: string) => `/api/interviewer/availability/delete/${slotId}`,
    },
    // Interviewer assigned interviews endpoints
    interviewerInterviews: {
        getAll: '/api/interviewer/interviews',
        getById: (id: string) => `/api/interviewer/interviews/${id}`,
        updateStatus: (id: string) => `/api/interviewer/interviews/${id}/status`,
    },
    // Admin interview management endpoints
    admin: {
        interviews: {
            getAll: '/api/admin/interviews',
            update: (id: string) => `/api/admin/interviews/${id}`,
            cancel: (id: string) => `/api/admin/interviews/${id}/cancel`,
        },
    },
} as const;


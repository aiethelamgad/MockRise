import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

// Common interfaces
export interface UpcomingSession {
    _id: string;
    mode: string;
    scheduledDate: string | null;
    timeSlot: string;
    duration: number;
    difficulty: string;
    focusArea?: string;
    language: string;
    status: string;
    interviewer?: {
        name: string;
        email: string;
    };
}

export interface UpcomingInterview {
    _id: string;
    mode: string;
    scheduledDate: string | null;
    timeSlot: string;
    duration: number;
    difficulty: string;
    focusArea?: string;
    language: string;
    status: string;
    trainee?: {
        name: string;
        email: string;
    };
}

export interface DashboardUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

// Trainee Dashboard
export interface TraineeDashboardStats {
    totalInterviews: number;
    upcomingCount: number;
    completedSessions: number; // Only truly completed sessions
    completedThisMonth: number;
    completionRate: number; // Percentage based on valid sessions only
}

export interface TraineeDashboardData {
    stats: TraineeDashboardStats;
    upcomingSessions: UpcomingSession[];
}

export interface TraineeDashboardResponse {
    success: boolean;
    message: string;
    data: TraineeDashboardData;
    user: DashboardUser;
}

// Interviewer Dashboard
export interface InterviewerDashboardStats {
    totalInterviews: number;
    completedInterviews: number;
    activeSessions: number;
    todayCount: number;
    completionRate: number;
}

export interface InterviewerDashboardData {
    stats: InterviewerDashboardStats;
    upcomingInterviews: UpcomingInterview[];
}

export interface InterviewerDashboardResponse {
    success: boolean;
    message: string;
    data: InterviewerDashboardData;
    user: DashboardUser;
}

// Admin Dashboard
export interface AdminDashboardUserStats {
    total: number;
    active: number;
    trainees: number;
    interviewers: number;
    admins: number;
    newThisMonth: number;
    growth: number;
}

export interface AdminDashboardInterviewStats {
    total: number;
    scheduled: number;
    completed: number;
    inProgress: number;
    newThisMonth: number;
    successRate: number;
}

export interface AdminDashboardResourceStats {
    total: number;
}

export interface AdminDashboardStats {
    users: AdminDashboardUserStats;
    interviews: AdminDashboardInterviewStats;
    resources: AdminDashboardResourceStats;
}

export interface AdminDashboardNotification {
    _id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string | null;
    isRead: boolean;
}

export interface AdminDashboardData {
    stats: AdminDashboardStats;
    recentNotifications: AdminDashboardNotification[];
}

export interface AdminDashboardResponse {
    success: boolean;
    message: string;
    data: AdminDashboardData;
    user: DashboardUser;
}

/**
 * Dashboard Service
 */
export const dashboardService = {
    /**
     * Get trainee dashboard data
     */
    async getTraineeDashboard(): Promise<TraineeDashboardResponse> {
        return apiClient.get<TraineeDashboardResponse>(API_ENDPOINTS.dashboard.trainee);
    },

    /**
     * Get interviewer dashboard data
     */
    async getInterviewerDashboard(): Promise<InterviewerDashboardResponse> {
        return apiClient.get<InterviewerDashboardResponse>(API_ENDPOINTS.dashboard.interviewer);
    },

    /**
     * Get admin dashboard data
     */
    async getAdminDashboard(): Promise<AdminDashboardResponse> {
        return apiClient.get<AdminDashboardResponse>(API_ENDPOINTS.dashboard.admin);
    },
};


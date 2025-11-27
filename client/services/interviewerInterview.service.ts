import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { InterviewStatus, InterviewMode, BookingLanguage, DifficultyLevel } from './booking.service';

export interface AssignedInterview {
    _id: string;
    mode: InterviewMode;
    trainee: {
        _id: string;
        name: string;
        email: string;
    } | null;
    scheduledDate: string;
    timeSlot: string;
    duration: number;
    language: BookingLanguage;
    difficulty: DifficultyLevel;
    focusArea?: string | null;
    status: InterviewStatus;
    meetingLink?: string | null;
    sessionId?: string | null;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    startedAt?: string | null;
    completedAt?: string | null;
}

export interface AssignedInterviewsResponse {
    success: boolean;
    data: AssignedInterview[];
}

export interface AssignedInterviewResponse {
    success: boolean;
    data: AssignedInterview;
}

export interface UpdateStatusData {
    status: InterviewStatus;
}

export interface UpdateStatusResponse {
    success: boolean;
    data: AssignedInterview;
    message: string;
}

/**
 * Interviewer Interview Service
 */
export const interviewerInterviewService = {
    /**
     * Get all assigned interviews for the current interviewer
     */
    async getAssignedInterviews(filters?: {
        status?: InterviewStatus | 'all';
        mode?: InterviewMode | 'all';
    }): Promise<AssignedInterviewsResponse> {
        const params = new URLSearchParams();
        if (filters?.status && filters.status !== 'all') {
            params.append('status', filters.status);
        }
        if (filters?.mode && filters.mode !== 'all') {
            params.append('mode', filters.mode);
        }

        const queryString = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<AssignedInterviewsResponse>(
            `${API_ENDPOINTS.interviewerInterviews.getAll}${queryString}`
        );
    },

    /**
     * Get a specific assigned interview by ID
     */
    async getAssignedInterviewById(id: string): Promise<AssignedInterviewResponse> {
        return apiClient.get<AssignedInterviewResponse>(
            API_ENDPOINTS.interviewerInterviews.getById(id)
        );
    },

    /**
     * Update interview status
     */
    async updateInterviewStatus(id: string, data: UpdateStatusData): Promise<UpdateStatusResponse> {
        return apiClient.put<UpdateStatusResponse>(
            API_ENDPOINTS.interviewerInterviews.updateStatus(id),
            data
        );
    },
};


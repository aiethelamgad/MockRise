import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

export type InterviewMode = 'ai' | 'peer' | 'family' | 'live';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface InterviewUser {
    id: string;
    name: string;
    email: string;
}

export interface AdminInterview {
    _id: string;
    mode: InterviewMode;
    trainee: InterviewUser | null;
    interviewer: InterviewUser | null;
    scheduledDate: string;
    timeSlot: string;
    duration: number;
    language: 'english' | 'arabic';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    focusArea?: string | null;
    status: InterviewStatus;
    meetingLink?: string | null;
    sessionId?: string | null;
    createdAt: string;
    updatedAt: string;
    startedAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
    cancellationReason?: string | null;
}

export interface GetInterviewsResponse {
    success: boolean;
    data: AdminInterview[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    stats?: {
        total: number;
        scheduled: number;
        in_progress: number;
        completed: number;
    };
}

export interface UpdateInterviewData {
    status?: InterviewStatus;
    interviewerId?: string | null;
    timeSlot?: string;
    scheduledDate?: string;
}

export interface UpdateInterviewResponse {
    success: boolean;
    data: AdminInterview;
    message: string;
}

export interface CancelInterviewData {
    reason?: string;
}

export interface CancelInterviewResponse {
    success: boolean;
    data: AdminInterview;
    message: string;
}

/**
 * Admin Interview Service
 */
export const adminInterviewService = {
    /**
     * Get all interviews with filtering and pagination
     */
    async getInterviews(filters?: {
        mode?: InterviewMode | 'all';
        status?: InterviewStatus | 'all';
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<GetInterviewsResponse> {
        const params = new URLSearchParams();
        if (filters?.mode && filters.mode !== 'all') params.append('mode', filters.mode);
        if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const queryString = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<GetInterviewsResponse>(
            `${API_ENDPOINTS.admin.interviews.getAll}${queryString}`
        );
    },

    /**
     * Update an interview
     */
    async updateInterview(interviewId: string, data: UpdateInterviewData): Promise<UpdateInterviewResponse> {
        return apiClient.put<UpdateInterviewResponse>(
            API_ENDPOINTS.admin.interviews.update(interviewId),
            data
        );
    },

    /**
     * Cancel an interview
     */
    async cancelInterview(interviewId: string, data?: CancelInterviewData): Promise<CancelInterviewResponse> {
        return apiClient.post<CancelInterviewResponse>(
            API_ENDPOINTS.admin.interviews.cancel(interviewId),
            data || {}
        );
    },
};


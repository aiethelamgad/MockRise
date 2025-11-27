import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

export interface PendingInterviewer {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    experience?: string;
    expertise?: string;
    linkedin?: string;
    resume?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PendingInterviewersResponse {
    success: boolean;
    count: number;
    data: PendingInterviewer[];
}

export interface ApproveRejectResponse {
    success: boolean;
    message: string;
    data: PendingInterviewer;
}

/**
 * Interviewer Service
 */
export const interviewerService = {
    /**
     * Get all pending interviewers
     */
    async getPending(): Promise<PendingInterviewersResponse> {
        return apiClient.get<PendingInterviewersResponse>(API_ENDPOINTS.interviewers.pending);
    },

    /**
     * Approve an interviewer
     */
    async approve(id: string): Promise<ApproveRejectResponse> {
        return apiClient.put<ApproveRejectResponse>(API_ENDPOINTS.interviewers.approve(id), {});
    },

    /**
     * Reject an interviewer
     */
    async reject(id: string): Promise<ApproveRejectResponse> {
        return apiClient.put<ApproveRejectResponse>(API_ENDPOINTS.interviewers.reject(id), {});
    },
};


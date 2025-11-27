import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { config } from '@/config/env';

export interface UploadResumeResponse {
    success: boolean;
    data: {
        filename: string;
        originalName: string;
        url: string;
        size: number;
    };
}

/**
 * Upload Service
 */
export const uploadService = {
    /**
     * Upload resume file
     */
    async uploadResume(file: File): Promise<UploadResumeResponse> {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch(`${config.apiUrl}${API_ENDPOINTS.upload.resume}`, {
            method: 'POST',
            body: formData,
            credentials: 'include', // Include cookies for authentication if needed
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(error.error || 'Failed to upload resume');
        }

        return response.json();
    },

    /**
     * Get resume URL
     */
    getResumeUrl(filename: string): string {
        return `${config.apiUrl}${API_ENDPOINTS.upload.getResume(filename)}`;
    },
};


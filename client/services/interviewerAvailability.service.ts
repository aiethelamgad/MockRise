import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';

export interface AvailableSlot {
    _id: string;
    date: string; // ISO date string
    time: string;
    mode: 'live' | 'ai' | 'peer' | 'family';
    isBooked: boolean;
    interviewId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AvailabilityResponse {
    success: boolean;
    data: AvailableSlot[];
}

export interface AddAvailabilityData {
    date: string; // ISO date string or date string
    time: string; // Format: "09:00 AM", "02:00 PM", etc.
    mode?: 'live' | 'ai' | 'peer' | 'family';
}

export interface AddAvailabilityResponse {
    success: boolean;
    data: AvailableSlot;
    message: string;
}

export interface DeleteAvailabilityResponse {
    success: boolean;
    message: string;
}

/**
 * Interviewer Availability Service
 */
export const interviewerAvailabilityService = {
    /**
     * Get interviewer's available slots
     */
    async getAvailability(filters?: {
        date?: string;
        mode?: string;
        includeBooked?: boolean;
    }): Promise<AvailabilityResponse> {
        const params = new URLSearchParams();
        if (filters?.date) params.append('date', filters.date);
        if (filters?.mode) params.append('mode', filters.mode);
        if (filters?.includeBooked !== undefined) {
            params.append('includeBooked', filters.includeBooked.toString());
        }

        const queryString = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<AvailabilityResponse>(
            `${API_ENDPOINTS.interviewer.availability}${queryString}`
        );
    },

    /**
     * Add a new available slot
     */
    async addAvailability(data: AddAvailabilityData): Promise<AddAvailabilityResponse> {
        return apiClient.post<AddAvailabilityResponse>(
            API_ENDPOINTS.interviewer.addAvailability,
            {
                date: data.date,
                time: data.time,
                mode: data.mode || 'live',
            }
        );
    },

    /**
     * Delete an available slot
     */
    async deleteAvailability(slotId: string): Promise<DeleteAvailabilityResponse> {
        return apiClient.delete<DeleteAvailabilityResponse>(
            API_ENDPOINTS.interviewer.deleteAvailability(slotId)
        );
    },
};


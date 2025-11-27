import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { format } from 'date-fns';

export type InterviewMode = 'ai' | 'peer' | 'family' | 'live';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type BookingLanguage = 'english' | 'arabic';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface AvailableSlot {
    id?: string; // Slot ID for tracking (used in live mode)
    time: string;
    available: boolean;
    interviewer?: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface AvailableSlotsResponse {
    success: boolean;
    data: {
        date: string;
        mode: InterviewMode;
        slots: AvailableSlot[];
    };
}

export interface ConsentFlags {
    recording: boolean;
    dataUsage: boolean;
}

export interface CreateBookingData {
    mode: InterviewMode;
    scheduledDate: string; // YYYY-MM-DD format
    timeSlot: string;
    duration: number; // 30, 45, 60, or 90
    language: BookingLanguage;
    difficulty?: DifficultyLevel;
    focusArea?: string;
    consentFlags?: ConsentFlags;
    slotId?: string; // Slot ID for direct lookup (optional, for live mode)
    interviewerId?: string; // Required for live mode
}

export interface Interview {
    _id: string;
    mode: InterviewMode;
    userId: string | {
        _id: string;
        name: string;
        email: string;
    };
    interviewerId?: string | {
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
    consentFlags: ConsentFlags;
    status: InterviewStatus;
    meetingLink?: string | null;
    sessionId?: string | null;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingResponse {
    success: boolean;
    data: Interview;
    message: string;
}

export interface BookingsResponse {
    success: boolean;
    data: Interview[];
}

export interface RescheduleBookingData {
    scheduledDate?: string; // YYYY-MM-DD format
    timeSlot?: string;
    slotId?: string; // Optional, for live mode
    interviewerId?: string; // Optional, for live mode
}

export interface RescheduleBookingResponse {
    success: boolean;
    data: Interview;
    message: string;
}

// Type aliases for backward compatibility with RescheduleSession component
export type Session = Interview;
export type RescheduleRequest = RescheduleBookingData;

// Export helper function for RescheduleSession component
export const getUserSessions = () => bookingService.getBookings();

/**
 * Booking Service
 */
export const bookingService = {
    /**
     * Get available time slots for a date and mode
     */
    async getAvailableSlots(date: Date | string, mode: InterviewMode): Promise<AvailableSlotsResponse> {
        // Use date-fns format to avoid timezone conversion issues
        const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
        return apiClient.get<AvailableSlotsResponse>(
            `${API_ENDPOINTS.bookings.getSlots}?date=${dateStr}&mode=${mode}`
        );
    },

    /**
     * Create a new interview booking
     */
    async createBooking(bookingData: CreateBookingData): Promise<CreateBookingResponse> {
        return apiClient.post<CreateBookingResponse>(
            API_ENDPOINTS.bookings.create,
            bookingData
        );
    },

    /**
     * Get user's bookings
     */
    async getBookings(filters?: { status?: InterviewStatus; mode?: InterviewMode }): Promise<BookingsResponse> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.mode) params.append('mode', filters.mode);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<BookingsResponse>(`${API_ENDPOINTS.bookings.getAll}${queryString}`);
    },

    /**
     * Reschedule an interview booking
     */
    async rescheduleBooking(bookingId: string, rescheduleData: RescheduleBookingData): Promise<RescheduleBookingResponse> {
        return apiClient.put<RescheduleBookingResponse>(
            API_ENDPOINTS.bookings.reschedule(bookingId),
            rescheduleData
        );
    },
};

// Export helper functions for backward compatibility
export const getAvailableSlots = bookingService.getAvailableSlots;
export const rescheduleSession = bookingService.rescheduleBooking;


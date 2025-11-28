import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { config } from '@/config/env';

export interface User {
    _id: string;
    name?: string;
    email: string;
    role: 'trainee' | 'interviewer' | 'admin';
    status?: 'pending_verification' | 'approved' | 'rejected';
    isApproved?: boolean;
    createdAt: string;
    updatedAt: string;
    experience?: string;
    expertise?: string;
    linkedin?: string;
    resume?: string;
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        trainees: number;
        interviewers: number;
        admins: number;
    };
}

export interface UserResponse {
    success: boolean;
    data: User;
}

export interface CreateUserData {
    name: string;
    email: string;
    password?: string;
    role: 'trainee' | 'interviewer' | 'admin';
    status?: 'pending_verification' | 'approved' | 'rejected';
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: 'trainee' | 'interviewer' | 'admin';
    status?: 'pending_verification' | 'approved' | 'rejected';
}

export interface ChangeRoleData {
    role: 'trainee' | 'interviewer' | 'admin';
}

export interface SendEmailData {
    subject: string;
    message: string;
    emailType?: string;
}

export interface UsersQueryParams {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * User Management Service
 */
export const userService = {
    /**
     * Get all users with pagination and filtering
     */
    async getUsers(params?: UsersQueryParams): Promise<UsersResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const queryString = queryParams.toString();
        const url = queryString ? `${API_ENDPOINTS.users.getAll}?${queryString}` : API_ENDPOINTS.users.getAll;
        
        return apiClient.get<UsersResponse>(url);
    },

    /**
     * Get single user by ID
     */
    async getUserById(id: string): Promise<UserResponse> {
        return apiClient.get<UserResponse>(API_ENDPOINTS.users.getById(id));
    },

    /**
     * Create new user
     */
    async createUser(data: CreateUserData): Promise<UserResponse> {
        return apiClient.post<UserResponse>(API_ENDPOINTS.users.create, data);
    },

    /**
     * Update user
     */
    async updateUser(id: string, data: UpdateUserData): Promise<UserResponse> {
        return apiClient.put<UserResponse>(API_ENDPOINTS.users.update(id), data);
    },

    /**
     * Delete user
     */
    async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
        return apiClient.delete<{ success: boolean; message: string }>(API_ENDPOINTS.users.delete(id));
    },

    /**
     * Change user role
     */
    async changeRole(id: string, data: ChangeRoleData): Promise<UserResponse> {
        return apiClient.patch<UserResponse>(API_ENDPOINTS.users.changeRole(id), data);
    },

    /**
     * Send email to user
     */
    async sendEmail(id: string, data: SendEmailData): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.users.sendEmail(id), data);
    },

    /**
     * Export users to CSV
     */
    async exportUsers(params?: { role?: string; status?: string }): Promise<Blob> {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);

        const queryString = queryParams.toString();
        const url = queryString ? `${API_ENDPOINTS.users.export}?${queryString}` : API_ENDPOINTS.users.export;

        // Get token from localStorage for authentication
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${config.apiUrl}${url}`, {
            method: 'GET',
            credentials: 'include',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to export users';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                // If not JSON, use the text or default message
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return response.blob();
    },
};


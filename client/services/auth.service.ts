import { apiClient } from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { config } from '@/config/env';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: string;
    experience?: string;
    expertise?: string;
    linkedin?: string;
    resume?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    role: string;
    redirect: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        status?: string;
        permissions: string[];
        isApproved?: boolean;
    };
}

export interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    status?: string;
    permissions?: string[];
    isApproved?: boolean;
    oauthRolePending?: boolean;
    experience?: string;
    expertise?: string;
    linkedin?: string;
    resume?: string;
}

export interface MeResponse {
    success: boolean;
    data: UserData;
}

/**
 * Authentication Service
 */
export const authService = {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
    },

    /**
     * Login user
     */
    async login(data: LoginData): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, data);
    },

    /**
     * Get current user
     */
    async getMe(): Promise<MeResponse> {
        return apiClient.get<MeResponse>(API_ENDPOINTS.auth.me);
    },

    /**
     * Logout user
     */
    async logout(): Promise<{ success: boolean; data: {} }> {
        return apiClient.post<{ success: boolean; data: {} }>(API_ENDPOINTS.auth.logout);
    },

    /**
     * Get OAuth URL
     * Role parameter is optional - if not provided, user will select role after OAuth
     */
    getOAuthUrl(provider: 'google' | 'github', role?: string): string {
        const baseUrl = config.apiUrl;
        const endpoint = provider === 'google' 
            ? API_ENDPOINTS.auth.google 
            : API_ENDPOINTS.auth.github;
        
        return role 
            ? `${baseUrl}${endpoint}?role=${role}` 
            : `${baseUrl}${endpoint}`;
    },

    /**
     * Assign role after OAuth sign-up
     */
    async assignRole(data: { 
        role: string;
        experience?: string;
        expertise?: string;
        linkedin?: string;
        resume?: string;
    }): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.assignRole, data);
    },

    /**
     * Forgot password - send reset email
     */
    async forgotPassword(email: string): Promise<{ success: boolean; error?: string; message: string }> {
        return apiClient.post<{ success: boolean; error?: string; message: string }>(API_ENDPOINTS.auth.forgotPassword, { email });
    },

    /**
     * Validate reset token
     */
    async validateResetToken(token: string): Promise<{ success: boolean; message: string }> {
        return apiClient.get<{ success: boolean; message: string }>(API_ENDPOINTS.auth.resetPassword(token));
    },

    /**
     * Reset password with token
     */
    async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
        return apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.auth.resetPassword(token), { password });
    },
};


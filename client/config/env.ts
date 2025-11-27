/**
 * Environment configuration
 */
export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:8080',
    environment: import.meta.env.MODE || 'development',
} as const;


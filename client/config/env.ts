/**
 * Environment configuration
 * 
 * For separate deployments (frontend and backend on different domains),
 * set VITE_API_URL to the full server URL (e.g., https://mock-rise-server.vercel.app/api)
 * 
 * In development, we use localhost with explicit ports.
 */
const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD;

// Get API URL from environment variable
const envApiUrl = import.meta.env.VITE_API_URL;

// Determine API URL based on environment
let apiUrl: string;
if (envApiUrl) {
    // If explicitly set, use it (allows for custom API domains)
    // Should be full URL: https://mock-rise-server.vercel.app/api
    apiUrl = envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`;
} else if (isProduction) {
    // In production, if no env var set, assume same domain (monorepo deployment)
    // This prevents DNS_HOSTNAME_RESOLVED_PRIVATE errors on Vercel
    apiUrl = '/api';
} else {
    // Development fallback
    apiUrl = 'http://localhost:5000';
}

// Frontend URL
const envFrontendUrl = import.meta.env.VITE_FRONTEND_URL;
let frontendUrl: string;
if (envFrontendUrl) {
    frontendUrl = envFrontendUrl;
} else if (isProduction) {
    // In production, use current origin (same domain)
    frontendUrl = typeof window !== 'undefined' ? window.location.origin : '';
} else {
    // Development fallback
    frontendUrl = 'http://localhost:8080';
}

export const config = {
    apiUrl,
    frontendUrl,
    environment: import.meta.env.MODE || 'development',
    isDevelopment,
    isProduction,
} as const;


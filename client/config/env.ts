/**
 * Environment configuration
 * 
 * In production (Vercel), frontend and backend are on the same domain,
 * so we use relative URLs to avoid DNS_HOSTNAME_RESOLVED_PRIVATE errors.
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
    apiUrl = envApiUrl;
} else if (isProduction) {
    // In production, use relative URL (same domain as frontend)
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


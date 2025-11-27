/**
 * URL Configuration
 * 
 * Centralized URL configuration for server-side code.
 * Automatically switches between development and production URLs.
 */

// Detect environment - check multiple indicators
const isDevelopment = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

/**
 * Get server (backend) URL
 * @returns {string} Server URL
 */
const getServerUrl = () => {
    // Check for explicit BACKEND_URL or SERVER_URL (highest priority)
    const backendUrl = process.env.BACKEND_URL || process.env.SERVER_URL;
    
    if (backendUrl) {
        return backendUrl.replace(/\/$/, ''); // Remove trailing slash
    }
    
    // If Vercel environment is detected, use production URL
    if (process.env.VERCEL || process.env.VERCEL_URL) {
        // Use VERCEL_URL if available (includes deployment-specific domain)
        // Otherwise use the default production domain
        return process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}`
            : 'https://mock-rise-server.vercel.app';
    }
    
    // Check NODE_ENV for production
    if (process.env.NODE_ENV === 'production') {
        return 'https://mock-rise-server.vercel.app';
    }
    
    // Development fallback
    const PORT = process.env.PORT || 5000;
    return `http://localhost:${PORT}`;
};

/**
 * Get frontend (client) URL
 * @returns {string} Frontend URL
 */
const getFrontendUrl = () => {
    const frontendUrl = process.env.FRONTEND_URL;
    
    if (frontendUrl) {
        return frontendUrl.replace(/\/$/, ''); // Remove trailing slash
    }
    
    // If Vercel environment is detected, use production URL
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        return 'https://mock-rise.vercel.app';
    }
    
    // Development fallback
    return 'http://localhost:8080';
};

/**
 * Get API base URL (server URL + /api)
 * @returns {string} API base URL
 */
const getApiUrl = () => {
    const serverUrl = getServerUrl();
    return `${serverUrl}/api`;
};

// Export configuration object
const urls = {
    server: getServerUrl(),
    frontend: getFrontendUrl(),
    api: getApiUrl(),
    isDevelopment,
    isProduction,
};

// Export getters for dynamic access (in case env vars change)
urls.getServerUrl = getServerUrl;
urls.getFrontendUrl = getFrontendUrl;
urls.getApiUrl = getApiUrl;

module.exports = urls;


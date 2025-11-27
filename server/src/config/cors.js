const cors = require('cors');

/**
 * CORS configuration
 * 
 * Supports:
 * - Single origin from FRONTEND_URL environment variable
 * - Multiple origins (comma-separated)
 * - Development fallback to localhost
 * - Handles trailing slashes automatically
 */
const getCorsOrigin = () => {
    const frontendUrl = process.env.FRONTEND_URL;
    
    if (!frontendUrl) {
        // Development fallback
        return 'http://localhost:8080';
    }
    
    // Support multiple origins (comma-separated)
    if (frontendUrl.includes(',')) {
        return frontendUrl.split(',').map(url => url.trim());
    }
    
    // Remove trailing slash for consistency
    return frontendUrl.replace(/\/$/, '');
};

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = getCorsOrigin();
        const allowedOriginsArray = Array.isArray(allowedOrigins) 
            ? allowedOrigins 
            : [allowedOrigins];
        
        // Normalize origins (remove trailing slashes)
        const normalizedAllowed = allowedOriginsArray.map(orig => orig.replace(/\/$/, ''));
        const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!normalizedOrigin) {
            return callback(null, true);
        }
        
        // Check if origin is allowed
        if (normalizedAllowed.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            // Log for debugging (remove in production if needed)
            console.warn(`CORS: Blocked origin: ${origin}. Allowed: ${normalizedAllowed.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

module.exports = cors(corsOptions);


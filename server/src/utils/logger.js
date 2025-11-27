/**
 * Simple logger utility
 * In production, consider using winston or pino
 */
const logger = {
    info: (message, ...args) => {
        if (args.length > 0) {
            console.log(`[INFO] ${message}`, ...args);
        } else {
            console.log(`[INFO] ${message}`);
        }
    },
    error: (message, ...args) => {
        if (args.length > 0) {
            console.error(`[ERROR] ${message}`, ...args);
        } else {
            console.error(`[ERROR] ${message}`);
        }
    },
    warn: (message, ...args) => {
        if (args.length > 0) {
            console.warn(`[WARN] ${message}`, ...args);
        } else {
            console.warn(`[WARN] ${message}`);
        }
    },
    debug: (message, ...args) => {
        // Only log debug in development mode
        if (process.env.NODE_ENV === 'development') {
            if (args.length > 0) {
                console.debug(`[DEBUG] ${message}`, ...args);
            } else {
                console.debug(`[DEBUG] ${message}`);
            }
        }
    },
};

module.exports = logger;


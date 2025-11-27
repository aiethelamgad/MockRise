require('dotenv').config();

/**
 * Validates required environment variables and sets defaults
 */
const validateEnv = () => {
    // Set defaults for optional variables
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'development';
    }
    
    if (!process.env.PORT) {
        process.env.PORT = '5000';
    }

    // Required variables (must be set)
    const required = [
        'MONGO_URI',
        'JWT_SECRET',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        console.error('Please set these in your .env file');
        process.exit(1);
    }
};

module.exports = { validateEnv };


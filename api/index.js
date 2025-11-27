const app = require('../server/src/app');
const connectDB = require('../server/src/config/database');

// Cache database connection for serverless functions
let dbConnectionPromise = null;

// Initialize database connection (cached for serverless)
const initializeDB = async () => {
    if (!dbConnectionPromise) {
        dbConnectionPromise = connectDB().catch(error => {
            // Reset promise on error so we can retry
            dbConnectionPromise = null;
            console.error('Database connection error:', error.message);
            throw error;
        });
    }
    return dbConnectionPromise;
};

// Serverless function handler for Vercel
module.exports = async (req, res) => {
    // Initialize database if not connected
    // Mongoose will reuse connection if already established
    try {
        await initializeDB();
    } catch (error) {
        // Log error but don't block request
        // Some routes might not need DB, and Mongoose will retry on next operation
        console.error('DB initialization warning:', error.message);
    }
    
    // Pass request to Express app
    // Express app is callable and handles (req, res) directly
    return app(req, res);
};


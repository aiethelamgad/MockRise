const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * Returns connection info on success
 * Serverless-friendly: Reuses existing connection if available
 */
const connectDB = async () => {
    try {
        // Check if already connected (important for serverless functions)
        if (mongoose.connection.readyState === 1) {
            // Already connected, return existing connection info
            return {
                success: true,
                host: mongoose.connection.host,
                name: mongoose.connection.name,
            };
        }
        
        // Get MongoDB URI from environment variable
        // In Vercel, this is set in Environment Variables
        // NEVER expose this to the frontend - backend only!
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not set. Please configure it in Vercel Environment Variables.');
        }
        
        const conn = await mongoose.connect(mongoUri);
        // Extract cluster URL from connection string
        let clusterUrl = conn.connection.host;
        
        // If connection string contains cluster info, extract it
        if (mongoUri && mongoUri.includes('mongodb+srv://')) {
            try {
                // Extract cluster name from connection string (e.g., cluster0.xxxxx.mongodb.net)
                const clusterMatch = mongoUri.match(/mongodb\+srv:\/\/(?:[^@]+@)?([^/]+)/);
                if (clusterMatch && clusterMatch[1]) {
                    clusterUrl = clusterMatch[1];
                }
            } catch (e) {
                // Fallback to connection host if extraction fails
                clusterUrl = conn.connection.host;
            }
        }
        
        // Return connection info for use in startup log
        return {
            success: true,
            host: clusterUrl,
            name: conn.connection.name,
        };
    } catch (err) {
        console.log('');
        console.log(`MongoDB connection error: ${err.message}`);
        console.log('');
        // In serverless, don't exit process - throw error instead
        // process.exit(1) is only for traditional server startup
        if (process.env.VERCEL) {
            throw err; // Let serverless handler deal with it
        } else {
            process.exit(1); // Traditional server can exit
        }
    }
};

module.exports = connectDB;


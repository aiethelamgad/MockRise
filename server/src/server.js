const app = require('./app');
const connectDB = require('./config/database');
const { validateEnv } = require('./config/env');
const logger = require('./utils/logger');

// Validate environment variables
validateEnv();

// Start server function
(async () => {
    let server;
    
    try {
        // Connect to database first
        const dbConnection = await connectDB();
        
        if (!dbConnection || !dbConnection.success) {
            console.log('');
            console.log('MongoDB connection error: Connection failed');
            console.log('');
            process.exit(1);
            return;
        }

        // Start server
        const PORT = process.env.PORT || 5000;
        const NODE_ENV = process.env.NODE_ENV || 'development';
        
        server = app.listen(PORT, () => {
            // Display clean formatted startup log
            console.log('MockRise API server running');
            console.log(`URL: http://localhost:${PORT}`);
            console.log(`Environment: ${NODE_ENV}`);
            console.log(`MongoDB Connected: ${dbConnection.host}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('Unhandled Rejection:', err.message);
            if (server) {
                server.close(() => {
                    process.exit(1);
                });
            } else {
                process.exit(1);
            }
        });

    } catch (error) {
        console.log('');
        console.log(`MongoDB connection error: ${error.message}`);
        console.log('');
        process.exit(1);
    }
})();
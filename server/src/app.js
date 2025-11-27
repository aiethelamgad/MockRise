const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('./config/cors');
const passport = require('./config/passport');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const requestLogger = require('./middlewares/logger.middleware');

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(cors);

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger);
}

// Passport middleware
app.use(passport.initialize());

// API routes (includes upload routes for file serving)
app.use('/api', routes);

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'MockRise API Server',
        version: '1.0.0',
    });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;


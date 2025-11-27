const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { message, statusCode: 401 };
    }

    // Check if it's an operational error
    if (err.isOperational) {
        error.statusCode = err.statusCode;
        error.message = err.message;
    }

    const statusCode = error.statusCode || 500;

    // Only log unexpected errors (non-operational errors or server errors)
    // Operational errors (401, 403, 404) are expected business logic responses
    // and don't need to be logged as errors
    if (!err.isOperational || statusCode >= 500) {
        logger.error(err.stack || err.message);
    }
    // Operational errors with status < 500 (401, 403, 404, etc.) are not logged
    // as they are expected responses to invalid requests

    res.status(statusCode).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
    });
};

module.exports = errorHandler;


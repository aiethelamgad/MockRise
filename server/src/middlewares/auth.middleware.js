const User = require('../models/User');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { validateToken } = require('../services/token.service');

/**
 * Protect routes - require authentication
 */
const protect = async (req, res, next) => {
    let token;

    // Get token from cookies
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Get token from header as fallback
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return next(new UnauthorizedError('Not authorized to access this route'));
    }

    try {
        // Verify token
        const decoded = validateToken(token);

        // Get user from token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new UnauthorizedError('User not found'));
        }

        next();
    } catch (err) {
        return next(new UnauthorizedError('Not authorized to access this route'));
    }
};

/**
 * Grant access to specific roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError(`User role ${req.user.role} is not authorized to access this route`));
        }
        next();
    };
};

/**
 * Optional authentication - sets req.user if token is valid, but doesn't fail if token is missing
 */
const optionalAuth = async (req, res, next) => {
    let token;

    // Get token from cookies
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Get token from header as fallback
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token, just continue without setting req.user (for public access)
    if (!token) {
        return next();
    }

    try {
        // Verify token
        const decoded = validateToken(token);

        // Get user from token
        const user = await User.findById(decoded.id);

        if (user) {
            req.user = user;
        }
        // If user not found, just continue without req.user (don't fail)

        next();
    } catch (err) {
        // If token is invalid, just continue without req.user (don't fail)
        next();
    }
};

module.exports = {
    protect,
    authorize,
    optionalAuth,
};


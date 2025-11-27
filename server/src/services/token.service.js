const { generateToken, verifyToken } = require('../utils/generateToken');

/**
 * Generate JWT token for user
 */
const createToken = (user) => {
    return generateToken(user);
};

/**
 * Verify JWT token
 */
const validateToken = (token) => {
    return verifyToken(token);
};

/**
 * Get redirect path based on user role and status
 */
const getRedirectPath = (role, status) => {
    switch (role) {
        case 'admin':
            return '/dashboard/admin';
        case 'interviewer':
            // Check interviewer status
            if (status === 'pending_verification') {
                return '/pending-verification';
            }
            if (status === 'rejected') {
                return '/rejected-notice';
            }
            if (status === 'approved') {
                return '/dashboard/interviewer';
            }
            // Default fallback for interviewers without status
            return '/pending-verification';
        case 'trainee':
        default:
            return '/dashboard/trainee';
    }
};

/**
 * Set token cookie
 */
const setTokenCookie = (res, token) => {
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    };
    res.cookie('token', token, options);
};

module.exports = {
    createToken,
    validateToken,
    getRedirectPath,
    setTokenCookie,
};


const express = require('express');
const passport = require('passport');
const {
    register,
    login,
    getMe,
    logout,
    assignRole,
    forgotPassword,
    validateResetToken,
    resetPassword,
    sendTokenResponse,
} = require('../../controllers/auth.controller');
const { protect } = require('../../middlewares/auth.middleware');
const tokenService = require('../../services/token.service');
const urls = require('../../config/urls');

const router = express.Router();

/**
 * Helper function for OAuth success redirect
 */
const oauthSuccessHandler = (req, res) => {
    const frontendUrl = urls.getFrontendUrl();
    
    if (!req.user) {
        return res.redirect(`${frontendUrl}/login?error=oauth_failed&message=${encodeURIComponent('OAuth authentication failed. Please try again.')}`);
    }

    // Check for OAuth errors (from passport callback)
    if (req.query.error) {
        const errorMessage = req.query.error_description || req.query.error || 'OAuth authentication failed';
        return res.redirect(`${frontendUrl}/login?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`);
    }

    const token = tokenService.createToken(req.user);
    tokenService.setTokenCookie(res, token);
    
    // Check if user needs role selection (new OAuth user without role)
    if (req.user.oauthRolePending) {
        // Redirect to role selection page
        return res.redirect(`${frontendUrl}/oauth/select-role`);
    }

    // User already has a role, proceed with normal redirect
    const redirectPath = tokenService.getRedirectPath(req.user.role, req.user.status);
    res.redirect(`${frontendUrl}${redirectPath}`);
};

// Email/Password routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/assign-role', protect, assignRole); // OAuth role assignment

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

// Google OAuth
router.get('/google', (req, res, next) => {
    // Role is no longer required upfront - will be selected after OAuth
    // Still support role parameter for backward compatibility
    const role = req.query.role;
    
    // If role is provided (backward compatibility), validate it
    if (role) {
        const { isAllowedOAuthRole, isAdminRole, normalizeRole } = require('../../utils/roleValidation');
        const normalizedRole = normalizeRole(role);
        
        // Block admin roles
        if (isAdminRole(normalizedRole)) {
            const frontendUrl = urls.getFrontendUrl();
            return res.redirect(`${frontendUrl}/login?error=oauth_invalid_role&message=${encodeURIComponent('Admin roles cannot be assigned through OAuth sign-up.')}`);
        }
        
        // Validate role if provided
        if (!isAllowedOAuthRole(normalizedRole)) {
            const frontendUrl = urls.getFrontendUrl();
            return res.redirect(`${frontendUrl}/login?error=oauth_invalid_role&message=${encodeURIComponent(`Invalid role. Only 'trainee' and 'interviewer' roles are allowed.`)}`);
        }
        
        // Pass role in state for backward compatibility
        const state = JSON.stringify({ role: normalizedRole });
        return passport.authenticate('google', {
            scope: ['profile', 'email'],
            session: false,
            state,
        })(req, res, next);
    }
    
    // No role specified - will prompt for role selection after OAuth
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    // Extract role from state query parameter if it exists
    let roleFromState;
    if (req.query.state) {
        try {
            const state = JSON.parse(req.query.state);
            roleFromState = state.role;
        } catch (e) {
            // Silently fail - state parsing errors are non-critical
        }
    }
    req.roleFromState = roleFromState;
    next();
}, (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: false,
        session: false,
    }, (err, user, info) => {
        if (err) {
            // Handle authentication errors (including role validation errors)
            const frontendUrl = urls.getFrontendUrl();
            let errorMessage = 'OAuth authentication failed. Please try again.';
            
            if (err.message) {
                errorMessage = err.message;
            }
            
            // Map error types to user-friendly messages
            if (err.statusCode === 403 || err.message.includes('Admin roles')) {
                errorMessage = 'Admin roles cannot be assigned through OAuth sign-up. Please contact an administrator.';
            } else if (err.statusCode === 400 || err.message.includes('Invalid role')) {
                errorMessage = err.message;
            }
            
            return res.redirect(`${frontendUrl}/login?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`);
        }
        
        if (!user) {
            const frontendUrl = urls.getFrontendUrl();
            return res.redirect(`${frontendUrl}/login?error=oauth_failed&message=${encodeURIComponent('OAuth authentication failed. Please try again.')}`);
        }
        
        req.user = user;
        next();
    })(req, res, next);
}, oauthSuccessHandler);

// GitHub OAuth
router.get('/github', (req, res, next) => {
    // Role is no longer required upfront - will be selected after OAuth
    // Still support role parameter for backward compatibility
    const role = req.query.role;
    
    // If role is provided (backward compatibility), validate it
    if (role) {
        const { isAllowedOAuthRole, isAdminRole, normalizeRole } = require('../../utils/roleValidation');
        const normalizedRole = normalizeRole(role);
        
        // Block admin roles
        if (isAdminRole(normalizedRole)) {
            const frontendUrl = urls.getFrontendUrl();
            return res.redirect(`${frontendUrl}/login?error=oauth_invalid_role&message=${encodeURIComponent('Admin roles cannot be assigned through OAuth sign-up.')}`);
        }
        
        // Validate role if provided
        if (!isAllowedOAuthRole(normalizedRole)) {
            const frontendUrl = urls.getFrontendUrl();
            return res.redirect(`${frontendUrl}/login?error=oauth_invalid_role&message=${encodeURIComponent(`Invalid role. Only 'trainee' and 'interviewer' roles are allowed.`)}`);
        }
        
        // Pass role in state for backward compatibility
        const state = JSON.stringify({ role: normalizedRole });
        return passport.authenticate('github', {
            scope: ['user:email'],
            session: false,
            state,
        })(req, res, next);
    }
    
    // No role specified - will prompt for role selection after OAuth
    passport.authenticate('github', {
        scope: ['user:email'],
        session: false,
    })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
    // Extract role from state query parameter if it exists
    let roleFromState;
    if (req.query.state) {
        try {
            const state = JSON.parse(req.query.state);
            roleFromState = state.role;
        } catch (e) {
            // Silently fail - state parsing errors are non-critical
        }
    }
    req.roleFromState = roleFromState;
    next();
}, (req, res, next) => {
    passport.authenticate('github', {
        failureRedirect: false,
        session: false,
    }, (err, user, info) => {
        if (err) {
            // Handle authentication errors (including role validation errors)
            const frontendUrl = urls.getFrontendUrl();
            let errorMessage = 'OAuth authentication failed. Please try again.';
            
            if (err.message) {
                errorMessage = err.message;
            }
            
            // Map error types to user-friendly messages
            if (err.statusCode === 403 || err.message.includes('Admin roles')) {
                errorMessage = 'Admin roles cannot be assigned through OAuth sign-up. Please contact an administrator.';
            } else if (err.statusCode === 400 || err.message.includes('Invalid role')) {
                errorMessage = err.message;
            }
            
            return res.redirect(`${frontendUrl}/login?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`);
        }
        
        if (!user) {
            const frontendUrl = urls.getFrontendUrl();
            return res.redirect(`${frontendUrl}/login?error=oauth_failed&message=${encodeURIComponent('OAuth authentication failed. Please try again.')}`);
        }
        
        req.user = user;
        next();
    })(req, res, next);
}, oauthSuccessHandler);

module.exports = router;


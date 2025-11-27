const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Helper function to send token response
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = tokenService.createToken(user);
    const redirectPath = tokenService.getRedirectPath(user.role, user.status);

    tokenService.setTokenCookie(res, token);

    // If headers already sent (OAuth flow), don't send JSON
    if (res.headersSent) {
        return;
    }

    res.status(statusCode).json({
        success: true,
        token,
        role: user.role,
        redirect: redirectPath,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            permissions: [],
            isApproved: user.isApproved,
        },
    });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, experience, expertise, linkedin, resume } = req.body;

    const user = await authService.register({ 
        name, 
        email, 
        password, 
        role, 
        experience, 
        expertise, 
        linkedin, 
        resume 
    });
    sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await authService.login({ email, password });
    sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await authService.getUserById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        data: {},
    });
});

/**
 * @desc    Assign role after OAuth sign-up
 * @route   POST /api/auth/assign-role
 * @access  Private
 */
exports.assignRole = asyncHandler(async (req, res, next) => {
    const { role, experience, expertise, linkedin, resume } = req.body;
    const userId = req.user.id;

    // Validate role
    const { isAllowedOAuthRole, isAdminRole, normalizeRole } = require('../utils/roleValidation');
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
        return res.status(400).json({
            success: false,
            error: 'Role is required',
        });
    }

    // Block admin roles
    if (isAdminRole(normalizedRole)) {
        return res.status(403).json({
            success: false,
            error: 'Admin roles cannot be assigned through OAuth sign-up. Please contact an administrator.',
        });
    }

    // Validate role is allowed for OAuth
    if (!isAllowedOAuthRole(normalizedRole)) {
        return res.status(400).json({
            success: false,
            error: `Invalid role. Only 'trainee' and 'interviewer' roles are allowed.`,
        });
    }

    // Validate interviewer-specific fields
    if (normalizedRole === 'interviewer') {
        if (!experience) {
            return res.status(400).json({
                success: false,
                error: 'Years of experience is required for interviewers.',
            });
        }
        if (!expertise || !expertise.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Area of expertise is required for interviewers.',
            });
        }
        if (!linkedin || !linkedin.trim()) {
            return res.status(400).json({
                success: false,
                error: 'LinkedIn profile URL is required for interviewers.',
            });
        }
        // Validate LinkedIn URL format
        if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(linkedin)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid LinkedIn profile URL.',
            });
        }
        if (!resume) {
            return res.status(400).json({
                success: false,
                error: 'Resume upload is required for interviewers.',
            });
        }
    }

    // Check if user needs role assignment
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found',
        });
    }

    // Only allow role assignment if oauthRolePending is true (new OAuth user)
    if (!user.oauthRolePending) {
        return res.status(400).json({
            success: false,
            error: 'Role has already been assigned. Cannot change role through this endpoint.',
        });
    }

    // Update user role and status
    user.role = normalizedRole;
    user.oauthRolePending = false;

    // Handle interviewer role with additional fields
    if (normalizedRole === 'interviewer') {
        user.status = 'pending_verification';
        user.isApproved = false;
        user.experience = experience;
        user.expertise = expertise;
        user.linkedin = linkedin;
        if (resume) {
            user.resume = resume;
        }
    } else {
        user.status = 'approved';
        user.isApproved = true;
    }

    await user.save();

    // Notify admins if interviewer was assigned
    if (normalizedRole === 'interviewer') {
        const { notifyAllAdmins } = require('../services/notification.service');
        try {
            await notifyAllAdmins({
                title: 'New Pending Interviewer Application (OAuth)',
                message: `${user.name || user.email} has submitted an interviewer application via OAuth sign-up and is awaiting review.`,
                type: 'info',
                metadata: {
                    interviewerId: user._id.toString(),
                    interviewerName: user.name || user.email,
                    type: 'pending_interviewer_application',
                    oauthProvider: user.googleId ? 'google' : user.githubId ? 'github' : 'unknown',
                    incompleteProfile: false, // Profile is complete now
                },
            });
        } catch (notificationError) {
            console.error('[Auth] Failed to create notification for OAuth interviewer:', notificationError.message);
        }
    }

    // Return response with updated user info
    sendTokenResponse(user, 200, res);
});

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Email is required',
        });
    }

    try {
        const passwordResetService = require('../services/passwordReset.service');
        const emailService = require('../services/email.service');

        // Generate reset token
        const tokenData = await passwordResetService.generateResetToken(email);

        // Handle OAuth accounts - return specific error
        if (tokenData && tokenData.error === 'oauth_account') {
            const providerNames = tokenData.providers.join(' or ');
            
            return res.status(400).json({
                success: false,
                error: 'oauth_account',
                message: `This email is associated with a ${providerNames} account. Please sign in using your OAuth provider.`,
            });
        }

        // Handle valid email/password accounts
        if (tokenData && tokenData.success && tokenData.token) {
            try {
                await emailService.sendPasswordResetEmail({
                    email: tokenData.user.email,
                    name: tokenData.user.name,
                    resetToken: tokenData.token,
                });
                
                return res.status(200).json({
                    success: true,
                    message: 'A password reset link has been sent to your email.',
                });
            } catch (emailError) {
                console.error('[Auth] Failed to send password reset email:', emailError.message);
                
                // Return error for email sending failure
                return res.status(500).json({
                    success: false,
                    error: 'email_send_failed',
                    message: 'Failed to send password reset email. Please try again later.',
                });
            }
        }

        // User not found - always return success to prevent email enumeration
        res.status(200).json({
            success: true,
            message: 'If that email exists in our system, a password reset link has been sent.',
        });
    } catch (error) {
        // Always return success to prevent email enumeration
        console.error('[Auth] Error in forgot password:', error.message);
        res.status(200).json({
            success: true,
            message: 'If that email exists in our system, a password reset link has been sent.',
        });
    }
});

/**
 * @desc    Validate reset token
 * @route   GET /api/auth/reset-password/:token
 * @access  Public
 */
exports.validateResetToken = asyncHandler(async (req, res, next) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({
            success: false,
            error: 'Reset token is required',
        });
    }

    try {
        const passwordResetService = require('../services/passwordReset.service');
        await passwordResetService.validateResetToken(token);

        res.status(200).json({
            success: true,
            message: 'Reset token is valid',
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Invalid or expired reset token',
        });
    }
});

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            error: 'Reset token is required',
        });
    }

    if (!password) {
        return res.status(400).json({
            success: false,
            error: 'Password is required',
        });
    }

    // Validate password strength (min 8 characters)
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 8 characters long',
        });
    }

    try {
        const passwordResetService = require('../services/passwordReset.service');
        const user = await passwordResetService.resetPassword(token, password);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.',
            data: {
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to reset password. The token may be invalid or expired.',
        });
    }
});

module.exports.sendTokenResponse = sendTokenResponse;


const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { NotFoundError } = require('../utils/errors');

/**
 * Generate and save password reset token for user
 */
const generateResetToken = async (email) => {
    // Find user by email
    const user = await User.findOne({ email });

    // Don't reveal if user doesn't exist (security best practice)
    if (!user) {
        return { error: 'not_found' }; // User doesn't exist
    }

    // Check if user has password (OAuth users without password can't reset)
    if (!user.password) {
        // Determine which OAuth provider(s) the user used
        const providers = [];
        if (user.googleId) providers.push('Google');
        if (user.githubId) providers.push('GitHub');
        if (user.linkedinId) providers.push('LinkedIn');
        
        return { 
            error: 'oauth_account',
            providers: providers.length > 0 ? providers : ['OAuth']
        };
    }

    // Invalidate any existing unused tokens for this user
    await PasswordResetToken.updateMany(
        { userId: user._id, used: false },
        { used: true }
    );

    // Generate new token
    const token = PasswordResetToken.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Create reset token document
    const resetToken = await PasswordResetToken.create({
        userId: user._id,
        token,
        expiresAt,
    });

    return {
        success: true,
        token,
        user,
        resetToken,
    };
};

/**
 * Validate reset token
 */
const validateResetToken = async (token) => {
    const resetToken = await PasswordResetToken.findValidToken(token);

    if (!resetToken) {
        throw new NotFoundError('Invalid or expired reset token');
    }

    // Populate user to check if account is OAuth-only
    await resetToken.populate('userId');
    const user = resetToken.userId;

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Check if user has a password (not OAuth-only)
    if (!user.password) {
        throw new NotFoundError('This account uses OAuth login. Please sign in with your OAuth provider.');
    }

    return resetToken;
};

/**
 * Reset password using token
 */
const resetPassword = async (token, newPassword) => {
    // Validate token
    const resetToken = await validateResetToken(token);

    // Get user
    await resetToken.populate('userId');
    const user = resetToken.userId;
    
    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Check if user has a password (not OAuth-only)
    if (!user.password) {
        throw new NotFoundError('This account uses OAuth login. Please sign in with your OAuth provider.');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    // Invalidate all other unused tokens for this user
    await PasswordResetToken.updateMany(
        { userId: user._id, used: false, _id: { $ne: resetToken._id } },
        { used: true }
    );

    return user;
};

module.exports = {
    generateResetToken,
    validateResetToken,
    resetPassword,
};


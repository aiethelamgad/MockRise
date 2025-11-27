const mongoose = require('mongoose');
const crypto = require('crypto');

const PasswordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
    used: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for efficient queries
PasswordResetTokenSchema.index({ userId: 1, used: 1, expiresAt: 1 });
PasswordResetTokenSchema.index({ token: 1 });

// Generate secure random token
PasswordResetTokenSchema.statics.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Create token for user
PasswordResetTokenSchema.statics.createToken = async function(userId, hours = 1) {
    // Invalidate any existing unused tokens for this user
    await this.updateMany(
        { userId, used: false },
        { used: true }
    );

    // Generate new token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Create reset token document
    const resetToken = await this.create({
        userId,
        token,
        expiresAt,
    });

    return resetToken;
};

// Find valid token
PasswordResetTokenSchema.statics.findValidToken = async function(token) {
    const resetToken = await this.findOne({
        token,
        used: false,
        expiresAt: { $gt: new Date() },
    });

    return resetToken;
};

const PasswordResetToken = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);

module.exports = PasswordResetToken;

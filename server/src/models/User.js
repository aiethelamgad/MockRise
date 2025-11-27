const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        sparse: true, // Allows null values for OAuth users without email
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId && !this.githubId && !this.linkedinId;
        },
    },
    role: {
        type: String,
        enum: ['trainee', 'admin', 'interviewer'],
        default: 'trainee',
        required: true,
    },
    // Flag to track if OAuth user needs to select their role
    oauthRolePending: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['pending_verification', 'approved', 'rejected'],
        default: function() {
            // Interviewers default to pending_verification, others default to approved
            return this.role === 'interviewer' ? 'pending_verification' : 'approved';
        },
    },
    isApproved: {
        type: Boolean,
        default: function() {
            // For backward compatibility - derives from status
            return this.status !== 'pending_verification' && this.status !== 'rejected';
        },
    },
    // Interviewer-specific fields
    experience: {
        type: String,
    },
    expertise: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    resume: {
        type: String, // URL or file path to resume
    },
    googleId: String,
    githubId: String,
    // linkedinId: String,
    name: String,
}, { timestamps: true });

// Virtual to sync isApproved with status
UserSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.isApproved = this.status === 'approved';
    }
    next();
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;


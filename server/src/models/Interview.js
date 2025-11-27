const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    // Core booking information
    mode: {
        type: String,
        enum: ['ai', 'peer', 'family', 'live'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Only required for 'live' mode
    },
    
    // Scheduling
    scheduledDate: {
        type: Date,
        required: true,
        index: true,
    },
    timeSlot: {
        type: String,
        required: true, // Format: "09:00 AM", "02:00 PM", etc.
    },
    duration: {
        type: Number,
        required: true,
        enum: [30, 45, 60, 90], // Duration in minutes
    },
    
    // Session details
    language: {
        type: String,
        enum: ['english', 'arabic'],
        default: 'english',
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
    },
    focusArea: {
        type: String,
        required: false, // Only for AI mode
        // Should match SKILL_TREE categories
    },
    
    // Consent flags
    consentFlags: {
        recording: {
            type: Boolean,
            default: false,
        },
        dataUsage: {
            type: Boolean,
            default: false,
        },
        // Add more consent types as needed
    },
    
    // Status tracking
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled',
        index: true,
    },
    
    // Mode-specific data
    meetingLink: {
        type: String,
        required: false, // For family & friends (Zoom) or live interviews
    },
    sessionId: {
        type: String,
        required: false, // For AI mode
    },
    
    // Metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        // Store mode-specific data like:
        // - Peer matching info
        // - AI session configuration
        // - Family & Friends invite details
    },
    
    // Timestamps
    startedAt: {
        type: Date,
        required: false,
    },
    completedAt: {
        type: Date,
        required: false,
    },
    cancelledAt: {
        type: Date,
        required: false,
    },
    cancellationReason: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Indexes for efficient queries
InterviewSchema.index({ userId: 1, status: 1 });
InterviewSchema.index({ interviewerId: 1, status: 1 });
InterviewSchema.index({ scheduledDate: 1, timeSlot: 1 });
InterviewSchema.index({ mode: 1, status: 1 });

// Virtual for checking if interview is upcoming
InterviewSchema.virtual('isUpcoming').get(function() {
    const now = new Date();
    const scheduledDateTime = new Date(this.scheduledDate);
    const [hours, minutes, period] = this.timeSlot.split(/[: ]/);
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    scheduledDateTime.setHours(hour, parseInt(minutes), 0, 0);
    return scheduledDateTime > now && this.status === 'scheduled';
});

// Pre-save validation
InterviewSchema.pre('save', function(next) {
    // Validate that live interviews have an interviewer
    if (this.mode === 'live' && !this.interviewerId) {
        return next(new Error('Live interviews require an assigned interviewer'));
    }
    next();
});

const Interview = mongoose.model('Interview', InterviewSchema);

module.exports = Interview;


const mongoose = require('mongoose');

const AISessionSchema = new mongoose.Schema({
    // Reference to the interview
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
        unique: true, // unique automatically creates an index
    },
    
    // Session identifier
    sessionId: {
        type: String,
        required: true,
        unique: true, // unique automatically creates an index
    },
    
    // Specialty/Focus area
    specialty: {
        type: String,
        required: false,
        // Should match SKILL_TREE categories
    },
    
    // Session configuration
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
    },
    language: {
        type: String,
        enum: ['english', 'arabic'],
        default: 'english',
    },
    
    // Metrics - stored as JSON for flexibility
    metrics: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        // Example structure:
        // {
        //   clarity: 8.5,
        //   tone: 7.2,
        //   confidence: 9.1,
        //   engagement: 8.7,
        //   overall: 8.4
        // }
    },
    
    // Transcript
    transcript: {
        type: String,
        default: '',
    },
    
    // Questions asked during the session
    questions: [{
        question: String,
        answer: String,
        score: Number,
        feedback: String,
        timestamp: Date,
    }],
    
    // Session status
    status: {
        type: String,
        enum: ['initialized', 'in_progress', 'completed', 'abandoned'],
        default: 'initialized',
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
    
    // Additional data
    configuration: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        // AI model configuration, parameters, etc.
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Index for efficient queries
// Note: interviewId and sessionId already have indexes from unique: true
AISessionSchema.index({ status: 1 });

// Method to calculate overall score from metrics
AISessionSchema.methods.calculateOverallScore = function() {
    if (!this.metrics || Object.keys(this.metrics).length === 0) {
        return 0;
    }
    
    const scores = Object.values(this.metrics).filter(
        val => typeof val === 'number' && !isNaN(val)
    );
    
    if (scores.length === 0) return 0;
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / scores.length) * 10) / 10;
};

const AISession = mongoose.model('AISession', AISessionSchema);

module.exports = AISession;


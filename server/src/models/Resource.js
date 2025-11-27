const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    resourceType: {
        type: String,
        enum: ['guide', 'video', 'question_bank', 'course', 'article'],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        // Main category: Front-End Development, Back-End Development, Full-Stack Development, Mobile Development, DevOps & Cloud, Software Testing & QA, UI/UX Design, Soft Skills & Career
    },
    subcategory: {
        type: String,
        required: false,
        trim: true,
        // Subcategory within the category (e.g., React, Node.js, Flutter, etc.)
    },
    contentUrl: {
        type: String,
        required: true,
        // Can be PDF link, video link, external URL, local file URL
    },
    thumbnailUrl: {
        type: String,
        default: '',
        // Cloudinary URL for thumbnails
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Make optional for imported data
    },
    tags: {
        type: [String],
        default: [],
        // Array of tags for better searchability
    },
    duration: {
        type: String,
        default: '',
        // For videos and courses (e.g., "2 hours", "45 minutes")
    },
    views: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    author: {
        type: String,
        default: '',
    },
    // Additional fields for question bank resources
    questionText: {
        type: String,
        default: '',
    },
    answerSample: {
        type: String,
        default: '',
    },
    // Make createdAt and updatedAt flexible for imported data
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // Don't overwrite existing timestamps on update
    minimize: false
});

// Index for faster queries
ResourceSchema.index({ resourceType: 1, category: 1, subcategory: 1 });
ResourceSchema.index({ difficulty: 1 });
ResourceSchema.index({ category: 1, subcategory: 1 });
ResourceSchema.index({ createdAt: -1 });
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Text search index

const Resource = mongoose.model('Resource', ResourceSchema);

module.exports = Resource;


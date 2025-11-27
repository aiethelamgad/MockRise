const mongoose = require('mongoose');

const AvailableSlotSchema = new mongoose.Schema({
    // Date and time
    date: {
        type: Date,
        required: true,
        index: true,
    },
    time: {
        type: String,
        required: true, // Format: "09:00 AM", "02:00 PM", etc.
        index: true,
    },
    
    // Mode - primarily for Live Mock Interviews
    mode: {
        type: String,
        enum: ['live', 'ai', 'peer', 'family'],
        default: 'live',
        required: true,
    },
    
    // Availability status
    isBooked: {
        type: Boolean,
        default: false,
        index: true,
    },
    
    // Interviewer assignment (for live mode)
    interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Only for live mode
        index: true,
    },
    
    // Associated interview (when booked)
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: false,
    },
    
    // Metadata
    timezone: {
        type: String,
        default: 'UTC',
    },
    
    // Availability window (optional - for recurring slots)
    recurring: {
        type: Boolean,
        default: false,
    },
    endDate: {
        type: Date,
        required: false, // For recurring slots
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Compound index for efficient availability queries
AvailableSlotSchema.index({ date: 1, time: 1, mode: 1, isBooked: 1 });
AvailableSlotSchema.index({ interviewerId: 1, date: 1, isBooked: 1 });

// Virtual to check if slot is in the past
AvailableSlotSchema.virtual('isPast').get(function() {
    const now = new Date();
    const slotDateTime = new Date(this.date);
    const [hours, minutes, period] = this.time.split(/[: ]/);
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    slotDateTime.setHours(hour, parseInt(minutes), 0, 0);
    return slotDateTime < now;
});

// Method to mark slot as booked
AvailableSlotSchema.methods.bookSlot = function(interviewId) {
    this.isBooked = true;
    this.interviewId = interviewId;
    return this.save();
};

// Method to release slot
AvailableSlotSchema.methods.releaseSlot = function() {
    this.isBooked = false;
    this.interviewId = null;
    return this.save();
};

const AvailableSlot = mongoose.model('AvailableSlot', AvailableSlotSchema);

module.exports = AvailableSlot;


const AvailableSlot = require('../models/AvailableSlot');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

/**
 * @desc    Get interviewer's available slots
 * @route   GET /api/interviewer/availability
 * @access  Private (Interviewer only)
 */
exports.getAvailability = asyncHandler(async (req, res, next) => {
    // User role is already validated by middleware
    const interviewerId = req.user.id;

    // Optional query parameters for filtering
    const { date, mode = 'live', includeBooked = 'false' } = req.query;

    // Build query
    const query = {
        interviewerId: interviewerId,
        mode: mode,
    };

    // Filter by date if provided
    if (date) {
        // Parse date string (expected format: YYYY-MM-DD)
        // Split and reconstruct to avoid timezone issues
        const dateParts = date.split('-');
        if (dateParts.length !== 3) {
            return next(new BadRequestError('Invalid date format. Expected YYYY-MM-DD'));
        }
        
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(dateParts[2]);
        
        // Create date at midnight UTC to match how slots are stored
        // Use the exact same date construction method as when storing slots
        const selectedDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        
        if (isNaN(selectedDate.getTime())) {
            return next(new BadRequestError('Invalid date'));
        }
        
        // Calculate next day start at midnight UTC for exclusive upper bound
        // This ensures we only get slots for the exact date, not the next day
        const nextDayStart = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0));

        // Query for exact date match - slots are stored at 00:00:00.000 UTC
        // Using exclusive upper bound (<) ensures Nov 28 slots don't appear when filtering Nov 27
        query.date = {
            $gte: selectedDate,      // >= Nov 27 00:00:00 UTC
            $lt: nextDayStart,       // < Nov 28 00:00:00 UTC
        };
    }

    // Filter out booked slots unless includeBooked is true
    if (includeBooked !== 'true') {
        query.isBooked = false;
    }

    // Fetch slots
    let slots = await AvailableSlot.find(query)
        .sort({ date: 1, time: 1 })
        .lean();

    // Filter out past slots - check both date and time
    const now = new Date();
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);

    slots = slots.filter(slot => {
        if (!slot.date) return false;
        
        const slotDate = new Date(slot.date);
        slotDate.setUTCHours(0, 0, 0, 0);
        
        // If slot date is in the past, exclude it
        if (slotDate < today) {
            return false;
        }
        
        // If slot date is today, check if time is in the past
        if (slotDate.getTime() === today.getTime()) {
            const currentHour = now.getUTCHours();
            const currentMinute = now.getUTCMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;
            
            // Parse slot time
            const [hours, minutes, period] = slot.time.split(/[: ]/);
            let hour = parseInt(hours);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            const slotMinutes = parseInt(minutes);
            const slotTimeInMinutes = hour * 60 + slotMinutes;
            
            // Only include slots that are in the future (at least 1 minute ahead)
            return slotTimeInMinutes > currentTimeInMinutes;
        }
        
        // Future dates are fine
        return true;
    });

    // Format response
    const formattedSlots = slots.map(slot => ({
        _id: slot._id,
        date: slot.date ? new Date(slot.date).toISOString() : null,
        time: slot.time,
        mode: slot.mode,
        isBooked: slot.isBooked,
        interviewId: slot.interviewId || null,
        createdAt: slot.createdAt ? new Date(slot.createdAt).toISOString() : null,
        updatedAt: slot.updatedAt ? new Date(slot.updatedAt).toISOString() : null,
    }));

    res.status(200).json({
        success: true,
        data: formattedSlots,
    });
});

/**
 * @desc    Add a new available slot
 * @route   POST /api/interviewer/availability/add
 * @access  Private (Interviewer only)
 */
exports.addAvailability = asyncHandler(async (req, res, next) => {
    const interviewerId = req.user.id;
    const { date, time, mode = 'live' } = req.body;

    // Validation
    if (!date || !time) {
        return next(new BadRequestError('Date and time are required'));
    }

    // Validate mode
    const validModes = ['live', 'ai', 'peer', 'family'];
    if (!validModes.includes(mode)) {
        return next(new BadRequestError('Invalid mode. Must be one of: live, ai, peer, family'));
    }

    // Validate and parse date - handle YYYY-MM-DD format consistently
    // Parse date string to avoid timezone conversion issues
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
        return next(new BadRequestError('Invalid date format. Expected YYYY-MM-DD'));
    }
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateParts[2]);
    
    // Create date at midnight UTC to avoid timezone shifts
    const slotDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    
    if (isNaN(slotDate.getTime())) {
        return next(new BadRequestError('Invalid date'));
    }

    // Validate time format (should be like "09:00 AM" or "02:00 PM")
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    if (!timeRegex.test(time)) {
        return next(new BadRequestError('Invalid time format. Use format like "09:00 AM" or "02:00 PM"'));
    }

    // Check if date is in the past - use UTC for consistency
    const now = new Date();
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);
    
    if (slotDate < today) {
        return next(new BadRequestError('Cannot add availability for past dates'));
    }

    // If adding for today, check if time is in the past
    if (slotDate.getTime() === today.getTime()) {
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const bufferMinutes = 30; // 30 minute buffer

        // Parse slot time
        const [hours, minutes, period] = time.split(/[: ]/);
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const slotMinutes = parseInt(minutes);
        const slotTimeInMinutes = hour * 60 + slotMinutes;

        if (slotTimeInMinutes <= (currentTimeInMinutes + bufferMinutes)) {
            return next(new BadRequestError('Cannot add availability for past times. Please select a time at least 30 minutes in the future'));
        }
    }

    // Check if slot already exists
    const existingSlot = await AvailableSlot.findOne({
        interviewerId: interviewerId,
        date: slotDate,
        time: time,
        mode: mode,
    });

    if (existingSlot) {
        return next(new BadRequestError('This time slot already exists for this date'));
    }

    // Create the slot
    const slot = await AvailableSlot.create({
        interviewerId: interviewerId,
        date: slotDate,
        time: time,
        mode: mode,
        isBooked: false,
    });

    // Format response
    const slotResponse = {
        _id: slot._id,
        date: slot.date ? new Date(slot.date).toISOString() : null,
        time: slot.time,
        mode: slot.mode,
        isBooked: slot.isBooked,
        interviewId: slot.interviewId || null,
        createdAt: slot.createdAt ? new Date(slot.createdAt).toISOString() : null,
        updatedAt: slot.updatedAt ? new Date(slot.updatedAt).toISOString() : null,
    };

    res.status(201).json({
        success: true,
        data: slotResponse,
        message: 'Availability slot added successfully',
    });
});

/**
 * @desc    Delete an available slot
 * @route   DELETE /api/interviewer/availability/delete/:slotId
 * @access  Private (Interviewer only)
 */
exports.deleteAvailability = asyncHandler(async (req, res, next) => {
    const interviewerId = req.user.id;
    const { slotId } = req.params;

    if (!slotId) {
        return next(new BadRequestError('Slot ID is required'));
    }

    // Find the slot
    const slot = await AvailableSlot.findById(slotId);

    if (!slot) {
        return next(new NotFoundError('Availability slot not found'));
    }

    // Security check: Ensure the slot belongs to this interviewer
    if (slot.interviewerId.toString() !== interviewerId.toString()) {
        return next(new ForbiddenError('You do not have permission to delete this slot'));
    }

    // Prevent deletion of booked slots
    if (slot.isBooked) {
        return next(new BadRequestError('Cannot delete a slot that has been booked. Please cancel the interview first.'));
    }

    // Delete the slot
    await AvailableSlot.findByIdAndDelete(slotId);

    res.status(200).json({
        success: true,
        message: 'Availability slot deleted successfully',
    });
});


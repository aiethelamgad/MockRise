const Interview = require('../models/Interview');
const AvailableSlot = require('../models/AvailableSlot');
const AISession = require('../models/AISession');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const mongoose = require('mongoose');

/**
 * @desc    Get available time slots for a given date and mode
 * @route   GET /api/bookings/slots
 * @access  Private (Trainee, Interviewer, Admin)
 */
exports.getAvailableSlots = asyncHandler(async (req, res, next) => {
    const { date, mode } = req.query;

    if (!date || !mode) {
        return next(new BadRequestError('Date and mode parameters are required'));
    }

    // Validate mode
    const validModes = ['ai', 'peer', 'family', 'live'];
    if (!validModes.includes(mode)) {
        return next(new BadRequestError('Invalid mode. Must be one of: ai, peer, family, live'));
    }

    // Parse and validate date - handle YYYY-MM-DD format consistently
    // Parse date string to avoid timezone conversion issues
    let selectedDate;
    if (typeof date === 'string' && date.includes('-')) {
        const dateParts = date.split('-');
        if (dateParts.length === 3) {
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
            const day = parseInt(dateParts[2]);
            // Create date at midnight UTC to match how slots are stored
            selectedDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        } else {
            selectedDate = new Date(date);
        }
    } else {
        selectedDate = new Date(date);
    }
    
    if (isNaN(selectedDate.getTime())) {
        return next(new BadRequestError('Invalid date format'));
    }

    // Ensure date is at start of day in UTC
    selectedDate.setUTCHours(0, 0, 0, 0);

    // Check if date is in the past - reject immediately
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    if (selectedDate < now) {
        return res.status(200).json({
            success: true,
            data: {
                date: selectedDate.toISOString(),
                mode: mode,
                slots: [], // Return empty array for past dates
            },
        });
    }

    // Get available slots
    let slots = [];

    if (mode === 'live') {
        // For live mode, get slots that are not booked and have assigned interviewers
        // Query using exact date match since dates are normalized to midnight UTC
        slots = await AvailableSlot.find({
            date: selectedDate, // Exact match since both are normalized to midnight UTC
            mode: 'live',
            isBooked: false,
            interviewerId: { $exists: true, $ne: null },
        })
            .populate('interviewerId', 'name email')
            .sort({ time: 1 })
            .lean();

        // Format slots for response
        slots = slots.map(slot => ({
            id: slot._id.toString(), // Include slot ID for tracking
            time: slot.time,
            interviewer: slot.interviewerId ? {
                id: slot.interviewerId._id.toString(),
                name: slot.interviewerId.name,
                email: slot.interviewerId.email,
            } : null,
            available: true,
        }));
    } else {
        // For other modes (ai, peer, family), generate default time slots
        // In production, you might want to have a different slot system
        const defaultTimeSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
        ];

        // Check which slots are already booked for this date and mode
        const bookedSlots = await Interview.find({
            scheduledDate: selectedDate,
            mode: mode,
            status: { $in: ['scheduled', 'in_progress'] },
        }).select('timeSlot').lean();

        const bookedTimes = new Set(bookedSlots.map(i => i.timeSlot));

        slots = defaultTimeSlots.map(time => ({
            time: time,
            available: !bookedTimes.has(time),
            interviewer: null,
        }));
    }

    // Filter out past times for today - add buffer of 30 minutes
    const currentTime = new Date();
    const today = new Date(currentTime);
    today.setUTCHours(0, 0, 0, 0);
    
    if (selectedDate.getTime() === today.getTime()) {
        const currentHour = currentTime.getUTCHours();
        const currentMinute = currentTime.getUTCMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const bufferMinutes = 30; // 30 minute buffer

        slots = slots.filter(slot => {
            const [hours, minutes, period] = slot.time.split(/[: ]/);
            let hour = parseInt(hours);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            const slotMinutes = parseInt(minutes);
            const slotTimeInMinutes = hour * 60 + slotMinutes;

            // Only allow slots that are at least 30 minutes in the future
            return slotTimeInMinutes > (currentTimeInMinutes + bufferMinutes);
        });
    }

    res.status(200).json({
        success: true,
        data: {
            date: selectedDate.toISOString(),
            mode: mode,
            slots: slots,
        },
    });
});

/**
 * @desc    Create a new interview booking
 * @route   POST /api/bookings/create
 * @access  Private (Trainee only)
 */
exports.createBooking = asyncHandler(async (req, res, next) => {
    // Verify user is a trainee
    if (req.user.role !== 'trainee') {
        return next(new ForbiddenError('Only trainees can create bookings'));
    }

    const {
        mode,
        scheduledDate,
        timeSlot,
        duration,
        language,
        difficulty,
        focusArea,
        consentFlags,
        slotId, // Optional, for direct slot lookup in live mode
        interviewerId, // Optional, for live mode
    } = req.body;

    // Validation
    if (!mode || !scheduledDate || !timeSlot || !duration || !language) {
        return next(new BadRequestError('Missing required fields: mode, scheduledDate, timeSlot, duration, language'));
    }

    // Validate mode
    const validModes = ['ai', 'peer', 'family', 'live'];
    if (!validModes.includes(mode)) {
        return next(new BadRequestError('Invalid mode'));
    }

    // Validate duration
    const validDurations = [30, 45, 60, 90];
    if (!validDurations.includes(parseInt(duration))) {
        return next(new BadRequestError('Invalid duration. Must be 30, 45, 60, or 90 minutes'));
    }

    // Validate date - handle ISO string or YYYY-MM-DD format
    let bookingDate;
    if (typeof scheduledDate === 'string' && scheduledDate.includes('-') && scheduledDate.length === 10) {
        // YYYY-MM-DD format - parse to avoid timezone issues
        const dateParts = scheduledDate.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const day = parseInt(dateParts[2]);
        // Create date at midnight UTC
        bookingDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    } else {
        bookingDate = new Date(scheduledDate);
    }
    
    if (isNaN(bookingDate.getTime())) {
        return next(new BadRequestError('Invalid date format'));
    }
    
    // Check if date is in the past
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    if (bookingDate < now) {
        return next(new BadRequestError('Invalid date. Date must be in the future'));
    }

    // Check if booking date is today and time is in the past
    const currentTime = new Date();
    if (bookingDate.getTime() === now.getTime()) {
        // Parse time slot to check if it's in the past
        const [hours, minutes, period] = timeSlot.split(/[: ]/);
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const slotMinutes = parseInt(minutes);
        const slotTimeInMinutes = hour * 60 + slotMinutes;
        
        const currentHour = currentTime.getUTCHours();
        const currentMinute = currentTime.getUTCMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const bufferMinutes = 30; // 30 minute buffer

        if (slotTimeInMinutes <= (currentTimeInMinutes + bufferMinutes)) {
            return next(new BadRequestError('Invalid time slot. Selected time must be at least 30 minutes in the future'));
        }
    }

    // Normalize booking date to start of day in UTC for comparison with stored slots
    const normalizedBookingDate = new Date(bookingDate);
    normalizedBookingDate.setUTCHours(0, 0, 0, 0);

    // For live mode, validate interviewer
    let assignedInterviewerId = null;
    let selectedSlot = null;
    if (mode === 'live') {
        if (!interviewerId) {
            return next(new BadRequestError('Interviewer ID is required for live mode'));
        }

        // Verify interviewer exists and is approved
        const interviewer = await User.findById(interviewerId);
        if (!interviewer || interviewer.role !== 'interviewer' || interviewer.status !== 'approved') {
            return next(new BadRequestError('Invalid or unapproved interviewer'));
        }

        assignedInterviewerId = interviewerId;

        // Check if slot is available - prefer slotId if provided for direct lookup
        let interviewerObjectId = interviewerId;
        if (mongoose.Types.ObjectId.isValid(interviewerId)) {
            interviewerObjectId = new mongoose.Types.ObjectId(interviewerId);
        }

        // If slotId is provided, use it for direct lookup (more reliable)
        if (slotId && mongoose.Types.ObjectId.isValid(slotId)) {
            selectedSlot = await AvailableSlot.findOne({
                _id: slotId,
                mode: 'live',
                interviewerId: interviewerObjectId,
                isBooked: false,
            });

            if (!selectedSlot) {
                return next(new BadRequestError('The selected time slot is not available. It may have been removed or already booked.'));
            }

            // Verify the slot matches the requested date and time
            const slotDate = new Date(selectedSlot.date);
            slotDate.setUTCHours(0, 0, 0, 0);
            if (slotDate.getTime() !== normalizedBookingDate.getTime() || selectedSlot.time !== timeSlot) {
                return next(new BadRequestError('The selected time slot does not match the requested date and time.'));
            }
        } else {
            // Fallback to querying by date, time, and interviewer
            selectedSlot = await AvailableSlot.findOne({
                date: normalizedBookingDate,
                time: timeSlot,
                mode: 'live',
                interviewerId: interviewerObjectId,
                isBooked: false,
            });

            if (!selectedSlot) {
                // Provide more helpful error message - check if slot exists but is booked
                const bookedSlot = await AvailableSlot.findOne({
                    date: normalizedBookingDate,
                    time: timeSlot,
                    mode: 'live',
                    interviewerId: interviewerObjectId,
                    isBooked: true,
                });
                
                if (bookedSlot) {
                    return next(new BadRequestError('The selected time slot has already been booked. Please select another time.'));
                }
                
                return next(new BadRequestError('The selected time slot is not available. It may have been removed or the interviewer is no longer available at this time.'));
            }
        }
    }

    // Check for duplicate bookings - use date range to handle time differences
    const startOfDay = new Date(normalizedBookingDate);
    const endOfDay = new Date(normalizedBookingDate);
    endOfDay.setUTCHours(23, 59, 59, 999); // End of day UTC

    const existingBooking = await Interview.findOne({
        userId: req.user.id,
        scheduledDate: { $gte: startOfDay, $lte: endOfDay },
        timeSlot: timeSlot,
        status: { $in: ['scheduled', 'in_progress'] },
    });

    if (existingBooking) {
        return next(new BadRequestError('You already have a booking at this time'));
    }

    // Create interview record
    const interviewData = {
        mode: mode,
        userId: req.user.id,
        interviewerId: assignedInterviewerId,
        scheduledDate: bookingDate, // Keep original date with time
        timeSlot: timeSlot,
        duration: parseInt(duration),
        language: language,
        difficulty: difficulty || 'intermediate',
        focusArea: focusArea || null,
        consentFlags: consentFlags || { recording: false, dataUsage: false },
        status: 'scheduled',
        metadata: {},
    };

    // Add slotId to interview if we have it
    if (mode === 'live' && selectedSlot) {
        interviewData.metadata.slotId = selectedSlot._id;
    }

    // Mode-specific logic
    let sessionId = null;
    let meetingLink = null;

    if (mode === 'live') {
        // Meeting link for live interviews
        meetingLink = `https://zoom.us/j/${Math.random().toString(36).substring(7)}`;
        interviewData.meetingLink = meetingLink;
        interviewData.metadata.type = 'live_mock_interview';
    } else if (mode === 'family') {
        // Generate Zoom link (mock implementation - replace with actual Zoom API)
        meetingLink = `https://zoom.us/j/${Math.random().toString(36).substring(7)}`;
        interviewData.meetingLink = meetingLink;
        interviewData.metadata.type = 'family_friends';
    } else if (mode === 'peer') {
        // Initiate matching process
        interviewData.metadata.type = 'peer_to_peer';
        interviewData.metadata.matchStatus = 'pending';
    } else if (mode === 'ai') {
        // Initialize AI session
        sessionId = `ai_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        interviewData.sessionId = sessionId;
        interviewData.metadata.type = 'ai_powered';
    }

    // Create the interview
    const interview = await Interview.create(interviewData);

    // Update slot if live mode - use the selectedSlot we already found
    if (mode === 'live' && selectedSlot) {
        await AvailableSlot.findByIdAndUpdate(
            selectedSlot._id, // Use the already found slot's ID
            {
                isBooked: true,
                interviewId: interview._id,
            }
        );
    }

    // Create AI session if AI mode
    if (mode === 'ai' && sessionId) {
        await AISession.create({
            interviewId: interview._id,
            sessionId: sessionId,
            specialty: focusArea || null,
            difficulty: difficulty || 'intermediate',
            language: language,
            status: 'initialized',
        });
    }

    // Populate interview with user details
    await interview.populate('userId', 'name email');
    if (interview.interviewerId) {
        await interview.populate('interviewerId', 'name email');
    }

    // Send notifications for interview scheduling
    const notificationService = require('../services/notification.service');
    try {
        // Format date and time for notification
        const formattedDate = bookingDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedTime = timeSlot || 'Not specified';
        const modeTitles = {
            'live': 'Live Mock Interview',
            'peer': 'Peer-to-Peer',
            'family': 'Family & Friends',
            'ai': 'AI-Powered Interview',
        };
        const modeTitle = modeTitles[mode] || 'Interview';

        // Notify admin about new interview booking
        await notificationService.notifyAllAdmins({
            title: 'New Interview Scheduled',
            message: `${interview.userId?.name || interview.userId?.email || 'A trainee'} has scheduled a ${modeTitle} interview on ${formattedDate} at ${formattedTime}. Language: ${language || 'Not specified'}.${interview.interviewerId ? ` Interviewer: ${interview.interviewerId.name || interview.interviewerId.email}` : ''}`,
            type: 'info',
            metadata: {
                interviewId: interview._id.toString(),
                traineeId: interview.userId?._id?.toString() || interview.userId?.id,
                traineeName: interview.userId?.name || interview.userId?.email,
                interviewerId: interview.interviewerId?._id?.toString() || interview.interviewerId?.id,
                interviewerName: interview.interviewerId?.name || interview.interviewerId?.email,
                mode: mode,
                scheduledDate: bookingDate.toISOString(),
                timeSlot: timeSlot,
                language: language,
                type: 'interview_scheduled',
            },
        });

        // Notify interviewer if applicable (for live mode)
        if (mode === 'live' && interview.interviewerId) {
            await notificationService.createNotification({
                userId: interview.interviewerId._id || interview.interviewerId.id,
                title: 'New Interview Assigned',
                message: `You have been assigned a new ${modeTitle} interview with ${interview.userId?.name || interview.userId?.email || 'a trainee'} on ${formattedDate} at ${formattedTime}. Language: ${language || 'Not specified'}.`,
                type: 'info',
                metadata: {
                    interviewId: interview._id.toString(),
                    traineeId: interview.userId?._id?.toString() || interview.userId?.id,
                    traineeName: interview.userId?.name || interview.userId?.email,
                    mode: mode,
                    scheduledDate: bookingDate.toISOString(),
                    timeSlot: timeSlot,
                    language: language,
                    type: 'interview_assigned',
                },
            });
        }
    } catch (notificationError) {
        // Log error but don't fail booking if notification fails
        console.error('[Booking] Failed to create notifications:', notificationError.message);
    }

    // TODO: Send email confirmation
    // await emailService.sendBookingConfirmation(req.user.email, interview);

    // Format response
    const interviewResponse = interview.toObject();
    interviewResponse.createdAt = interview.createdAt ? new Date(interview.createdAt).toISOString() : new Date().toISOString();
    interviewResponse.updatedAt = interview.updatedAt ? new Date(interview.updatedAt).toISOString() : new Date().toISOString();
    interviewResponse.scheduledDate = bookingDate.toISOString();

    res.status(201).json({
        success: true,
        data: interviewResponse,
        message: 'Interview booked successfully',
    });
});

/**
 * @desc    Reschedule an interview booking (Trainee only)
 * @route   PUT /api/bookings/:id/reschedule
 * @access  Private (Trainee only)
 */
exports.rescheduleBooking = asyncHandler(async (req, res, next) => {
    // Verify user is a trainee
    if (req.user.role !== 'trainee') {
        return next(new ForbiddenError('Only trainees can reschedule their bookings'));
    }

    const { id } = req.params;
    const {
        scheduledDate,
        timeSlot,
        slotId,
        interviewerId,
    } = req.body;

    // Find the interview
    const interview = await Interview.findById(id);

    if (!interview) {
        return next(new NotFoundError('Interview not found'));
    }

    // Verify the interview belongs to the current user
    if (interview.userId.toString() !== req.user.id) {
        return next(new ForbiddenError('You can only reschedule your own bookings'));
    }

    // Check if interview can be rescheduled
    if (interview.status === 'completed') {
        return next(new BadRequestError('Cannot reschedule a completed interview'));
    }

    if (interview.status === 'cancelled') {
        return next(new BadRequestError('Cannot reschedule a cancelled interview'));
    }

    if (interview.status === 'in_progress') {
        return next(new BadRequestError('Cannot reschedule an interview that is in progress'));
    }

    // Validate date if provided
    let newDate = interview.scheduledDate;
    if (scheduledDate) {
        let parsedDate;
        if (typeof scheduledDate === 'string' && scheduledDate.includes('-') && scheduledDate.length === 10) {
            const dateParts = scheduledDate.split('-');
            const year = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[2]);
            parsedDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        } else {
            parsedDate = new Date(scheduledDate);
        }
        
        if (isNaN(parsedDate.getTime())) {
            return next(new BadRequestError('Invalid date format'));
        }

        // Check if date is in the past
        const now = new Date();
        now.setUTCHours(0, 0, 0, 0);
        if (parsedDate < now) {
            return next(new BadRequestError('Cannot reschedule to a past date'));
        }

        newDate = parsedDate;
    }

    // Normalize date for slot matching
    const normalizedDate = new Date(newDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Handle Live Mock Interview rescheduling
    if (interview.mode === 'live') {
        // Get old slot info before releasing it
        const oldSlotId = interview.metadata?.slotId;
        
        // If date or time is changing, we need to handle slot updates
        if (scheduledDate || timeSlot) {
            // Validate new slot availability
            let newSlotId = slotId;
            let newInterviewerId = interviewerId || interview.interviewerId?.toString();

            if (!newInterviewerId) {
                return next(new BadRequestError('Interviewer ID is required for live interviews'));
            }

            // Verify interviewer
            const interviewer = await User.findById(newInterviewerId);
            if (!interviewer || interviewer.role !== 'interviewer' || interviewer.status !== 'approved') {
                return next(new BadRequestError('Invalid or unapproved interviewer'));
            }

            const interviewerObjectId = new mongoose.Types.ObjectId(newInterviewerId);
            const newTime = timeSlot || interview.timeSlot;

            // Find new slot
            let newSlot = null;
            
            if (newSlotId && mongoose.Types.ObjectId.isValid(newSlotId)) {
                // Use provided slotId for direct lookup
                newSlot = await AvailableSlot.findOne({
                    _id: newSlotId,
                    mode: 'live',
                    interviewerId: interviewerObjectId,
                    isBooked: false,
                });

                if (!newSlot) {
                    return next(new BadRequestError('The selected time slot is not available'));
                }

                // Verify slot matches date and time
                const slotDate = new Date(newSlot.date);
                slotDate.setUTCHours(0, 0, 0, 0);
                if (slotDate.getTime() !== normalizedDate.getTime() || newSlot.time !== newTime) {
                    return next(new BadRequestError('The selected time slot does not match the requested date and time'));
                }
            } else {
                // Find slot by date and time
                newSlot = await AvailableSlot.findOne({
                    date: normalizedDate,
                    time: newTime,
                    mode: 'live',
                    interviewerId: interviewerObjectId,
                    isBooked: false,
                });

                if (!newSlot) {
                    return next(new BadRequestError('The selected time slot is not available'));
                }
            }

            // Release old slot if it exists
            if (oldSlotId) {
                await AvailableSlot.findByIdAndUpdate(oldSlotId, {
                    isBooked: false,
                    interviewId: null,
                });
            }

            // Book new slot
            newSlot.isBooked = true;
            newSlot.interviewId = interview._id;
            await newSlot.save();

            // Update interview metadata
            if (!interview.metadata) interview.metadata = {};
            interview.metadata.slotId = newSlot._id;

            // Update interviewer if changed
            if (newInterviewerId !== interview.interviewerId?.toString()) {
                interview.interviewerId = newInterviewerId;
            }
        }
    }

    // Update interview fields
    if (scheduledDate) {
        interview.scheduledDate = newDate;
    }

    if (timeSlot) {
        interview.timeSlot = timeSlot;
    }

    // Save the interview
    await interview.save();

    // Populate for response
    await interview.populate('userId', 'name email');
    if (interview.interviewerId) {
        await interview.populate('interviewerId', 'name email');
    }

    // Format response
    const interviewResponse = interview.toObject();
    interviewResponse.createdAt = interview.createdAt ? new Date(interview.createdAt).toISOString() : new Date().toISOString();
    interviewResponse.updatedAt = interview.updatedAt ? new Date(interview.updatedAt).toISOString() : new Date().toISOString();
    interviewResponse.scheduledDate = interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null;

    res.status(200).json({
        success: true,
        data: interviewResponse,
        message: 'Interview rescheduled successfully',
    });
});

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getBookings = asyncHandler(async (req, res, next) => {
    const { status, mode } = req.query;
    const userId = req.user.id;

    // Build query
    const query = { userId: userId };

    if (status) {
        query.status = status;
    }

    if (mode) {
        query.mode = mode;
    }

    // Fetch interviews with populated interviewer data
    const interviews = await Interview.find(query)
        .populate('interviewerId', 'name email')
        .sort({ scheduledDate: 1, createdAt: -1 })
        .lean();

    // Format response
    const formattedInterviews = interviews.map(interview => ({
        _id: interview._id,
        mode: interview.mode,
        userId: interview.userId,
        interviewerId: interview.interviewerId ? {
            _id: interview.interviewerId._id || interview.interviewerId.id,
            name: interview.interviewerId.name,
            email: interview.interviewerId.email,
        } : null,
        scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null,
        timeSlot: interview.timeSlot,
        duration: interview.duration,
        language: interview.language,
        difficulty: interview.difficulty,
        focusArea: interview.focusArea,
        consentFlags: interview.consentFlags || {},
        status: interview.status,
        meetingLink: interview.meetingLink,
        sessionId: interview.sessionId,
        metadata: interview.metadata || {},
        createdAt: interview.createdAt ? new Date(interview.createdAt).toISOString() : null,
        updatedAt: interview.updatedAt ? new Date(interview.updatedAt).toISOString() : null,
    }));

    res.status(200).json({
        success: true,
        data: formattedInterviews,
    });
});

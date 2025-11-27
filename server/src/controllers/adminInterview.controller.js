const Interview = require('../models/Interview');
const AvailableSlot = require('../models/AvailableSlot');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const notificationService = require('../services/notification.service');

/**
 * @desc    Get all interviews (admin only)
 * @route   GET /api/admin/interviews
 * @access  Private (Admin only)
 */
exports.getAllInterviews = asyncHandler(async (req, res, next) => {
    // User role is already validated by middleware
    const { mode, status, search, page = 1, limit = 50 } = req.query;

    // Build query
    const query = {};

    // Filter by mode
    if (mode && mode !== 'all') {
        query.mode = mode;
    }

    // Filter by status
    if (status && status !== 'all') {
        query.status = status;
    }

    // Search by trainee or interviewer name
    if (search) {
        // First, find user IDs matching the search
        const matchingUsers = await User.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }).select('_id').lean();

        const userIds = matchingUsers.map(user => user._id);

        query.$or = [
            { userId: { $in: userIds } },
            { interviewerId: { $in: userIds } },
        ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch interviews with populated user data
    const interviews = await Interview.find(query)
        .populate('userId', 'name email')
        .populate('interviewerId', 'name email')
        .sort({ scheduledDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Get total count for pagination (filtered)
    const total = await Interview.countDocuments(query);

    // Calculate FULL stats (not filtered) - always show full totals in cards
    const [
        fullTotal,
        scheduledCount,
        inProgressCount,
        completedCount,
    ] = await Promise.all([
        Interview.countDocuments({}), // Full total
        Interview.countDocuments({ status: 'scheduled' }),
        Interview.countDocuments({ status: 'in_progress' }),
        Interview.countDocuments({ status: 'completed' }),
    ]);

    // Format response
    const formattedInterviews = interviews.map(interview => ({
        _id: interview._id,
        mode: interview.mode,
        trainee: interview.userId ? {
            id: interview.userId._id || interview.userId.id,
            name: interview.userId.name,
            email: interview.userId.email,
        } : null,
        interviewer: interview.interviewerId ? {
            id: interview.interviewerId._id || interview.interviewerId.id,
            name: interview.interviewerId.name,
            email: interview.interviewerId.email,
        } : null,
        scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null,
        timeSlot: interview.timeSlot,
        duration: interview.duration,
        language: interview.language,
        difficulty: interview.difficulty,
        focusArea: interview.focusArea,
        status: interview.status,
        meetingLink: interview.meetingLink,
        sessionId: interview.sessionId,
        createdAt: interview.createdAt ? new Date(interview.createdAt).toISOString() : null,
        updatedAt: interview.updatedAt ? new Date(interview.updatedAt).toISOString() : null,
        startedAt: interview.startedAt ? new Date(interview.startedAt).toISOString() : null,
        completedAt: interview.completedAt ? new Date(interview.completedAt).toISOString() : null,
    }));

    res.status(200).json({
        success: true,
        data: formattedInterviews,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total, // Filtered total for pagination
            pages: Math.ceil(total / limitNum),
        },
        stats: {
            total: fullTotal, // Full total (not filtered) for cards
            scheduled: scheduledCount,
            in_progress: inProgressCount,
            completed: completedCount,
        },
    });
});

/**
 * @desc    Update an interview booking (admin only)
 * @route   PUT /api/admin/interviews/:id
 * @access  Private (Admin only)
 */
exports.updateInterview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status, interviewerId, timeSlot, scheduledDate } = req.body;

    // Find the interview
    const interview = await Interview.findById(id)
        .populate('userId', 'name email')
        .populate('interviewerId', 'name email');

    if (!interview) {
        return next(new NotFoundError('Interview not found'));
    }

    const oldStatus = interview.status;
    const oldInterviewerId = interview.interviewerId?.toString();
    const oldTimeSlot = interview.timeSlot;
    const oldScheduledDate = interview.scheduledDate;

    // Track what changed for notifications
    const changes = [];

    // Update status if provided
    if (status && status !== interview.status) {
        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
        if (!validStatuses.includes(status)) {
            return next(new BadRequestError('Invalid status'));
        }
        interview.status = status;
        changes.push(`Status changed from ${oldStatus} to ${status}`);

        // Handle status-specific updates
        if (status === 'completed' && !interview.completedAt) {
            interview.completedAt = new Date();
        } else if (status === 'cancelled' && !interview.cancelledAt) {
            interview.cancelledAt = new Date();
        }
    }

    // Handle Live Mock Interview slot changes
    if (interview.mode === 'live' && (interviewerId !== undefined || timeSlot !== undefined || scheduledDate !== undefined)) {
        // Free up old slot if time slot or date changed
        if ((timeSlot && timeSlot !== oldTimeSlot) || (scheduledDate && new Date(scheduledDate).getTime() !== oldScheduledDate.getTime())) {
            if (oldInterviewerId) {
                const oldSlot = await AvailableSlot.findOne({
                    interviewId: interview._id,
                    interviewerId: oldInterviewerId,
                });

                if (oldSlot && oldSlot.isBooked) {
                    oldSlot.isBooked = false;
                    oldSlot.interviewId = null;
                    await oldSlot.save();
                    changes.push(`Old time slot ${oldTimeSlot} has been freed`);
                }
            }
        }

        // Validate and assign new interviewer if changed
        if (interviewerId !== undefined && interviewerId !== oldInterviewerId) {
            if (interviewerId) {
                const newInterviewer = await User.findById(interviewerId);
                if (!newInterviewer || newInterviewer.role !== 'interviewer') {
                    return next(new BadRequestError('Invalid interviewer'));
                }
                changes.push(`Interviewer changed from ${interview.interviewerId?.name || 'None'} to ${newInterviewer.name}`);
            }
            interview.interviewerId = interviewerId || null;
        }

        // Book new slot if time slot or date changed
        const newDate = scheduledDate ? new Date(scheduledDate) : interview.scheduledDate;
        const newTime = timeSlot || interview.timeSlot;
        const finalInterviewerId = interviewerId || interview.interviewerId;

        if ((timeSlot && timeSlot !== oldTimeSlot) || (scheduledDate && new Date(scheduledDate).getTime() !== oldScheduledDate.getTime())) {
            if (finalInterviewerId && newTime) {
                const newSlot = await AvailableSlot.findOne({
                    date: newDate,
                    time: newTime,
                    mode: 'live',
                    interviewerId: finalInterviewerId,
                    isBooked: false,
                });

                if (!newSlot) {
                    return next(new BadRequestError('The selected time slot is not available'));
                }

                newSlot.isBooked = true;
                newSlot.interviewId = interview._id;
                await newSlot.save();
                changes.push(`New time slot ${newTime} has been booked`);

                // Store slot ID in metadata
                if (!interview.metadata) interview.metadata = {};
                interview.metadata.slotId = newSlot._id;
            }
        }

        // Update scheduled date if changed
        if (scheduledDate) {
            interview.scheduledDate = new Date(scheduledDate);
            changes.push(`Date changed from ${oldScheduledDate.toDateString()} to ${new Date(scheduledDate).toDateString()}`);
        }

        // Update time slot if changed
        if (timeSlot) {
            interview.timeSlot = timeSlot;
            changes.push(`Time changed from ${oldTimeSlot} to ${timeSlot}`);
        }
    } else if (interview.mode !== 'live') {
        // For non-live interviews, just update fields
        if (scheduledDate) interview.scheduledDate = new Date(scheduledDate);
        if (timeSlot) interview.timeSlot = timeSlot;
    }

    // Save the interview
    await interview.save();

    // Reload with populated fields
    await interview.populate('userId', 'name email');
    if (interview.interviewerId) {
        await interview.populate('interviewerId', 'name email');
    }

    // Send notifications if there were changes
    if (changes.length > 0) {
        // Format change message with proper line breaks for readability
        const changeMessage = changes.join('. ');

        // Format date and time for better readability
        const formattedDate = interview.scheduledDate 
            ? new Date(interview.scheduledDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
            : 'Not specified';
        const formattedTime = interview.timeSlot || 'Not specified';

        // Notify trainee
        if (interview.userId) {
            await notificationService.createNotification({
                userId: interview.userId._id || interview.userId.id,
                title: 'Interview Updated',
                message: `Your interview has been updated. ${changeMessage}. Scheduled for: ${formattedDate} at ${formattedTime}.`,
                type: 'info',
                metadata: {
                    interviewId: interview._id.toString(),
                    changes: changes,
                    scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null,
                    timeSlot: interview.timeSlot,
                    type: 'interview_updated',
                },
            });
        }

        // Notify interviewer if applicable
        if (interview.interviewerId) {
            await notificationService.createNotification({
                userId: interview.interviewerId._id || interview.interviewerId.id,
                title: 'Interview Updated',
                message: `An interview you're assigned to has been updated. ${changeMessage}. Scheduled for: ${formattedDate} at ${formattedTime}.`,
                type: 'info',
                metadata: {
                    interviewId: interview._id.toString(),
                    changes: changes,
                    scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null,
                    timeSlot: interview.timeSlot,
                    type: 'interview_updated',
                },
            });
        }
    }

    // Format response
    const interviewResponse = {
        _id: interview._id,
        mode: interview.mode,
        trainee: interview.userId ? {
            id: interview.userId._id || interview.userId.id,
            name: interview.userId.name,
            email: interview.userId.email,
        } : null,
        interviewer: interview.interviewerId ? {
            id: interview.interviewerId._id || interview.interviewerId.id,
            name: interview.interviewerId.name,
            email: interview.interviewerId.email,
        } : null,
        scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null,
        timeSlot: interview.timeSlot,
        duration: interview.duration,
        status: interview.status,
        createdAt: interview.createdAt ? new Date(interview.createdAt).toISOString() : null,
        updatedAt: interview.updatedAt ? new Date(interview.updatedAt).toISOString() : null,
    };

    res.status(200).json({
        success: true,
        data: interviewResponse,
        message: 'Interview updated successfully',
    });
});

/**
 * @desc    Cancel an interview booking (admin only)
 * @route   POST /api/admin/interviews/:id/cancel
 * @access  Private (Admin only)
 */
exports.cancelInterview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    // Find the interview
    const interview = await Interview.findById(id)
        .populate('userId', 'name email')
        .populate('interviewerId', 'name email');

    if (!interview) {
        return next(new NotFoundError('Interview not found'));
    }

    // Check if already cancelled
    if (interview.status === 'cancelled') {
        return next(new BadRequestError('Interview is already cancelled'));
    }

    // Update interview status
    interview.status = 'cancelled';
    interview.cancelledAt = new Date();
    if (reason) {
        interview.cancellationReason = reason;
    }

    // Free up slot if it's a Live Mock Interview
    if (interview.mode === 'live' && interview.interviewerId) {
        const slot = await AvailableSlot.findOne({
            interviewId: interview._id,
            interviewerId: interview.interviewerId._id || interview.interviewerId.id,
        });

        if (slot && slot.isBooked) {
            slot.isBooked = false;
            slot.interviewId = null;
            await slot.save();
        }
    }

    // Save the interview
    await interview.save();

    // Format date and time for notification
    const formattedDate = interview.scheduledDate 
        ? new Date(interview.scheduledDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
        : 'Not specified';
    const formattedTime = interview.timeSlot || 'Not specified';

    // Send notifications with properly formatted messages
    const traineeCancelMessage = reason 
        ? `Your interview scheduled for ${formattedDate} at ${formattedTime} has been cancelled. Reason: ${reason}`
        : `Your interview scheduled for ${formattedDate} at ${formattedTime} has been cancelled by an administrator.`;

    const interviewerCancelMessage = reason 
        ? `An interview you were assigned to (scheduled for ${formattedDate} at ${formattedTime}) has been cancelled. Reason: ${reason}`
        : `An interview you were assigned to (scheduled for ${formattedDate} at ${formattedTime}) has been cancelled by an administrator.`;

    // Notify trainee
    if (interview.userId) {
        await notificationService.createNotification({
            userId: interview.userId._id || interview.userId.id,
            title: 'Interview Cancelled',
            message: traineeCancelMessage,
            type: 'warning',
            metadata: {
                interviewId: interview._id.toString(),
                reason: reason || 'No reason provided',
                scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null,
                timeSlot: interview.timeSlot,
                type: 'interview_cancelled',
            },
        });
    }

    // Notify interviewer if applicable
    if (interview.interviewerId) {
        await notificationService.createNotification({
            userId: interview.interviewerId._id || interview.interviewerId.id,
            title: 'Interview Cancelled',
            message: interviewerCancelMessage,
            type: 'warning',
            metadata: {
                interviewId: interview._id.toString(),
                reason: reason || 'No reason provided',
                scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null,
                timeSlot: interview.timeSlot,
                type: 'interview_cancelled',
            },
        });
    }

    // Format response
    const interviewResponse = {
        _id: interview._id,
        mode: interview.mode,
        trainee: interview.userId ? {
            id: interview.userId._id || interview.userId.id,
            name: interview.userId.name,
            email: interview.userId.email,
        } : null,
        interviewer: interview.interviewerId ? {
            id: interview.interviewerId._id || interview.interviewerId.id,
            name: interview.interviewerId.name,
            email: interview.interviewerId.email,
        } : null,
        status: interview.status,
        cancelledAt: interview.cancelledAt ? new Date(interview.cancelledAt).toISOString() : null,
        cancellationReason: interview.cancellationReason,
    };

    res.status(200).json({
        success: true,
        data: interviewResponse,
        message: 'Interview cancelled successfully',
    });
});


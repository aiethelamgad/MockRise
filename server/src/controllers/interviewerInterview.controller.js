const Interview = require('../models/Interview');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');

/**
 * @desc    Get interviewer's assigned interviews
 * @route   GET /api/interviewer/interviews
 * @access  Private (Interviewer only)
 */
exports.getAssignedInterviews = asyncHandler(async (req, res, next) => {
    const interviewerId = req.user.id;
    const { status, mode } = req.query;

    // Build query - only interviews assigned to this interviewer
    const query = {
        interviewerId: interviewerId,
        mode: 'live', // Only live interviews are assigned to interviewers
    };

    // Filter by status if provided
    if (status && status !== 'all') {
        query.status = status;
    }

    // Fetch interviews with populated trainee data
    const interviews = await Interview.find(query)
        .populate('userId', 'name email')
        .sort({ scheduledDate: 1, timeSlot: 1 }) // Sort by date and time ascending
        .lean();

    // Format response
    const formattedInterviews = interviews.map(interview => ({
        _id: interview._id,
        mode: interview.mode,
        trainee: interview.userId ? {
            _id: interview.userId._id || interview.userId.id,
            name: interview.userId.name,
            email: interview.userId.email,
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
        metadata: interview.metadata || {},
        createdAt: interview.createdAt ? new Date(interview.createdAt).toISOString() : null,
        updatedAt: interview.updatedAt ? new Date(interview.updatedAt).toISOString() : null,
        startedAt: interview.startedAt ? new Date(interview.startedAt).toISOString() : null,
        completedAt: interview.completedAt ? new Date(interview.completedAt).toISOString() : null,
    }));

    res.status(200).json({
        success: true,
        data: formattedInterviews,
    });
});

/**
 * @desc    Get a specific assigned interview by ID
 * @route   GET /api/interviewer/interviews/:id
 * @access  Private (Interviewer only)
 */
exports.getAssignedInterviewById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const interviewerId = req.user.id;

    const interview = await Interview.findById(id)
        .populate('userId', 'name email')
        .lean();

    if (!interview) {
        return next(new NotFoundError('Interview not found'));
    }

    // Verify the interviewer is assigned to this interview
    if (interview.interviewerId && interview.interviewerId.toString() !== interviewerId) {
        return next(new ForbiddenError('You are not assigned to this interview'));
    }

    // Format response
    const formattedInterview = {
        _id: interview._id,
        mode: interview.mode,
        trainee: interview.userId ? {
            _id: interview.userId._id || interview.userId.id,
            name: interview.userId.name,
            email: interview.userId.email,
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
        consentFlags: interview.consentFlags || {},
        metadata: interview.metadata || {},
        createdAt: interview.createdAt ? new Date(interview.createdAt).toISOString() : null,
        updatedAt: interview.updatedAt ? new Date(interview.updatedAt).toISOString() : null,
        startedAt: interview.startedAt ? new Date(interview.startedAt).toISOString() : null,
        completedAt: interview.completedAt ? new Date(interview.completedAt).toISOString() : null,
    };

    res.status(200).json({
        success: true,
        data: formattedInterview,
    });
});

/**
 * @desc    Update interview status (e.g., mark as in_progress, completed)
 * @route   PUT /api/interviewer/interviews/:id/status
 * @access  Private (Interviewer only)
 */
exports.updateInterviewStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const interviewerId = req.user.id;

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
        return next(new BadRequestError('Invalid status'));
    }

    const interview = await Interview.findById(id);

    if (!interview) {
        return next(new NotFoundError('Interview not found'));
    }

    // Verify the interviewer is assigned to this interview
    if (interview.interviewerId && interview.interviewerId.toString() !== interviewerId) {
        return next(new ForbiddenError('You are not assigned to this interview'));
    }

    // Update status
    interview.status = status;

    // Set timestamps based on status
    if (status === 'in_progress' && !interview.startedAt) {
        interview.startedAt = new Date();
    } else if (status === 'completed' && !interview.completedAt) {
        interview.completedAt = new Date();
        if (!interview.startedAt) {
            interview.startedAt = new Date(); // Set startedAt if not already set
        }
    } else if (status === 'cancelled' && !interview.cancelledAt) {
        interview.cancelledAt = new Date();
    }

    await interview.save();

    // Populate for response
    await interview.populate('userId', 'name email');

    res.status(200).json({
        success: true,
        data: interview,
        message: 'Interview status updated successfully',
    });
});


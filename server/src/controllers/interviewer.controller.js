const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * @desc    Get all pending interviewers
 * @route   GET /api/interviewers/pending
 * @access  Private (admin only)
 */
exports.getPendingInterviewers = asyncHandler(async (req, res, next) => {
    const pendingInterviewers = await User.find({
        role: 'interviewer',
        status: 'pending_verification'
    }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: pendingInterviewers.length,
        data: pendingInterviewers,
    });
});

/**
 * @desc    Approve interviewer
 * @route   PUT /api/interviewers/:id/approve
 * @access  Private (admin only)
 */
exports.approveInterviewer = asyncHandler(async (req, res, next) => {
    const interviewer = await User.findById(req.params.id);

    if (!interviewer) {
        throw new NotFoundError('Interviewer not found');
    }

    if (interviewer.role !== 'interviewer') {
        throw new ForbiddenError('User is not an interviewer');
    }

    interviewer.status = 'approved';
    interviewer.isApproved = true;
    await interviewer.save();

    res.status(200).json({
        success: true,
        message: 'Interviewer approved successfully',
        data: interviewer,
    });
});

/**
 * @desc    Reject interviewer
 * @route   PUT /api/interviewers/:id/reject
 * @access  Private (admin only)
 */
exports.rejectInterviewer = asyncHandler(async (req, res, next) => {
    const interviewer = await User.findById(req.params.id);

    if (!interviewer) {
        throw new NotFoundError('Interviewer not found');
    }

    if (interviewer.role !== 'interviewer') {
        throw new ForbiddenError('User is not an interviewer');
    }

    interviewer.status = 'rejected';
    interviewer.isApproved = false;
    await interviewer.save();

    res.status(200).json({
        success: true,
        message: 'Interviewer rejected',
        data: interviewer,
    });
});


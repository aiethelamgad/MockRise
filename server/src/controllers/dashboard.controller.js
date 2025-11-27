const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Interview = require('../models/Interview');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');

/**
 * @desc    Trainee Dashboard
 * @route   GET /api/dashboard/trainee
 * @access  Private (trainee, admin, interviewer)
 */
exports.getTraineeDashboard = asyncHandler(async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    
    const userId = req.user._id;
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    
    // Get upcoming sessions (next 5)
    const upcomingSessions = await Interview.find({
        userId: userId,
        status: { $in: ['scheduled', 'in_progress'] },
        scheduledDate: { $gte: startOfToday }
    })
    .populate('interviewerId', 'name email')
    .sort({ scheduledDate: 1 })
    .limit(5)
    .lean();
    
    // Get only completed sessions count (exclude cancelled, no_show, etc.)
    const completedSessionsCount = await Interview.countDocuments({
        userId: userId,
        status: 'completed'
    });
    
    // Get total interviews count
    const totalInterviewsCount = await Interview.countDocuments({ userId: userId });
    
    // Get total sessions that actually took place (completed + in_progress that are in the past)
    // For completion rate, we want: completed / (total - cancelled - no_show)
    const totalValidSessions = await Interview.countDocuments({
        userId: userId,
        status: { $nin: ['cancelled', 'no_show'] }
    });
    
    // Get recent completed interviews (for stats)
    const recentCompleted = await Interview.countDocuments({
        userId: userId,
        status: 'completed',
        completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    // Format upcoming sessions
    const formattedUpcoming = upcomingSessions.map(session => ({
        _id: session._id,
        mode: session.mode,
        scheduledDate: session.scheduledDate ? new Date(session.scheduledDate).toISOString() : null,
        timeSlot: session.timeSlot,
        duration: session.duration,
        difficulty: session.difficulty,
        focusArea: session.focusArea,
        language: session.language,
        status: session.status,
        interviewer: session.interviewerId ? {
            name: session.interviewerId.name,
            email: session.interviewerId.email
        } : null
    }));
    
    // Calculate completion rate: completed / valid sessions (excluding cancelled, no_show)
    const completionRate = totalValidSessions > 0 
        ? Math.round((completedSessionsCount / totalValidSessions) * 100)
        : 0;
    
    // Calculate statistics
    const stats = {
        totalInterviews: totalInterviewsCount,
        upcomingCount: formattedUpcoming.length,
        completedSessions: completedSessionsCount, // Only truly completed
        completedThisMonth: recentCompleted,
        completionRate: completionRate
    };
    
    res.status(200).json({
        success: true,
        message: `Welcome to the Trainee Dashboard, ${req.user.name}!`,
        data: {
            stats,
            upcomingSessions: formattedUpcoming
        },
        user: req.user,
    });
});

/**
 * @desc    Interviewer Dashboard
 * @route   GET /api/dashboard/interviewer
 * @access  Private (interviewer, admin)
 */
exports.getInterviewerDashboard = asyncHandler(async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    
    const interviewerId = req.user._id;
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    
    // Get upcoming assigned interviews (next 5)
    const upcomingInterviews = await Interview.find({
        interviewerId: interviewerId,
        status: { $in: ['scheduled', 'in_progress'] },
        scheduledDate: { $gte: startOfToday }
    })
    .populate('userId', 'name email')
    .sort({ scheduledDate: 1 })
    .limit(5)
    .lean();
    
    // Get total interviews conducted
    const totalInterviews = await Interview.countDocuments({ interviewerId: interviewerId });
    
    // Get completed interviews count
    const completedCount = await Interview.countDocuments({
        interviewerId: interviewerId,
        status: 'completed'
    });
    
    // Get active sessions (in progress)
    const activeSessions = await Interview.countDocuments({
        interviewerId: interviewerId,
        status: 'in_progress'
    });
    
    // Get today's interviews
    const todayCount = await Interview.countDocuments({
        interviewerId: interviewerId,
        scheduledDate: {
            $gte: startOfToday,
            $lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
        },
        status: { $in: ['scheduled', 'in_progress'] }
    });
    
    // Format upcoming interviews
    const formattedUpcoming = upcomingInterviews.map(interview => ({
        _id: interview._id,
        mode: interview.mode,
        scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString() : null,
        timeSlot: interview.timeSlot,
        duration: interview.duration,
        difficulty: interview.difficulty,
        focusArea: interview.focusArea,
        language: interview.language,
        status: interview.status,
        trainee: interview.userId ? {
            name: interview.userId.name,
            email: interview.userId.email
        } : null
    }));
    
    // Calculate statistics
    const stats = {
        totalInterviews: totalInterviews,
        completedInterviews: completedCount,
        activeSessions: activeSessions,
        todayCount: todayCount,
        completionRate: totalInterviews > 0 ? Math.round((completedCount / totalInterviews) * 100) : 0
    };
    
    res.status(200).json({
        success: true,
        message: `Welcome to the Interviewer Dashboard, ${req.user.name}!`,
        data: {
            stats,
            upcomingInterviews: formattedUpcoming
        },
        user: req.user,
    });
});

/**
 * @desc    Admin Dashboard
 * @route   GET /api/dashboard/admin
 * @access  Private (admin)
 */
exports.getAdminDashboard = asyncHandler(async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get user statistics
    const [totalUsers, activeUsers, trainees, interviewers, admins] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ status: 'approved' }),
        User.countDocuments({ role: 'trainee' }),
        User.countDocuments({ role: 'interviewer' }),
        User.countDocuments({ role: { $in: ['admin', 'super_admin', 'hr_admin'] } })
    ]);
    
    // Get interview statistics
    const [totalInterviews, scheduledInterviews, completedInterviews, inProgressInterviews] = await Promise.all([
        Interview.countDocuments({}),
        Interview.countDocuments({ status: 'scheduled' }),
        Interview.countDocuments({ status: 'completed' }),
        Interview.countDocuments({ status: 'in_progress' })
    ]);
    
    // Get new users this month
    const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth }
    });
    
    // Get new interviews this month
    const newInterviewsThisMonth = await Interview.countDocuments({
        createdAt: { $gte: startOfMonth }
    });
    
    // Get resource count
    const totalResources = await Resource.countDocuments({});
    
    // Get recent notifications (last 5)
    const recentNotifications = await Notification.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    
    // Calculate success rate (completed / total that aren't cancelled)
    const nonCancelledInterviews = await Interview.countDocuments({
        status: { $ne: 'cancelled' }
    });
    const successRate = nonCancelledInterviews > 0 
        ? Math.round((completedInterviews / nonCancelledInterviews) * 100) 
        : 0;
    
    // Format recent notifications
    const formattedNotifications = recentNotifications.map(notif => ({
        _id: notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        createdAt: notif.createdAt ? new Date(notif.createdAt).toISOString() : null,
        isRead: notif.isRead
    }));
    
    // Calculate growth percentages (mock - can be enhanced with historical data)
    const userGrowth = totalUsers > 0 ? Math.round((newUsersThisMonth / totalUsers) * 100) : 0;
    
    const stats = {
        users: {
            total: totalUsers,
            active: activeUsers,
            trainees: trainees,
            interviewers: interviewers,
            admins: admins,
            newThisMonth: newUsersThisMonth,
            growth: userGrowth
        },
        interviews: {
            total: totalInterviews,
            scheduled: scheduledInterviews,
            completed: completedInterviews,
            inProgress: inProgressInterviews,
            newThisMonth: newInterviewsThisMonth,
            successRate: successRate
        },
        resources: {
            total: totalResources
        }
    };
    
    res.status(200).json({
        success: true,
        message: `Welcome to the Admin Dashboard, ${req.user.name}!`,
        data: {
            stats,
            recentNotifications: formattedNotifications
        },
        user: req.user,
    });
});


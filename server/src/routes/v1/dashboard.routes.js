const express = require('express');
const {
    getTraineeDashboard,
    getInterviewerDashboard,
    getAdminDashboard,
} = require('../../controllers/dashboard.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Trainee Dashboard - accessible by trainee, admin, interviewer
router.get('/trainee', authorize('trainee', 'admin', 'interviewer'), getTraineeDashboard);

// Interviewer Dashboard - accessible by interviewer, admin
router.get('/interviewer', authorize('interviewer', 'admin'), getInterviewerDashboard);

// Admin Dashboard - accessible by admin only
router.get('/admin', authorize('admin'), getAdminDashboard);

module.exports = router;


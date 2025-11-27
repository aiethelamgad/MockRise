const express = require('express');
const authRoutes = require('./v1/auth.routes');
const dashboardRoutes = require('./v1/dashboard.routes');
const interviewerRoutes = require('./v1/interviewer.routes');
const uploadRoutes = require('./v1/upload.routes');
const notificationRoutes = require('./v1/notification.routes');
const userRoutes = require('./v1/user.routes');
const resourceRoutes = require('./v1/resource.routes');
const bookingRoutes = require('./v1/booking.routes');
const emailController = require('../controllers/email.controller');

const router = express.Router();

// Email test route (for debugging) - put early to avoid conflicts
router.get('/email/test', emailController.testEmail);

// Mount routes directly (no versioning)
// IMPORTANT: upload routes must come first to handle /api/uploads/resumes/:filename
router.use('/uploads', uploadRoutes); // Handles /api/uploads/resumes/:filename
router.use('/upload', uploadRoutes); // Handles /api/upload/resume (POST)
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/interviewers', interviewerRoutes);
router.use('/interviewer', require('./v1/interviewerDashboard.routes'));
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/resources', resourceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', require('./v1/admin.routes'));

module.exports = router;


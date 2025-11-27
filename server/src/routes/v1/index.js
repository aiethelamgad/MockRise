const express = require('express');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const interviewerRoutes = require('./interviewer.routes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/interviewers', interviewerRoutes);

module.exports = router;


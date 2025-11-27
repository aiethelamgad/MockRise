const express = require('express');
const {
    getAvailability,
    addAvailability,
    deleteAvailability,
} = require('../../controllers/interviewerAvailability.controller');
const {
    getAssignedInterviews,
    getAssignedInterviewById,
    updateInterviewStatus,
} = require('../../controllers/interviewerInterview.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication and interviewer role
router.use(protect);
router.use(authorize('interviewer', 'admin')); // Allow both interviewers and admins

// Availability management routes
router.get('/availability', getAvailability);
router.post('/availability/add', addAvailability);
router.delete('/availability/delete/:slotId', deleteAvailability);

// Assigned interviews routes
router.get('/interviews', getAssignedInterviews);
router.get('/interviews/:id', getAssignedInterviewById);
router.put('/interviews/:id/status', updateInterviewStatus);

module.exports = router;


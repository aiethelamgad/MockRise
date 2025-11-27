const express = require('express');
const {
    getPendingInterviewers,
    approveInterviewer,
    rejectInterviewer,
} = require('../../controllers/interviewer.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Get pending interviewers
router.get('/pending', getPendingInterviewers);

// Approve interviewer
router.put('/:id/approve', approveInterviewer);

// Reject interviewer
router.put('/:id/reject', rejectInterviewer);

module.exports = router;


const express = require('express');
const {
    getAllInterviews,
    updateInterview,
    cancelInterview,
} = require('../../controllers/adminInterview.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'super_admin', 'hr_admin'));

// Interview management routes
router.get('/interviews', getAllInterviews);
router.put('/interviews/:id', updateInterview);
router.post('/interviews/:id/cancel', cancelInterview);

module.exports = router;


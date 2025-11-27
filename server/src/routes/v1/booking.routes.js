const express = require('express');
const {
    getAvailableSlots,
    createBooking,
    getBookings,
    rescheduleBooking,
} = require('../../controllers/booking.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get available slots - accessible to all authenticated users
router.get('/slots', getAvailableSlots);

// Get user's bookings - accessible to all authenticated users
router.get('/', getBookings);

// Create booking - only trainees (protect is already applied above)
router.post('/create', authorize('trainee'), createBooking);

// Reschedule booking - only trainees
router.put('/:id/reschedule', authorize('trainee'), rescheduleBooking);

module.exports = router;


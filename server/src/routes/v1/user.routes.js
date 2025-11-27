const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    changeRole,
    sendEmailToUser,
    exportUsers,
} = require('../../controllers/user.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'super_admin', 'hr_admin'));

// Get all users with pagination and filtering
router.get('/', getUsers);

// Export users to CSV
router.get('/export', exportUsers);

// Get single user
router.get('/:id', getUser);

// Create user
router.post('/', createUser);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

// Change user role
router.patch('/:id/role', changeRole);

// Send email to user
router.post('/:id/send-email', sendEmailToUser);

module.exports = router;


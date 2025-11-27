const express = require('express');
const {
    getResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    incrementViews,
} = require('../../controllers/resource.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public routes - must be defined before middleware
router.get('/', getResources);
router.get('/:id', getResource);
router.post('/:id/view', incrementViews);

// Protected routes (Admin only)
router.use(protect, authorize('admin', 'super_admin', 'hr_admin'));

router.post('/', createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

module.exports = router;


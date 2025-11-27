const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notification.service');
const mongoose = require('mongoose');

/**
 * @desc    Get all notifications for the current user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const { limit = 50, skip = 0, unreadOnly } = req.query;
    const userId = req.user._id;

    const result = await notificationService.getUserNotifications(userId, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        unreadOnly: unreadOnly === 'true',
    });

    res.status(200).json({
        success: true,
        data: result.notifications,
        total: result.total,
        unreadCount: result.unreadCount,
    });
});

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(id, userId);

    res.status(200).json({
        success: true,
        data: notification,
    });
});

/**
 * @desc    Mark all notifications as read for the current user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        modifiedCount: result.modifiedCount,
    });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const notification = await notificationService.deleteNotification(id, userId);

    if (!notification) {
        return res.status(404).json({
            success: false,
            error: 'Notification not found',
        });
    }

    res.status(200).json({
        success: true,
        message: 'Notification deleted',
    });
});

const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Create a notification for a user
 */
const createNotification = async ({ userId, title, message, type = 'info', metadata = {} }) => {
    const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        metadata,
    });
    return notification;
};

/**
 * Create notifications for all admin users
 */
const notifyAllAdmins = async ({ title, message, type = 'info', metadata = {} }) => {
    // Find all admin users (admin, super_admin, hr_admin)
    const admins = await User.find({
        role: { $in: ['admin', 'super_admin', 'hr_admin'] }
    });

    // Create notifications for all admins
    const notifications = await Promise.all(
        admins.map(admin =>
            Notification.create({
                userId: admin._id,
                title,
                message,
                type,
                metadata,
            })
        )
    );

    return notifications;
};

/**
 * Get all notifications for a user
 */
const getUserNotifications = async (userId, { limit = 50, skip = 0, unreadOnly = false } = {}) => {
    // Ensure userId is converted to ObjectId for proper query matching
    const userIdObjectId = userId instanceof mongoose.Types.ObjectId 
        ? userId 
        : mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId)
            : userId;

    const query = { userId: userIdObjectId };
    if (unreadOnly) {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: userIdObjectId, isRead: false });

    return {
        notifications,
        total,
        unreadCount,
    };
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId, userId) => {
    // Ensure userId is converted to ObjectId
    const userIdObjectId = userId instanceof mongoose.Types.ObjectId 
        ? userId 
        : mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId)
            : userId;

    const notification = await Notification.findOne({
        _id: notificationId,
        userId: userIdObjectId, // Ensure user can only mark their own notifications as read
    });

    if (!notification) {
        throw new Error('Notification not found');
    }

    notification.isRead = true;
    await notification.save();
    return notification;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
    // Ensure userId is converted to ObjectId
    const userIdObjectId = userId instanceof mongoose.Types.ObjectId 
        ? userId 
        : mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId)
            : userId;

    const result = await Notification.updateMany(
        { userId: userIdObjectId, isRead: false },
        { isRead: true }
    );
    return result;
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
    // Ensure userId is converted to ObjectId
    const userIdObjectId = userId instanceof mongoose.Types.ObjectId 
        ? userId 
        : mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId)
            : userId;

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId: userIdObjectId, // Ensure user can only delete their own notifications
    });
    return notification;
};

module.exports = {
    createNotification,
    notifyAllAdmins,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};


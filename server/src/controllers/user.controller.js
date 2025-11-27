const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { BadRequestError, NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
    const { 
        page = 1, 
        limit = 50, 
        role, 
        status, 
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (role && role !== 'all') {
        query.role = role;
    }

    if (status && status !== 'all') {
        query.status = status;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get users
    const users = await User.find(query)
        .select('-password') // Exclude password
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Get total count (based on filtered query) - for pagination
    const total = await User.countDocuments(query);

    // Calculate FULL stats (not filtered) - always show full totals in cards
    // Active users: status is 'approved' OR status is null/undefined
    const activeQuery = {
        $or: [
            { status: 'approved' },
            { status: { $exists: false } },
            { status: null }
        ]
    };

    // Inactive users
    const inactiveQuery = {
        status: { $in: ['pending_verification', 'rejected'] }
    };

    // Role-based queries (full totals)
    const traineesQuery = { role: 'trainee' };
    const interviewersQuery = { role: 'interviewer' };
    const adminsQuery = { role: 'admin' };

    // Calculate FULL stats (not filtered) - for cards
    const [
        fullTotal,
        activeCount,
        inactiveCount,
        traineesCount,
        interviewersCount,
        adminsCount
    ] = await Promise.all([
        User.countDocuments({}), // Full total
        User.countDocuments(activeQuery),
        User.countDocuments(inactiveQuery),
        User.countDocuments(traineesQuery),
        User.countDocuments(interviewersQuery),
        User.countDocuments(adminsQuery),
    ]);

    const stats = {
        total: fullTotal, // Full total (not filtered) for cards
        active: activeCount,
        inactive: inactiveCount,
        trainees: traineesCount,
        interviewers: interviewersCount,
        admins: adminsCount,
    };

    res.status(200).json({
        success: true,
        data: users,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
        stats,
    });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 */
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return next(new NotFoundError('User not found'));
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
exports.createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, status } = req.body;

    // Validation
    if (!name || !email || !role) {
        return next(new BadRequestError('Please provide name, email, and role'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ConflictError('User with this email already exists'));
    }

    // Prepare user data
    const userData = {
        name,
        email,
        role,
        status: status || (role === 'interviewer' ? 'pending_verification' : 'approved'),
    };

    // Hash password if provided
    if (password) {
        if (password.length < 8) {
            return next(new BadRequestError('Password must be at least 8 characters'));
        }
        userData.password = password; // Will be hashed by UserSchema pre-save hook
    }

    // Create user
    const user = await User.create(userData);

    res.status(201).json({
        success: true,
        data: user.toObject({ transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }}),
        message: 'User created successfully',
    });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, status } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new NotFoundError('User not found'));
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
        if (existingUser) {
            return next(new ConflictError('Email is already in use'));
        }
        user.email = email;
    }
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    // Update password if provided
    if (password) {
        if (password.length < 8) {
            return next(new BadRequestError('Password must be at least 8 characters'));
        }
        user.password = password; // Will be hashed by UserSchema pre-save hook
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: user.toObject({ transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }}),
        message: 'User updated successfully',
    });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new NotFoundError('User not found'));
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id.toString()) {
        return next(new BadRequestError('You cannot delete your own account'));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    });
});

/**
 * @desc    Change user role
 * @route   PATCH /api/users/:id/role
 * @access  Private (Admin only)
 */
exports.changeRole = asyncHandler(async (req, res, next) => {
    const { role } = req.body;

    if (!role || !['trainee', 'interviewer', 'admin'].includes(role)) {
        return next(new BadRequestError('Valid role is required (trainee, interviewer, or admin)'));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new NotFoundError('User not found'));
    }

    user.role = role;
    
    // Update status based on role
    if (role === 'interviewer' && user.status !== 'pending_verification') {
        user.status = 'pending_verification';
    } else if (role !== 'interviewer' && !user.status) {
        user.status = 'approved';
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: user.toObject({ transform: (doc, ret) => {
            delete ret.password;
            return ret;
        }}),
        message: 'User role updated successfully',
    });
});

/**
 * @desc    Send email to user
 * @route   POST /api/users/:id/send-email
 * @access  Private (Admin only)
 */
exports.sendEmailToUser = asyncHandler(async (req, res, next) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        return next(new BadRequestError('Subject and message are required'));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new NotFoundError('User not found'));
    }

    if (!user.email) {
        return next(new BadRequestError('User does not have an email address'));
    }

    // Send email using email service
    try {
        await emailService.sendEmail({
            to: user.email,
            subject,
            text: message,
            html: message.replace(/\n/g, '<br>'),
        });

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return next(new BadRequestError('Failed to send email. Please try again.'));
    }
});

/**
 * @desc    Export users to CSV
 * @route   GET /api/users/export
 * @access  Private (Admin only)
 */
exports.exportUsers = asyncHandler(async (req, res, next) => {
    const { role, status } = req.query;

    // Build query
    const query = {};

    if (role && role !== 'all') {
        query.role = role;
    }

    if (status && status !== 'all') {
        query.status = status;
    }

    // Get all users matching the query (no pagination for export)
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

    // Helper function to format date consistently without timezone conversion
    const formatDateForExport = (dateValue) => {
        if (!dateValue) return 'N/A';
        
        // If it's already a Date object, use it directly; otherwise create one
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'N/A';
        
        // Extract UTC components to avoid timezone conversion issues
        // This ensures the date in the CSV matches exactly what's stored in the database
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        // Format as YYYY-MM-DD (ISO format, consistent and unambiguous)
        return `${year}-${month}-${day}`;
    };

    // Generate CSV content
    const headers = ['Name', 'Email', 'Role', 'Status', 'Registration Date'];
    const rows = users.map(user => [
        user.name || 'N/A',
        user.email || 'N/A',
        user.role || 'N/A',
        user.status || 'N/A',
        formatDateForExport(user.createdAt),
    ]);

    // Convert to CSV format
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users-${new Date().getTime()}.csv`);

    res.status(200).send(csvContent);
});

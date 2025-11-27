const Resource = require('../models/Resource');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * @desc    Get all resources with filtering and pagination
 * @route   GET /api/resources
 * @access  Public
 */
exports.getResources = asyncHandler(async (req, res, next) => {
    const {
        page = 1,
        limit = 50,
        resourceType,
        category,
        subcategory,
        difficulty,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (resourceType && resourceType !== 'all') {
        // Normalize resourceType to handle variations
        const normalizedType = resourceType.toLowerCase().replace(/\s+/g, '_');
        query.resourceType = normalizedType;
    }

    if (category && category !== 'all') {
        // Normalize category: convert dashes to spaces for matching
        // Handles both "system-design" -> matches "System Design" in database
        const categoryNormalized = category.replace(/-/g, ' ');
        // Escape special regex characters for regex matching
        const escapedCategory = categoryNormalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Case-insensitive regex matching for flexible category names
        query.category = { $regex: new RegExp(`^${escapedCategory}$`, 'i') };
    }

    if (subcategory && subcategory !== 'all') {
        // Normalize subcategory
        const subcategoryNormalized = subcategory.replace(/-/g, ' ');
        const escapedSubcategory = subcategoryNormalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.subcategory = { $regex: new RegExp(`^${escapedSubcategory}$`, 'i') };
    }

    if (difficulty && difficulty !== 'all') {
        query.difficulty = difficulty.toLowerCase(); // Normalize difficulty
    }

    // Handle search
    if (search) {
        const searchConditions = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
            { category: { $regex: search, $options: 'i' } },
        ];
        
        // If we have other filters (category, subcategory, difficulty, etc.), use $and to combine
        if (query.category || query.subcategory || query.difficulty || query.resourceType) {
            // Convert query to use $and structure
            const filterConditions = [];
            if (query.category) {
                filterConditions.push({ category: query.category });
                delete query.category;
            }
            if (query.subcategory) {
                filterConditions.push({ subcategory: query.subcategory });
                delete query.subcategory;
            }
            if (query.difficulty) {
                filterConditions.push({ difficulty: query.difficulty });
                delete query.difficulty;
            }
            if (query.resourceType) {
                filterConditions.push({ resourceType: query.resourceType });
                delete query.resourceType;
            }
            
            query.$and = [
                ...filterConditions,
                { $or: searchConditions }
            ];
        } else {
            query.$or = searchConditions;
        }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get resources
    const resources = await Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();
    
    // Handle createdBy population manually to avoid CastError for invalid ObjectIds
    const User = require('../models/User');
    const formattedResources = await Promise.all(resources.map(async (resource) => {
        let populatedCreatedBy = null;
        
        // Only try to populate if createdBy exists and is a valid ObjectId
        if (resource.createdBy) {
            if (mongoose.Types.ObjectId.isValid(resource.createdBy)) {
                try {
                    const user = await User.findById(resource.createdBy).select('name email').lean();
                    populatedCreatedBy = user || null;
                } catch (error) {
                    // If populate fails, set to null
                    populatedCreatedBy = null;
                }
            }
            // If createdBy is not a valid ObjectId (e.g., it's a string like "Tech Analyst"), ignore it
        }
        
        return {
            ...resource,
            createdAt: resource.createdAt ? new Date(resource.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: resource.updatedAt ? new Date(resource.updatedAt).toISOString() : new Date().toISOString(),
            createdBy: populatedCreatedBy || null,
            // Ensure numeric fields always have default values to prevent frontend errors
            views: (typeof resource.views === 'number' && !isNaN(resource.views)) ? resource.views : 0,
            rating: (typeof resource.rating === 'number' && !isNaN(resource.rating)) ? resource.rating : 0,
            // Ensure tags is always an array
            tags: Array.isArray(resource.tags) ? resource.tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0) : [],
            // Ensure contentUrl and thumbnailUrl are strings or null
            contentUrl: resource.contentUrl && typeof resource.contentUrl === 'string' ? resource.contentUrl.trim() : null,
            thumbnailUrl: resource.thumbnailUrl && typeof resource.thumbnailUrl === 'string' ? resource.thumbnailUrl.trim() : null,
        };
    }));

    // Get total count
    const total = await Resource.countDocuments(query);

    // Get stats by resource type
    const stats = {
        total: await Resource.countDocuments(),
        guides: await Resource.countDocuments({ resourceType: 'guide' }),
        videos: await Resource.countDocuments({ resourceType: 'video' }),
        question_banks: await Resource.countDocuments({ resourceType: 'question_bank' }),
        courses: await Resource.countDocuments({ resourceType: 'course' }),
        articles: await Resource.countDocuments({ resourceType: 'article' }),
    };

    // Get category counts (case-insensitive grouping)
    const categoryStats = await Resource.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $project: {
                _id: 1,
                count: 1
            }
        }
    ]);

    // Get subcategory counts grouped by category
    const subcategoryStats = await Resource.aggregate([
        {
            $match: {
                subcategory: { $exists: true, $ne: null, $ne: '' }
            }
        },
        {
            $group: {
                _id: {
                    category: '$category',
                    subcategory: '$subcategory'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.category',
                subcategories: {
                    $push: {
                        name: '$_id.subcategory',
                        count: '$count'
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    // Get difficulty counts
    const difficultyStats = await Resource.aggregate([
        {
            $group: {
                _id: '$difficulty',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: formattedResources,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
        stats,
        categoryStats,
        subcategoryStats,
        difficultyStats,
    });
});

/**
 * @desc    Get single resource by ID
 * @route   GET /api/resources/:id
 * @access  Public
 */
exports.getResource = asyncHandler(async (req, res, next) => {
    const resource = await Resource.findById(req.params.id).lean();

    if (!resource) {
        return next(new NotFoundError('Resource not found'));
    }

    // Handle createdBy population manually to avoid CastError for invalid ObjectIds
    let populatedCreatedBy = null;
    if (resource.createdBy) {
        if (mongoose.Types.ObjectId.isValid(resource.createdBy)) {
            try {
                const User = require('../models/User');
                const user = await User.findById(resource.createdBy).select('name email').lean();
                populatedCreatedBy = user || null;
            } catch (error) {
                populatedCreatedBy = null;
            }
        }
    }

    // Don't auto-increment views here - use the dedicated /view endpoint instead
    const formattedResource = {
        ...resource,
        createdAt: resource.createdAt ? new Date(resource.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: resource.updatedAt ? new Date(resource.updatedAt).toISOString() : new Date().toISOString(),
        createdBy: populatedCreatedBy || null,
        // Ensure numeric fields have default values
        views: (typeof resource.views === 'number' && !isNaN(resource.views)) ? resource.views : 0,
        rating: (typeof resource.rating === 'number' && !isNaN(resource.rating)) ? resource.rating : 0,
        // Ensure tags is always an array
        tags: Array.isArray(resource.tags) ? resource.tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0) : [],
        // Ensure contentUrl and thumbnailUrl are strings or null
        contentUrl: resource.contentUrl && typeof resource.contentUrl === 'string' ? resource.contentUrl.trim() : null,
        thumbnailUrl: resource.thumbnailUrl && typeof resource.thumbnailUrl === 'string' ? resource.thumbnailUrl.trim() : null,
        // Ensure subcategory is included
        subcategory: resource.subcategory && typeof resource.subcategory === 'string' ? resource.subcategory.trim() : null,
    };

    res.status(200).json({
        success: true,
        data: formattedResource,
    });
});

/**
 * @desc    Create new resource
 * @route   POST /api/resources
 * @access  Private (Admin only)
 */
exports.createResource = asyncHandler(async (req, res, next) => {
    const {
        resourceType,
        title,
        description,
        difficulty,
        category,
        contentUrl,
        thumbnailUrl,
        tags,
        subcategory,
        duration,
        author,
        questionText,
        answerSample,
    } = req.body;

    // Validation
    if (!resourceType || !title || !description || !difficulty || !category || !contentUrl) {
        return next(new BadRequestError('Please provide all required fields: resourceType, title, description, difficulty, category, contentUrl'));
    }

    // Normalize and validate
    const normalizedDifficulty = difficulty.toLowerCase();
    if (!['beginner', 'intermediate', 'advanced'].includes(normalizedDifficulty)) {
        return next(new BadRequestError('Difficulty must be beginner, intermediate, or advanced'));
    }

    const normalizedResourceType = resourceType.toLowerCase().replace(/\s+/g, '_');
    if (!['guide', 'video', 'question_bank', 'course', 'article'].includes(normalizedResourceType)) {
        return next(new BadRequestError('Invalid resource type'));
    }

    const resourceData = {
        resourceType: normalizedResourceType,
        title: title.trim(),
        description: description.trim(),
        difficulty: normalizedDifficulty,
        category: category.trim(),
        subcategory: subcategory ? subcategory.trim() : null,
        contentUrl: contentUrl.trim(),
        thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : '',
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
        duration: duration ? duration.trim() : '',
        author: author ? author.trim() : '',
        questionText: questionText ? questionText.trim() : '',
        answerSample: answerSample ? answerSample.trim() : '',
        createdBy: req.user ? req.user.id : null,
    };

    const resource = await Resource.create(resourceData);

    await resource.populate({
        path: 'createdBy',
        select: 'name email',
        options: { strictPopulate: false }
    });

    // Format response with proper date handling
    const resourceResponse = resource.toObject();
    resourceResponse.createdAt = resource.createdAt ? new Date(resource.createdAt).toISOString() : new Date().toISOString();
    resourceResponse.updatedAt = resource.updatedAt ? new Date(resource.updatedAt).toISOString() : new Date().toISOString();
    resourceResponse.createdBy = resource.createdBy || null;

    res.status(201).json({
        success: true,
        data: resourceResponse,
    });
});

/**
 * @desc    Update resource
 * @route   PUT /api/resources/:id
 * @access  Private (Admin only)
 */
exports.updateResource = asyncHandler(async (req, res, next) => {
    // First check if resource exists using lean() to avoid casting errors
    const resourceCheck = await Resource.findById(req.params.id).lean();

    if (!resourceCheck) {
        return next(new NotFoundError('Resource not found'));
    }

    // Clean up invalid createdBy values directly in database if needed
    // Some old resources may have invalid createdBy values (strings instead of ObjectIds like "UX_Pro")
    if (resourceCheck.createdBy && !mongoose.Types.ObjectId.isValid(String(resourceCheck.createdBy))) {
        // Fix invalid createdBy value directly in database using raw update
        await Resource.collection.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $set: { createdBy: null } }
        );
    }

    // Now load the resource normally for updates
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
        return next(new NotFoundError('Resource not found'));
    }

    // Remove createdBy from request body - it shouldn't be updated
    const { createdBy, ...updateData } = req.body;

    const {
        resourceType,
        title,
        description,
        difficulty,
        category,
        contentUrl,
        thumbnailUrl,
        tags,
        subcategory,
        duration,
        author,
        questionText,
        answerSample,
    } = updateData;

    // Update fields with normalization
    if (resourceType) {
        const normalizedType = resourceType.toLowerCase().replace(/\s+/g, '_');
        if (['guide', 'video', 'question_bank', 'course', 'article'].includes(normalizedType)) {
            resource.resourceType = normalizedType;
        }
    }
    if (title) resource.title = title.trim();
    if (description) resource.description = description.trim();
    if (difficulty) {
        const normalizedDifficulty = difficulty.toLowerCase();
        if (['beginner', 'intermediate', 'advanced'].includes(normalizedDifficulty)) {
            resource.difficulty = normalizedDifficulty;
        }
    }
    if (category) resource.category = category.trim();
    if (subcategory !== undefined) resource.subcategory = subcategory ? subcategory.trim() : '';
    // Only update contentUrl if it's provided and not empty (it's required, so preserve existing if not provided)
    if (contentUrl !== undefined && contentUrl !== null && String(contentUrl).trim() !== '') {
        resource.contentUrl = String(contentUrl).trim();
    } else if (contentUrl !== undefined && (contentUrl === null || String(contentUrl).trim() === '')) {
        // Don't allow setting required field to empty/null - preserve existing value
        // This prevents validation errors
    }
    if (thumbnailUrl !== undefined) resource.thumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : '';
    if (tags !== undefined) {
        resource.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []);
    }
    if (duration !== undefined) resource.duration = duration ? duration.trim() : '';
    if (author !== undefined) resource.author = author ? author.trim() : '';
    if (questionText !== undefined) resource.questionText = questionText ? questionText.trim() : '';
    if (answerSample !== undefined) resource.answerSample = answerSample ? answerSample.trim() : '';

    // Ensure createdBy is either null or a valid ObjectId before saving
    // This handles cases where existing resources have invalid createdBy values
    if (resource.createdBy) {
        if (!mongoose.Types.ObjectId.isValid(resource.createdBy)) {
            // If createdBy is not a valid ObjectId, set it to null
            resource.createdBy = null;
        }
    }

    // Validate before saving
    try {
        await resource.validate();
    } catch (validationError) {
        if (validationError.name === 'ValidationError') {
            const errors = Object.values(validationError.errors).map(err => err.message).join(', ');
            return next(new BadRequestError(`Validation failed: ${errors}`));
        }
    }

    // Save resource with error handling for CastError
    try {
        await resource.save();
    } catch (saveError) {
        // Handle CastError specifically (e.g., invalid createdBy value)
        if (saveError.name === 'CastError' && saveError.path === 'createdBy') {
            // If createdBy has an invalid value, set it to null and try again
            resource.createdBy = null;
            await resource.save();
        } else if (saveError.name === 'ValidationError') {
            const errors = Object.values(saveError.errors).map(err => err.message).join(', ');
            return next(new BadRequestError(`Validation failed: ${errors}`));
        } else {
            throw saveError;
        }
    }
    await resource.populate({
        path: 'createdBy',
        select: 'name email',
        options: { strictPopulate: false }
    });

    // Format response
    const resourceResponse = resource.toObject();
    resourceResponse.createdAt = resource.createdAt ? new Date(resource.createdAt).toISOString() : new Date().toISOString();
    resourceResponse.updatedAt = resource.updatedAt ? new Date(resource.updatedAt).toISOString() : new Date().toISOString();

    res.status(200).json({
        success: true,
        data: resourceResponse,
    });
});

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 * @access  Private (Admin only)
 */
exports.deleteResource = asyncHandler(async (req, res, next) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
        return next(new NotFoundError('Resource not found'));
    }

    await resource.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Resource deleted successfully',
    });
});

/**
 * @desc    Increment resource views
 * @route   POST /api/resources/:id/view
 * @access  Public
 */
exports.incrementViews = asyncHandler(async (req, res, next) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
        return next(new NotFoundError('Resource not found'));
    }

    // Atomic increment to prevent race conditions
    const updatedResource = await Resource.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true, runValidators: true }
    ).lean();

    res.status(200).json({
        success: true,
        data: { 
            views: updatedResource.views || 0,
            resource: updatedResource
        },
    });
});


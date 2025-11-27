const User = require('../models/User');
const { ConflictError, UnauthorizedError, ForbiddenError, BadRequestError } = require('../utils/errors');
const { notifyAllAdmins } = require('./notification.service');
const { isAllowedOAuthRole, normalizeRole, isAdminRole } = require('../utils/roleValidation');

/**
 * Handle OAuth callback - creates user without role if new, requires role selection
 */
const handleOAuthCallback = async ({ provider, profileId, email, name, roleFromQuery }) => {
    // First, try to find user by OAuth provider ID
    const query = {};
    if (provider === 'google') query.googleId = profileId;
    if (provider === 'github') query.githubId = profileId;
    if (provider === 'linkedin') query.linkedinId = profileId;

    let user = await User.findOne(query);

    if (user) {
        // User already exists - allow login (they already have a role)
        return user;
    }

    // If no user found by OAuth ID, check if user exists by email
    if (email) {
        user = await User.findOne({ email });

        if (user) {
            // Link the OAuth provider to existing account
            // Don't change role of existing users for security
            if (provider === 'google') user.googleId = profileId;
            if (provider === 'github') user.githubId = profileId;
            if (provider === 'linkedin') user.linkedinId = profileId;
            if (!user.name && name) user.name = name;
            // Clear oauthRolePending flag if it exists
            user.oauthRolePending = false;
            await user.save();
            return user;
        }
    }

    // If role is provided in query (backward compatibility), use it
    // Otherwise, create user with pending role selection
    const normalizedRole = normalizeRole(roleFromQuery);
    
    if (normalizedRole) {
        // Role provided - validate it
        // Block admin roles from OAuth sign-up
        if (isAdminRole(normalizedRole)) {
            throw new ForbiddenError('Admin roles cannot be assigned through OAuth sign-up. Please contact an administrator.');
        }
        
        // Validate role is allowed for OAuth
        if (!isAllowedOAuthRole(normalizedRole)) {
            throw new BadRequestError(`Invalid role: ${roleFromQuery}. Only 'trainee' and 'interviewer' roles are allowed for OAuth sign-up.`);
        }
        
        // Create user with the provided role
        return await createOAuthUserWithRole({ provider, profileId, email, name, normalizedRole });
    } else {
        // No role provided - create user with pending role selection
        return await createOAuthUserPendingRole({ provider, profileId, email, name });
    }
};

/**
 * Create OAuth user with a specific role
 */
const createOAuthUserWithRole = async ({ provider, profileId, email, name, normalizedRole }) => {
    const newUserData = {
        name,
        role: normalizedRole,
        oauthRolePending: false,
    };

    if (email) newUserData.email = email;
    if (provider === 'google') newUserData.googleId = profileId;
    if (provider === 'github') newUserData.githubId = profileId;
    if (provider === 'linkedin') newUserData.linkedinId = profileId;

    // Handle interviewer role - set status to pending_verification
    if (normalizedRole === 'interviewer') {
        newUserData.status = 'pending_verification';
        newUserData.isApproved = false;
    } else {
        newUserData.status = 'approved';
        newUserData.isApproved = true;
    }

    try {
        const user = await User.create(newUserData);
        
        // Notify admins if interviewer was created
        if (normalizedRole === 'interviewer' && user.status === 'pending_verification') {
            try {
                await notifyAllAdmins({
                    title: 'New Pending Interviewer Application (OAuth)',
                    message: `${user.name || user.email} has signed up as an interviewer via ${provider} and needs to complete their profile.`,
                    type: 'info',
                    metadata: {
                        interviewerId: user._id.toString(),
                        interviewerName: user.name || user.email,
                        type: 'pending_interviewer_application',
                        oauthProvider: provider,
                        incompleteProfile: true,
                    },
                });
            } catch (notificationError) {
                console.error('[Auth] Failed to create notification for OAuth interviewer:', notificationError.message);
            }
        }
        
        return user;
    } catch (err) {
        if (err.code === 11000 && email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                if (provider === 'google') existingUser.googleId = profileId;
                if (provider === 'github') existingUser.githubId = profileId;
                if (provider === 'linkedin') existingUser.linkedinId = profileId;
                existingUser.oauthRolePending = false;
                await existingUser.save();
                return existingUser;
            }
        }
        throw err;
    }
};

/**
 * Create OAuth user with pending role selection
 */
const createOAuthUserPendingRole = async ({ provider, profileId, email, name }) => {
    // Create user with temporary 'trainee' role and oauthRolePending flag
    // They will select their actual role on the frontend
    const newUserData = {
        name,
        role: 'trainee', // Temporary default - will be changed during role selection
        status: 'approved', // Temporary - will be updated based on role selection
        isApproved: true,
        oauthRolePending: true, // Flag to indicate role selection is needed
    };

    if (email) newUserData.email = email;
    if (provider === 'google') newUserData.googleId = profileId;
    if (provider === 'github') newUserData.githubId = profileId;
    if (provider === 'linkedin') newUserData.linkedinId = profileId;

    try {
        const user = await User.create(newUserData);
        return user;
    } catch (err) {
        if (err.code === 11000 && email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                if (provider === 'google') existingUser.googleId = profileId;
                if (provider === 'github') existingUser.githubId = profileId;
                if (provider === 'linkedin') existingUser.linkedinId = profileId;
                existingUser.oauthRolePending = false;
                await existingUser.save();
                return existingUser;
            }
        }
        throw err;
    }
};

/**
 * Register a new user
 */
const register = async ({ name, email, password, role, experience, expertise, linkedin, resume }) => {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
        // If user exists but has no password (OAuth user), allow setting password
        if (!user.password) {
            user.password = password;
            if (name) user.name = name;
            await user.save();
            return user;
        }
        throw new ConflictError('User already exists. Please log in instead.');
    }

    // Prepare user data
    const userData = {
        name,
        email,
        password,
        role: role || 'trainee',
    };

    // If interviewer, set status and additional fields
    if (role === 'interviewer') {
        userData.status = 'pending_verification';
        userData.experience = experience;
        userData.expertise = expertise;
        userData.linkedin = linkedin;
        if (resume) userData.resume = resume;
        userData.isApproved = false;
    } else {
        userData.status = 'approved';
        userData.isApproved = true;
    }

    // Create new user
    user = await User.create(userData);

    // Notify admins based on role
    try {
        if (role === 'interviewer' && userData.status === 'pending_verification') {
            // Notify admins about pending interviewer application
            await notifyAllAdmins({
                title: 'New Pending Interviewer Application',
                message: `${user.name || user.email} has submitted an interviewer application and is awaiting review.`,
                type: 'info',
                metadata: {
                    interviewerId: user._id.toString(),
                    interviewerName: user.name || user.email,
                    type: 'pending_interviewer_application',
                },
            });
        } else if (role === 'trainee') {
            // Notify admins about new trainee registration
            const registrationDate = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            await notifyAllAdmins({
                title: 'New Trainee Registration',
                message: `A new trainee has registered: ${user.name || user.email}. Registration date: ${registrationDate}`,
                type: 'info',
                metadata: {
                    traineeId: user._id.toString(),
                    traineeName: user.name || user.email,
                    traineeEmail: user.email,
                    registrationDate: user.createdAt || new Date(),
                    type: 'trainee_registration',
                },
            });
        }
    } catch (notificationError) {
        // Log error but don't fail registration if notification fails
        console.error('[Auth] Failed to create notification:', notificationError.message);
    }

    return user;
};

/**
 * Login user
 */
const login = async ({ email, password }) => {
    if (!email || !password) {
        throw new UnauthorizedError('Please provide an email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        throw new UnauthorizedError('Invalid credentials');
    }

    return user;
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

module.exports = {
    handleOAuthCallback,
    register,
    login,
    getUserById,
};


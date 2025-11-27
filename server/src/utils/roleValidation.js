/**
 * Valid roles for OAuth sign-up
 * Admin roles are NOT allowed for OAuth sign-up for security reasons
 */
const ALLOWED_OAUTH_ROLES = ['trainee', 'interviewer'];

/**
 * Admin roles that should be blocked from OAuth sign-up
 */
const ADMIN_ROLES = ['admin', 'super_admin', 'hr_admin'];

/**
 * All valid user roles in the system
 */
const ALL_ROLES = [...ALLOWED_OAUTH_ROLES, ...ADMIN_ROLES];

/**
 * Validate if a role is allowed for OAuth sign-up
 * @param {string} role - The role to validate
 * @returns {boolean} - True if role is allowed for OAuth sign-up
 */
const isAllowedOAuthRole = (role) => {
    if (!role) return false;
    return ALLOWED_OAUTH_ROLES.includes(role.toLowerCase());
};

/**
 * Validate if a role is valid in the system
 * @param {string} role - The role to validate
 * @returns {boolean} - True if role is valid
 */
const isValidRole = (role) => {
    if (!role) return false;
    return ALL_ROLES.includes(role.toLowerCase());
};

/**
 * Check if a role is an admin role
 * @param {string} role - The role to check
 * @returns {boolean} - True if role is an admin role
 */
const isAdminRole = (role) => {
    if (!role) return false;
    return ADMIN_ROLES.includes(role.toLowerCase());
};

/**
 * Normalize role to lowercase
 * @param {string} role - The role to normalize
 * @returns {string} - Normalized role or null if invalid
 */
const normalizeRole = (role) => {
    if (!role) return null;
    const normalized = role.toLowerCase();
    return isValidRole(normalized) ? normalized : null;
};

module.exports = {
    ALLOWED_OAUTH_ROLES,
    ADMIN_ROLES,
    ALL_ROLES,
    isAllowedOAuthRole,
    isValidRole,
    isAdminRole,
    normalizeRole,
};


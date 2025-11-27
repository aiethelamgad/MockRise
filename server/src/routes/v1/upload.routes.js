const express = require('express');
const { uploadResume, getResume } = require('../../controllers/upload.controller');
const upload = require('../../middlewares/upload.middleware');
const { optionalAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Upload resume - optionally authenticated (public for signup, authenticated for OAuth role selection)
router.post('/resume', optionalAuth, upload.single('resume'), uploadResume);

// Get resume file - serve files (can add protection later if needed)
// Use regex pattern to capture entire filename including special characters
// The regex [^/]+ matches one or more characters that are not slashes
router.get(/^\/resumes\/(.+)$/, getResume);

module.exports = router;


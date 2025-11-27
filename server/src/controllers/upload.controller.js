const asyncHandler = require('../utils/asyncHandler');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Upload resume file
 * @route   POST /api/upload/resume
 * @access  Private (or Public for signup)
 */
exports.uploadResume = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  // Return the file URL
  const fileUrl = `/api/uploads/resumes/${req.file.filename}`;
  
  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
    },
  });
});

/**
 * @desc    Serve resume file
 * @route   GET /api/uploads/resumes/:filename
 * @access  Private (Admin only)
 */
exports.getResume = asyncHandler(async (req, res, next) => {
  // Ensure uploads directory exists
  const uploadsDir = path.resolve(path.join(__dirname, '../../uploads/resumes'));
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Extract filename from regex route match
  // For regex routes, captured groups are in req.params array (req.params[0] is first capture group)
  // Also check req.params.filename in case it's set
  let filename = req.params[0] || req.params.filename || '';
  
  // Decode URL encoding (e.g., %20 for spaces, %2 for other characters)
  try {
    filename = decodeURIComponent(filename);
  } catch (err) {
    // If decoding fails, use the original filename
    // Silently use original filename if decoding fails
  }

  // Remove any leading slashes
  filename = filename.replace(/^\/+/, '');

  const filePath = path.join(uploadsDir, filename);

  // Security: Prevent directory traversal - resolve path and check it's within uploads directory
  const resolvedPath = path.resolve(filePath);
  
  if (!resolvedPath.startsWith(uploadsDir)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid file path',
    });
  }

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    // Try to find a file that matches the original filename (for legacy data)
    // This handles cases where database has "filename.pdf" but file is "filename-1234567890-987654321.pdf"
    let matchingFile = null;
    try {
      const files = fs.readdirSync(uploadsDir);
      // Extract base name without extension
      const baseName = filename.replace(/\.pdf$/i, '').replace(/-\d+-\d+$/, ''); // Remove multer suffix pattern
      matchingFile = files.find(f => {
        const fileBaseName = f.replace(/\.pdf$/i, '').replace(/-\d+-\d+$/, '');
        return fileBaseName === baseName && f.endsWith('.pdf');
      });
    } catch (err) {
      // Ignore readdir errors
    }
    
    // If found a matching file, use it
    if (matchingFile) {
      const matchingFilePath = path.join(uploadsDir, matchingFile);
      const matchingResolvedPath = path.resolve(matchingFilePath);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      return res.sendFile(matchingResolvedPath);
    }
    
    // File not found - return error
    return res.status(404).json({
      success: false,
      error: `Resume file not found: ${filename}`,
      message: 'The resume file may have been deleted or never uploaded. Please ask the interviewer to re-upload their resume.',
      debug: process.env.NODE_ENV === 'development' ? {
        requestedFilename: filename,
        resolvedPath: resolvedPath,
        uploadsDir: uploadsDir,
        availableFiles: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf')).slice(0, 5) : [],
      } : undefined,
    });
  }

  // Set appropriate headers for PDF files
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);

  // Send the file
  res.sendFile(resolvedPath);
});


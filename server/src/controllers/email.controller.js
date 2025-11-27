const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/email.service');

/**
 * @desc    Test email configuration
 * @route   GET /api/email/test
 * @access  Private (Admin only) or Public for testing
 */
exports.testEmail = asyncHandler(async (req, res, next) => {
    try {
        const nodemailer = require('nodemailer');
        
        // Check environment variables
        const config = {
            SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
            SMTP_PORT: process.env.SMTP_PORT || '587',
            SMTP_SECURE: process.env.SMTP_SECURE === 'true',
            SMTP_USER: process.env.SMTP_USER || 'Not set',
            SMTP_PASS: process.env.SMTP_PASS ? '***' : 'Not set',
        };

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return res.status(400).json({
                success: false,
                error: 'Email configuration is missing',
                config,
                message: 'Please set SMTP_USER and SMTP_PASS in your .env file',
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: parseInt(config.SMTP_PORT),
            secure: config.SMTP_SECURE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            debug: false,
            logger: false,
        });

        // Test connection
        try {
            await transporter.verify();
            return res.status(200).json({
                success: true,
                message: 'Email configuration is valid and connection successful',
                config: {
                    ...config,
                    SMTP_USER: process.env.SMTP_USER, // Show actual user for debugging
                },
            });
        } catch (verifyError) {
            return res.status(400).json({
                success: false,
                error: 'SMTP connection failed',
                message: verifyError.message,
                config,
                details: {
                    responseCode: verifyError.responseCode,
                    response: verifyError.response,
                    command: verifyError.command,
                },
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error testing email configuration',
            message: error.message,
        });
    }
});

module.exports = exports;


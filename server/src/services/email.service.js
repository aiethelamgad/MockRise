const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null; // Email not configured
    }

    // Use environment variables for email configuration
    // For production, use real SMTP credentials
    // For development, can use services like Gmail, SendGrid, or Mailtrap
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: false,
        logger: false,
    });

    return transporter;
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ email, name, resetToken }) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            // Email not configured - log the reset link for development only
            if (process.env.NODE_ENV === 'development') {
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
                const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
                console.warn('[Email] SMTP not configured. Reset link:', resetUrl);
            }
            return { messageId: 'dev-mode', accepted: [email] };
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"MockRise" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reset Your Password - MockRise',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Password</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">MockRise</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                        <p>Hello ${name || 'there'},</p>
                        <p>We received a request to reset your password for your MockRise account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      display: inline-block;
                                      font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            If you didn't request a password reset, please ignore this email. Your password will not be changed.
                        </p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            © ${new Date().getFullYear()} MockRise. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>
            `,
            text: `
                Reset Your Password - MockRise
                
                Hello ${name || 'there'},
                
                We received a request to reset your password for your MockRise account.
                
                Click the link below to reset your password:
                ${resetUrl}
                
                This link will expire in 1 hour for security reasons.
                
                If you didn't request a password reset, please ignore this email. Your password will not be changed.
                
                © ${new Date().getFullYear()} MockRise. All rights reserved.
            `,
        };

        // Verify transporter connection (optional - can skip for faster sending)
        try {
            await transporter.verify();
        } catch (verifyError) {
            // Don't throw - try sending anyway as verification sometimes fails even when sending works
        }

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        
        if (info.rejected && info.rejected.length > 0) {
            console.error('[Email] Some recipients were rejected:', info.rejected);
        }
        
        return info;
    } catch (error) {
        console.error('[Email] Failed to send password reset email:', error.message);
        if (error.responseCode) {
            console.error(`[Email] SMTP Response Code: ${error.responseCode}`);
        }
        throw error;
    }
};

/**
 * Send a generic email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text message
 * @param {string} [options.html] - HTML message
 * @returns {Promise} Email sending result
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            // Email not configured - log the email content for development only
            if (process.env.NODE_ENV === 'development') {
                console.warn('[Email] SMTP not configured. Email would be sent to:', to);
                console.warn('[Email] Subject:', subject);
                if (text) console.warn('[Email] Text:', text);
                if (html) console.warn('[Email] HTML:', html);
            }
            return { messageId: 'dev-mode', accepted: [to] };
        }

        const mailOptions = {
            from: `"MockRise" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            text: text || html?.replace(/<[^>]*>/g, ''), // Strip HTML tags if no text provided
            html: html || text?.replace(/\n/g, '<br>'), // Convert newlines to <br> if no HTML provided
        };

        // Verify transporter connection (optional - can skip for faster sending)
        try {
            await transporter.verify();
        } catch (verifyError) {
            // Don't throw - try sending anyway as verification sometimes fails even when sending works
        }

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        
        if (info.rejected && info.rejected.length > 0) {
            console.error('[Email] Some recipients were rejected:', info.rejected);
        }
        
        return info;
    } catch (error) {
        console.error('[Email] Failed to send email:', error.message);
        if (error.responseCode) {
            console.error(`[Email] SMTP Response Code: ${error.responseCode}`);
        }
        throw error;
    }
};

module.exports = {
    createTransporter,
    sendPasswordResetEmail,
    sendEmail,
};


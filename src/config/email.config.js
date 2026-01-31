import nodemailer from 'nodemailer';

/**
 * Email Configuration for Nodemailer
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Gmail App Password:
 *    - Go to Google Account Settings
 *    - Security → 2-Step Verification (enable if not enabled)
 *    - App Passwords → Generate new password for "Mail"
 * 
 * 2. Add to .env file:
 *    EMAIL_USER=your-email@gmail.com
 *    EMAIL_PASS=your-app-password
 *    EMAIL_FROM=MediConnect <your-email@gmail.com>
 * 
 * Alternative Email Services:
 * - SendGrid: Use API key instead of SMTP
 * - AWS SES: Configure AWS credentials
 * - Outlook: Use smtp-mail.outlook.com
 */

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured. Add EMAIL_USER and EMAIL_PASS to .env file');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // Use 'gmail', 'outlook', or custom SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password for Gmail
    },
  });
};

// Initialize transporter
let transporter = createTransporter();

/**
 * Send email using nodemailer
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // If transporter not configured, log to console
    if (!transporter) {
      console.log('📧 EMAIL (Not Sent - Configure .env):', { to, subject });
      return { success: false, error: 'Email not configured' };
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'MediConnect <noreply@mediconnect.com>',
      to,
      subject,
      text,
      html: html || text, // Use HTML if provided, otherwise plain text
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  if (!transporter) {
    return { configured: false, message: 'Email credentials not set in .env' };
  }

  try {
    await transporter.verify();
    return { configured: true, message: 'Email service ready' };
  } catch (error) {
    return { configured: false, message: error.message };
  }
};

export default transporter;

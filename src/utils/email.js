import nodemailer from 'nodemailer';

// Nodemailer (SMTP) configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
// Use production frontend for email links when deployed; override with FRONTEND_URL in env
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://stayinn-hostels-launch.vercel.app'
    : 'http://localhost:3000');

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.warn('⚠️  SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS required). Email functionality will be disabled.');
}

const defaultStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
  .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
`;

/**
 * Send email verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @param {string} fullName - User's full name
 */
export const sendVerificationEmail = async (email, token, fullName) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  if (!transporter) {
    console.warn(`⚠️  SMTP not configured. Verification email would be sent to ${email}`);
    console.warn(`   Verification URL: ${verificationUrl}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email - StayInn Hostels',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${defaultStyles}</style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to StayInn Hostels!</h1>
              </div>
              <div class="content">
                <p>Hi ${fullName},</p>
                <p>Thank you for registering with StayInn Hostels. Please verify your email address to complete your registration and start booking rooms.</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account with StayInn Hostels, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} StayInn Hostels. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 * @param {string} fullName - User's full name
 */
export const sendPasswordResetEmail = async (email, token, fullName) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  if (!transporter) {
    console.warn(`⚠️  SMTP not configured. Password reset email would be sent to ${email}`);
    console.warn(`   Reset URL: ${resetUrl}`);
    return;
  }

  const warningStyles = '.warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }';

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - StayInn Hostels',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${defaultStyles}${warningStyles}</style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hi ${fullName},</p>
                <p>We received a request to reset your password for your StayInn Hostels account.</p>
                <p style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                <div class="warning">
                  <p><strong>⚠️ Security Notice:</strong></p>
                  <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                </div>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} StayInn Hostels. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

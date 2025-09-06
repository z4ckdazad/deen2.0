import nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} Send result
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"DeenVerse" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw new AppError('Failed to send email', 500);
  }
};

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>} Send result
 */
export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to DeenVerse!';
  const text = `Welcome to DeenVerse, ${name}! We're excited to have you join our Islamic learning community.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c5530;">Welcome to DeenVerse!</h2>
      <p>Assalamu Alaikum ${name},</p>
      <p>Welcome to DeenVerse! We're excited to have you join our Islamic learning community.</p>
      <p>You can now:</p>
      <ul>
        <li>Connect with qualified Imaam</li>
        <li>Share knowledge and insights</li>
        <li>Join discussions and learn from others</li>
        <li>Build meaningful connections</li>
      </ul>
      <p>May Allah bless your journey of learning and growth.</p>
      <p>Best regards,<br>The DeenVerse Team</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} resetToken - Reset token
 * @returns {Promise<Object>} Send result
 */
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request - DeenVerse';
  const text = `Hello ${name}, you requested a password reset. Click the link to reset your password: ${resetUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c5530;">Password Reset Request</h2>
      <p>Assalamu Alaikum ${name},</p>
      <p>You requested a password reset for your DeenVerse account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2c5530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>Best regards,<br>The DeenVerse Team</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} verificationToken - Verification token
 * @returns {Promise<Object>} Send result
 */
export const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your Email - DeenVerse';
  const text = `Hello ${name}, please verify your email address by clicking the link: ${verificationUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c5530;">Verify Your Email Address</h2>
      <p>Assalamu Alaikum ${name},</p>
      <p>Thank you for registering with DeenVerse! Please verify your email address to complete your registration.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #2c5530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The DeenVerse Team</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send connection request notification email
 * @param {string} email - Imaam email
 * @param {string} imaamName - Imaam name
 * @param {string} studentName - Student name
 * @returns {Promise<Object>} Send result
 */
export const sendConnectionRequestEmail = async (email, imaamName, studentName) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  const subject = 'New Connection Request - DeenVerse';
  const text = `Hello ${imaamName}, ${studentName} wants to connect with you on DeenVerse.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c5530;">New Connection Request</h2>
      <p>Assalamu Alaikum ${imaamName},</p>
      <p><strong>${studentName}</strong> wants to connect with you on DeenVerse.</p>
      <p>Log in to your account to view and respond to the connection request.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #2c5530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
      </div>
      <p>Best regards,<br>The DeenVerse Team</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

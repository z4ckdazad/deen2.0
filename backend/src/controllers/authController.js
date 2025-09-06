import User from '../models/User.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';
import crypto from 'crypto';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         fullName:
 *           type: string
 *           example: "Ahmed Hassan"
 *         email:
 *           type: string
 *           format: email
 *           example: "ahmed@example.com"
 *         role:
 *           type: string
 *           enum: [student, imaam, admin]
 *           example: "student"
 *         islamicProfile:
 *           type: string
 *           example: "student"
 *         bio:
 *           type: string
 *           example: "I am passionate about learning Islamic knowledge"
 *         profilePicture:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         isVerified:
 *           type: boolean
 *           example: false
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Register user
export const register = catchAsync(async (req, res, next) => {
  const { fullName, email, password, role, islamicProfile, bio } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    password,
    role,
    islamicProfile,
    bio
  });

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
      refreshToken
    }
  });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account has been deactivated', 401));
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
      refreshToken
    }
  });
});

// Logout user
export const logout = catchAsync(async (req, res, next) => {
  // In a more sophisticated setup, you might want to blacklist the token
  // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh token
export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401));
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

// Forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User with this email does not exist', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set token expire time (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  await user.save({ validateBeforeSave: false });

  // In a real application, you would send this via email
  // For now, we'll just return the token (remove this in production)
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: 'Password reset email sent',
    // Remove this in production
    resetUrl
  });
});

// Reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new AppError('Token and password are required', 400));
  }

  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user by token and check if token is not expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  // Generate new token
  const newToken = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: {
      token: newToken
    }
  });
});

// Verify email
export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Verification token is required', 400));
  }

  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user by token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  // Verify user
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Resend verification email
export const resendVerification = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (user.isVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to emailVerificationToken field
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set token expire time (24 hours)
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  
  await user.save({ validateBeforeSave: false });

  // In a real application, you would send this via email
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

  res.status(200).json({
    success: true,
    message: 'Verification email sent',
    // Remove this in production
    verificationUrl
  });
});

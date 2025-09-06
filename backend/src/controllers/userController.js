import User from '../models/User.js';
import Connection from '../models/Connection.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Get current user profile
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// Update current user profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const allowedUpdates = [
    'fullName', 'bio', 'islamicProfile', 'specializations', 
    'experience', 'location', 'socialLinks'
  ];
  
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// Upload profile picture
export const uploadProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'profile-pictures',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    });

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: result.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: result.secure_url
      }
    });
  } catch (error) {
    return next(new AppError('Failed to upload profile picture', 500));
  }
});

// Delete current user account
export const deleteProfile = catchAsync(async (req, res, next) => {
  // Soft delete - deactivate account instead of removing
  await User.findByIdAndUpdate(req.user._id, {
    isActive: false,
    email: `deleted_${Date.now()}_${req.user.email}`
  });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// Get user by ID
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!user.isActive) {
    return next(new AppError('User account is deactivated', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Get all users with pagination and filtering
export const getUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { isActive: true };
  
  if (req.query.role) {
    filter.role = req.query.role;
  }
  
  if (req.query.islamicProfile) {
    filter.islamicProfile = req.query.islamicProfile;
  }
  
  if (req.query.search) {
    filter.$or = [
      { fullName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Follow a user
export const followUser = catchAsync(async (req, res, next) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  // Check if trying to follow self
  if (targetUserId === currentUserId.toString()) {
    return next(new AppError('Cannot follow yourself', 400));
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser || !targetUser.isActive) {
    return next(new AppError('User not found', 404));
  }

  // Check if already following
  const existingConnection = await Connection.findOne({
    $or: [
      { requester: currentUserId, recipient: targetUserId },
      { requester: targetUserId, recipient: currentUserId }
    ]
  });

  if (existingConnection) {
    if (existingConnection.status === 'accepted') {
      return next(new AppError('Already following this user', 400));
    } else if (existingConnection.status === 'pending') {
      return next(new AppError('Connection request already pending', 400));
    }
  }

  // Create connection request
  const connection = await Connection.create({
    requester: currentUserId,
    recipient: targetUserId,
    type: 'peer',
    status: 'pending'
  });

  // Populate the connection
  await connection.populate([
    { path: 'requester', select: 'fullName profilePicture role' },
    { path: 'recipient', select: 'fullName profilePicture role' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Follow request sent successfully',
    data: connection
  });
});

// Unfollow a user
export const unfollowUser = catchAsync(async (req, res, next) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  // Find and remove connection
  const connection = await Connection.findOneAndDelete({
    $or: [
      { requester: currentUserId, recipient: targetUserId, status: 'accepted' },
      { requester: targetUserId, recipient: currentUserId, status: 'accepted' }
    ]
  });

  if (!connection) {
    return next(new AppError('Not following this user', 404));
  }

  // Update user connections count
  await User.findByIdAndUpdate(currentUserId, {
    $inc: { 'connectionsCount': -1 }
  });
  
  await User.findByIdAndUpdate(targetUserId, {
    $inc: { 'connectionsCount': -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Unfollowed successfully'
  });
});

// Get user's followers
export const getFollowers = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    return next(new AppError('User not found', 404));
  }

  const connections = await Connection.find({
    recipient: userId,
    status: 'accepted'
  })
  .populate('requester', 'fullName profilePicture role islamicProfile')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

  const total = await Connection.countDocuments({
    recipient: userId,
    status: 'accepted'
  });

  const followers = connections.map(conn => conn.requester);

  res.status(200).json({
    success: true,
    data: {
      followers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFollowers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get users that this user is following
export const getFollowing = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    return next(new AppError('User not found', 404));
  }

  const connections = await Connection.find({
    requester: userId,
    status: 'accepted'
  })
  .populate('recipient', 'fullName profilePicture role islamicProfile')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

  const total = await Connection.countDocuments({
    requester: userId,
    status: 'accepted'
  });

  const following = connections.map(conn => conn.recipient);

  res.status(200).json({
    success: true,
    data: {
      following,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFollowing: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Notification from '../models/Notification.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Imaam:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         fullName:
 *           type: string
 *           example: "Imam Abdullah Rahman"
 *         email:
 *           type: string
 *           format: email
 *           example: "abdullah@deenverse.com"
 *         islamicProfile:
 *           type: string
 *           example: "Hafiz & Mufti"
 *         specializations:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Quran Recitation", "Islamic Law"]
 *         studentsCount:
 *           type: number
 *           example: 45
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *               example: 4.9
 *             count:
 *               type: number
 *               example: 23
 *         experience:
 *           type: number
 *           example: 10
 *         profilePicture:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         bio:
 *           type: string
 *           example: "Experienced Islamic teacher with 10 years of experience"
 *         location:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *               example: "Pakistan"
 *             city:
 *               type: string
 *               example: "Karachi"
 *         socialLinks:
 *           type: object
 *           properties:
 *             website:
 *               type: string
 *               example: "https://example.com"
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: number
 *           example: 1
 *         totalPages:
 *           type: number
 *           example: 5
 *         totalItems:
 *           type: number
 *           example: 50
 *         hasNext:
 *           type: boolean
 *           example: true
 *         hasPrev:
 *           type: boolean
 *           example: false
 */

// Get list of all verified Imaam
export const getImaamList = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || 'rating';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Build sort object
  let sort = {};
  switch (sortBy) {
    case 'name':
      sort = { fullName: sortOrder };
      break;
    case 'rating':
      sort = { 'rating.average': sortOrder, 'rating.count': sortOrder };
      break;
    case 'students':
      sort = { studentsCount: sortOrder };
      break;
    case 'experience':
      sort = { experience: sortOrder };
      break;
    default:
      sort = { 'rating.average': -1, 'rating.count': -1 };
  }

  const imaam = await User.find({
    role: 'imaam',
    isVerified: true,
    isActive: true
  })
  .select('-password -email')
  .sort(sort)
  .skip(skip)
  .limit(limit);

  const total = await User.countDocuments({
    role: 'imaam',
    isVerified: true,
    isActive: true
  });

  res.status(200).json({
    success: true,
    data: {
      imaam,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get featured Imaam
export const getFeaturedImaam = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;

  const featuredImaam = await User.find({
    role: 'imaam',
    isVerified: true,
    isActive: true,
    'rating.average': { $gte: 4.5 },
    'rating.count': { $gte: 5 }
  })
  .select('-password -email')
  .sort({ 'rating.average': -1, studentsCount: -1 })
  .limit(limit);

  res.status(200).json({
    success: true,
    data: featuredImaam
  });
});

// Search Imaam
export const searchImaam = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const searchQuery = {
    role: 'imaam',
    isVerified: true,
    isActive: true,
    $or: [
      { fullName: { $regex: q, $options: 'i' } },
      { specializations: { $in: [new RegExp(q, 'i')] } },
      { islamicProfile: { $regex: q, $options: 'i' } },
      { bio: { $regex: q, $options: 'i' } }
    ]
  };

  const imaam = await User.find(searchQuery)
    .select('-password -email')
    .sort({ 'rating.average': -1, studentsCount: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    data: {
      imaam,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get Imaam by specialization
export const getImaamBySpecialization = catchAsync(async (req, res, next) => {
  const { specialization } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const imaam = await User.find({
    role: 'imaam',
    isVerified: true,
    isActive: true,
    specializations: { $in: [new RegExp(specialization, 'i')] }
  })
  .select('-password -email')
  .sort({ 'rating.average': -1, studentsCount: -1 })
  .skip(skip)
  .limit(limit);

  const total = await User.countDocuments({
    role: 'imaam',
    isVerified: true,
    isActive: true,
    specializations: { $in: [new RegExp(specialization, 'i')] }
  });

  res.status(200).json({
    success: true,
    data: {
      imaam,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get Imaam by ID
export const getImaamById = catchAsync(async (req, res, next) => {
  const imaam = await User.findOne({
    _id: req.params.id,
    role: 'imaam',
    isActive: true
  }).select('-password');

  if (!imaam) {
    return next(new AppError('Imaam not found', 404));
  }

  // Check if current user is connected to this Imaam
  let isConnected = false;
  if (req.user) {
    const connection = await Connection.areConnected(req.user._id, imaam._id);
    isConnected = !!connection;
  }

  res.status(200).json({
    success: true,
    data: {
      ...imaam.toObject(),
      isConnected
    }
  });
});

// Request connection with Imaam
export const requestConnection = catchAsync(async (req, res, next) => {
  const imaamId = req.params.id;
  const studentId = req.user._id;
  const { message } = req.body;

  // Check if trying to connect to self
  if (imaamId === studentId.toString()) {
    return next(new AppError('Cannot connect to yourself', 400));
  }

  // Check if Imaam exists and is verified
  const imaam = await User.findOne({
    _id: imaamId,
    role: 'imaam',
    isVerified: true,
    isActive: true
  });

  if (!imaam) {
    return next(new AppError('Imaam not found or not verified', 404));
  }

  // Check if already connected or request pending
  const existingConnection = await Connection.getConnection(studentId, imaamId);
  
  if (existingConnection) {
    if (existingConnection.status === 'accepted') {
      return next(new AppError('Already connected to this Imaam', 400));
    } else if (existingConnection.status === 'pending') {
      return next(new AppError('Connection request already pending', 400));
    }
  }

  // Create connection request
  const connection = await Connection.create({
    requester: studentId,
    recipient: imaamId,
    type: 'student-teacher',
    message: message || '',
    status: 'pending'
  });

  // Create notification for Imaam
  await Notification.createNotification({
    recipient: imaamId,
    sender: studentId,
    type: 'connection_request',
    title: 'New Connection Request',
    message: `${req.user.fullName} wants to connect with you`,
    relatedEntity: connection._id,
    relatedEntityType: 'connection',
    actionData: {
      connectionId: connection._id,
      requesterName: req.user.fullName
    }
  });

  // Populate the connection
  await connection.populate([
    { path: 'requester', select: 'fullName profilePicture role' },
    { path: 'recipient', select: 'fullName profilePicture role' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Connection request sent successfully',
    data: connection
  });
});

// Get connection requests (for Imaam)
export const getConnectionRequests = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const requests = await Connection.getPendingConnections(req.user._id, page, limit);

  res.status(200).json({
    success: true,
    data: requests
  });
});

// Accept connection request
export const acceptConnection = catchAsync(async (req, res, next) => {
  const { connectionId } = req.params;

  const connection = await Connection.findOne({
    _id: connectionId,
    recipient: req.user._id,
    status: 'pending'
  });

  if (!connection) {
    return next(new AppError('Connection request not found', 404));
  }

  // Accept the connection
  await connection.accept();

  // Update user connections count
  await User.findByIdAndUpdate(connection.requester, {
    $inc: { 'connectionsCount': 1 }
  });
  
  await User.findByIdAndUpdate(connection.recipient, {
    $inc: { 'connectionsCount': 1 }
  });

  // Create notification for student
  await Notification.createNotification({
    recipient: connection.requester,
    sender: connection.recipient,
    type: 'connection_accepted',
    title: 'Connection Accepted',
    message: `${req.user.fullName} accepted your connection request`,
    relatedEntity: connection._id,
    relatedEntityType: 'connection',
    actionData: {
      connectionId: connection._id,
      imaamName: req.user.fullName
    }
  });

  // Populate the connection
  await connection.populate([
    { path: 'requester', select: 'fullName profilePicture role' },
    { path: 'recipient', select: 'fullName profilePicture role' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Connection request accepted successfully',
    data: connection
  });
});

// Reject connection request
export const rejectConnection = catchAsync(async (req, res, next) => {
  const { connectionId } = req.params;

  const connection = await Connection.findOne({
    _id: connectionId,
    recipient: req.user._id,
    status: 'pending'
  });

  if (!connection) {
    return next(new AppError('Connection request not found', 404));
  }

  // Reject the connection
  await connection.reject();

  res.status(200).json({
    success: true,
    message: 'Connection request rejected successfully'
  });
});

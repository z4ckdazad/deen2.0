import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  // The user who initiated the connection request
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  // The user who receives the connection request
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  // Connection status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  // Connection type
  type: {
    type: String,
    enum: ['student-teacher', 'peer', 'mentor-mentee'],
    required: true
  },
  // Message sent with the connection request
  message: {
    type: String,
    maxlength: [200, 'Message cannot exceed 200 characters'],
    trim: true
  },
  // When the connection was accepted
  acceptedAt: {
    type: Date,
    default: null
  },
  // When the connection was last updated
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ recipient: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to prevent self-connection
connectionSchema.pre('save', function(next) {
  if (this.requester.toString() === this.recipient.toString()) {
    const error = new Error('Cannot connect to yourself');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

// Post-save middleware to update user connections count
connectionSchema.post('save', async function() {
  if (this.isNew && this.status === 'accepted') {
    const User = mongoose.model('User');
    
    // Update connections count for both users
    await User.findByIdAndUpdate(this.requester, {
      $inc: { 'connectionsCount': 1 }
    });
    
    await User.findByIdAndUpdate(this.recipient, {
      $inc: { 'connectionsCount': 1 }
    });
  }
});

// Static method to get user connections
connectionSchema.statics.getUserConnections = function(userId, status = 'accepted', page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { requester: userId, status },
      { recipient: userId, status }
    ]
  })
  .populate('requester', 'fullName profilePicture role islamicProfile')
  .populate('recipient', 'fullName profilePicture role islamicProfile')
  .sort({ lastInteraction: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get pending connections for a user
connectionSchema.statics.getPendingConnections = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    recipient: userId,
    status: 'pending'
  })
  .populate('requester', 'fullName profilePicture role islamicProfile bio')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to check if users are connected
connectionSchema.statics.areConnected = function(userId1, userId2) {
  return this.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'accepted' },
      { requester: userId2, recipient: userId1, status: 'accepted' }
    ]
  });
};

// Static method to get connection between two users
connectionSchema.statics.getConnection = function(userId1, userId2) {
  return this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 }
    ]
  });
};

// Instance method to accept connection
connectionSchema.methods.accept = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  this.lastInteraction = new Date();
  return this.save();
};

// Instance method to reject connection
connectionSchema.methods.reject = function() {
  this.status = 'rejected';
  this.lastInteraction = new Date();
  return this.save();
};

// Instance method to block connection
connectionSchema.methods.block = function() {
  this.status = 'blocked';
  this.lastInteraction = new Date();
  return this.save();
};

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;

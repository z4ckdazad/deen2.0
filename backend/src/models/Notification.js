import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // System notifications don't have a sender
  },
  type: {
    type: String,
    enum: [
      'connection_request',
      'connection_accepted',
      'post_like',
      'post_comment',
      'comment_like',
      'new_follower',
      'lesson_reminder',
      'system_announcement',
      'message_received'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [300, 'Message cannot exceed 300 characters']
  },
  // Reference to related entity (post, comment, user, etc.)
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  relatedEntityType: {
    type: String,
    enum: ['post', 'comment', 'user', 'connection', 'lesson'],
    required: false
  },
  // Notification status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  // Notification priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Action data for frontend
  actionData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, page = 1, limit = 20, unreadOnly = false) {
  const skip = (page - 1) * limit;
  const query = { recipient: userId };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  return this.find(query)
    .populate('sender', 'fullName profilePicture role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  return this.create({
    recipient: data.recipient,
    sender: data.sender || null,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedEntity: data.relatedEntity || null,
    relatedEntityType: data.relatedEntityType || null,
    priority: data.priority || 'medium',
    actionData: data.actionData || {}
  });
};

// Static method to create system notification
notificationSchema.statics.createSystemNotification = function(recipients, data) {
  const notifications = recipients.map(recipientId => ({
    recipient: recipientId,
    type: data.type,
    title: data.title,
    message: data.message,
    priority: data.priority || 'medium',
    actionData: data.actionData || {}
  }));
  
  return this.insertMany(notifications);
};

// Pre-save middleware to set priority based on type
notificationSchema.pre('save', function(next) {
  if (this.isNew) {
    const priorityMap = {
      'connection_request': 'medium',
      'connection_accepted': 'medium',
      'post_like': 'low',
      'post_comment': 'medium',
      'comment_like': 'low',
      'new_follower': 'low',
      'lesson_reminder': 'high',
      'system_announcement': 'high',
      'message_received': 'high'
    };
    
    if (!this.priority || this.priority === 'medium') {
      this.priority = priorityMap[this.type] || 'medium';
    }
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

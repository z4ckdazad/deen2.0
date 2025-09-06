import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post reference is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [500, 'Comment content cannot exceed 500 characters'],
    trim: true
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  // For nested comments (replies)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  repliesCount: {
    type: Number,
    default: 0
  },
  // Comment status
  status: {
    type: String,
    enum: ['published', 'hidden', 'deleted'],
    default: 'published'
  },
  // Mentioned users
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ status: 1 });

// Virtual for time ago
commentSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to update counts
commentSchema.pre('save', function(next) {
  this.likesCount = this.likes.length;
  next();
});

// Post-save middleware to update post comments count
commentSchema.post('save', async function() {
  if (this.isNew) {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(this.post, {
      $inc: { commentsCount: 1 }
    });
  }
});

// Post-remove middleware to update post comments count
commentSchema.post('remove', async function() {
  const Post = mongoose.model('Post');
  await Post.findByIdAndUpdate(this.post, {
    $inc: { commentsCount: -1 }
  });
});

// Instance method to add like
commentSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    // Remove like if already exists
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  } else {
    // Add like
    this.likes.push({ user: userId });
  }
  
  this.likesCount = this.likes.length;
  return this.save();
};

// Instance method to check if user liked the comment
commentSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Static method to get comments for a post
commentSchema.statics.getPostComments = function(postId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    post: postId,
    parentComment: null, // Only top-level comments
    status: 'published'
  })
  .populate('author', 'fullName profilePicture role islamicProfile')
  .populate({
    path: 'replies',
    populate: {
      path: 'author',
      select: 'fullName profilePicture role islamicProfile'
    },
    options: { sort: { createdAt: 1 } }
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get comment replies
commentSchema.statics.getCommentReplies = function(commentId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    parentComment: commentId,
    status: 'published'
  })
  .populate('author', 'fullName profilePicture role islamicProfile')
  .sort({ createdAt: 1 })
  .skip(skip)
  .limit(limit);
};

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;

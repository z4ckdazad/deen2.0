import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    trim: true
  },
  images: [{
    type: String, // URLs to uploaded images
    required: false
  }],
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
  commentsCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  // Post categories/tags
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Post type
  type: {
    type: String,
    enum: ['general', 'question', 'announcement', 'lesson', 'inspiration'],
    default: 'general'
  },
  // For lesson posts
  lessonInfo: {
    title: String,
    duration: Number, // in minutes
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    topics: [String]
  },
  // Post visibility
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  // Post status
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published'
  },
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  // Featured posts
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Pinned posts
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isFeatured: 1, createdAt: -1 });
postSchema.index({ likesCount: -1, createdAt: -1 });

// Virtual for formatted content
postSchema.virtual('formattedContent').get(function() {
  // Basic formatting for mentions and hashtags
  return this.content
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
});

// Virtual for time ago
postSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to update counts
postSchema.pre('save', function(next) {
  this.likesCount = this.likes.length;
  next();
});

// Instance method to add like
postSchema.methods.addLike = function(userId) {
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

// Instance method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Static method to get feed posts
postSchema.statics.getFeedPosts = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    status: 'published',
    visibility: 'public'
  })
  .populate('author', 'fullName profilePicture role islamicProfile')
  .sort({ isPinned: -1, createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get posts by user
postSchema.statics.getUserPosts = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ 
    author: userId,
    status: 'published'
  })
  .populate('author', 'fullName profilePicture role islamicProfile')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to search posts
postSchema.statics.searchPosts = function(query, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
      { 'lessonInfo.title': { $regex: query, $options: 'i' } }
    ],
    status: 'published'
  })
  .populate('author', 'fullName profilePicture role islamicProfile')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

const Post = mongoose.model('Post', postSchema);

export default Post;

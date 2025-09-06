import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             fullName:
 *               type: string
 *               example: "Imam Abdullah"
 *             profilePicture:
 *               type: string
 *             role:
 *               type: string
 *               example: "imaam"
 *             islamicProfile:
 *               type: string
 *               example: "Hafiz & Mufti"
 *         content:
 *           type: string
 *           example: "Alhamdulillah! Excited to share that our Quran recitation class has reached 50 students."
 *         type:
 *           type: string
 *           enum: [general, question, announcement, lesson, inspiration]
 *           example: "general"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["quran", "learning", "community"]
 *         likesCount:
 *           type: number
 *           example: 24
 *         commentsCount:
 *           type: number
 *           example: 8
 *         sharesCount:
 *           type: number
 *           example: 3
 *         visibility:
 *           type: string
 *           enum: [public, followers, private]
 *           example: "public"
 *         status:
 *           type: string
 *           enum: [published, draft, archived]
 *           example: "published"
 *         isLiked:
 *           type: boolean
 *           example: false
 *         timeAgo:
 *           type: string
 *           example: "2 hours ago"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Create a new post
export const createPost = catchAsync(async (req, res, next) => {
  const { content, type, tags, visibility, lessonInfo } = req.body;

  const post = await Post.create({
    author: req.user._id,
    content,
    type,
    tags,
    visibility,
    lessonInfo
  });

  // Populate author information
  await post.populate('author', 'fullName profilePicture role islamicProfile');

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: post
  });
});

// Get all posts with pagination
export const getPosts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { status: 'published' };
  
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  if (req.query.author) {
    filter.author = req.query.author;
  }

  const posts = await Post.find(filter)
    .populate('author', 'fullName profilePicture role islamicProfile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Add like status for current user
  const postsWithLikeStatus = posts.map(post => {
    const postObj = post.toObject();
    postObj.isLiked = post.isLikedBy(req.user._id);
    return postObj;
  });

  const total = await Post.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// Get personalized feed
export const getFeed = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Get posts from followed users and public posts
  const posts = await Post.getFeedPosts(req.user._id, page, limit);

  // Add like status for current user
  const postsWithLikeStatus = posts.map(post => {
    const postObj = post.toObject();
    postObj.isLiked = post.isLikedBy(req.user._id);
    return postObj;
  });

  res.status(200).json({
    success: true,
    data: {
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(posts.length / limit),
        hasNext: posts.length === limit,
        hasPrev: page > 1
      }
    }
  });
});

// Search posts
export const searchPosts = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const posts = await Post.searchPosts(q, page, limit);

  // Add like status for current user
  const postsWithLikeStatus = posts.map(post => {
    const postObj = post.toObject();
    postObj.isLiked = post.isLikedBy(req.user._id);
    return postObj;
  });

  res.status(200).json({
    success: true,
    data: {
      posts: postsWithLikeStatus,
      query: q
    }
  });
});

// Get posts by specific user
export const getUserPosts = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    return next(new AppError('User not found', 404));
  }

  const posts = await Post.getUserPosts(userId, page, limit);

  // Add like status for current user
  const postsWithLikeStatus = posts.map(post => {
    const postObj = post.toObject();
    postObj.isLiked = post.isLikedBy(req.user._id);
    return postObj;
  });

  res.status(200).json({
    success: true,
    data: {
      posts: postsWithLikeStatus,
      user: {
        _id: user._id,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        role: user.role,
        islamicProfile: user.islamicProfile
      }
    }
  });
});

// Get post by ID
export const getPostById = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'fullName profilePicture role islamicProfile');

  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.status !== 'published') {
    return next(new AppError('Post not found', 404));
  }

  // Increment view count
  post.views += 1;
  await post.save();

  // Add like status for current user
  const postObj = post.toObject();
  postObj.isLiked = post.isLikedBy(req.user._id);

  res.status(200).json({
    success: true,
    data: postObj
  });
});

// Update post
export const updatePost = catchAsync(async (req, res, next) => {
  const { content, type, tags, visibility, lessonInfo } = req.body;

  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  // Update fields
  if (content !== undefined) post.content = content;
  if (type !== undefined) post.type = type;
  if (tags !== undefined) post.tags = tags;
  if (visibility !== undefined) post.visibility = visibility;
  if (lessonInfo !== undefined) post.lessonInfo = lessonInfo;

  await post.save();

  // Populate author information
  await post.populate('author', 'fullName profilePicture role islamicProfile');

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: post
  });
});

// Delete post
export const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});

// Like a post
export const likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.status !== 'published') {
    return next(new AppError('Post not found', 404));
  }

  // Add like
  await post.addLike(req.user._id);

  // Create notification for post author (if not liking own post)
  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'post_like',
      title: 'Post Liked',
      message: `${req.user.fullName} liked your post`,
      relatedEntity: post._id,
      relatedEntityType: 'post',
      actionData: {
        postId: post._id,
        likerName: req.user.fullName
      }
    });
  }

  // Populate author information
  await post.populate('author', 'fullName profilePicture role islamicProfile');

  // Add like status
  const postObj = post.toObject();
  postObj.isLiked = post.isLikedBy(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Post liked successfully',
    data: postObj
  });
});

// Unlike a post
export const unlikePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.status !== 'published') {
    return next(new AppError('Post not found', 404));
  }

  // Remove like
  await post.addLike(req.user._id); // This toggles the like

  // Populate author information
  await post.populate('author', 'fullName profilePicture role islamicProfile');

  // Add like status
  const postObj = post.toObject();
  postObj.isLiked = post.isLikedBy(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Post unliked successfully',
    data: postObj
  });
});

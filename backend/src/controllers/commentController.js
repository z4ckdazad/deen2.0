import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { AppError, catchAsync } from '../middleware/errorHandler.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         post:
 *           type: string
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             fullName:
 *               type: string
 *               example: "Sister Fatima"
 *             profilePicture:
 *               type: string
 *             role:
 *               type: string
 *               example: "student"
 *             islamicProfile:
 *               type: string
 *               example: "student"
 *         content:
 *           type: string
 *           example: "MashaAllah! May Allah bless your efforts."
 *         likesCount:
 *           type: number
 *           example: 5
 *         repliesCount:
 *           type: number
 *           example: 2
 *         parentComment:
 *           type: string
 *           example: "60f7b3b3b3b3b3b3b3b3b3b4"
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         isLiked:
 *           type: boolean
 *           example: false
 *         timeAgo:
 *           type: string
 *           example: "1 hour ago"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Create a new comment
export const createComment = catchAsync(async (req, res, next) => {
  const { post, content, parentComment } = req.body;

  // Check if post exists
  const postExists = await Post.findById(post);
  if (!postExists) {
    return next(new AppError('Post not found', 404));
  }

  if (postExists.status !== 'published') {
    return next(new AppError('Post not found', 404));
  }

  // If this is a reply, check if parent comment exists
  if (parentComment) {
    const parentExists = await Comment.findById(parentComment);
    if (!parentExists) {
      return next(new AppError('Parent comment not found', 404));
    }
  }

  const comment = await Comment.create({
    post,
    author: req.user._id,
    content,
    parentComment: parentComment || null
  });

  // Populate author information
  await comment.populate('author', 'fullName profilePicture role islamicProfile');

  // Create notification for post author (if not commenting on own post)
  if (postExists.author.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: postExists.author,
      sender: req.user._id,
      type: 'post_comment',
      title: 'New Comment',
      message: `${req.user.fullName} commented on your post`,
      relatedEntity: post,
      relatedEntityType: 'post',
      actionData: {
        postId: post,
        commentId: comment._id,
        commenterName: req.user.fullName
      }
    });
  }

  // If this is a reply, create notification for parent comment author
  if (parentComment) {
    const parentCommentDoc = await Comment.findById(parentComment);
    if (parentCommentDoc && parentCommentDoc.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: parentCommentDoc.author,
        sender: req.user._id,
        type: 'comment_like', // We can create a new type for replies
        title: 'New Reply',
        message: `${req.user.fullName} replied to your comment`,
        relatedEntity: parentComment,
        relatedEntityType: 'comment',
        actionData: {
          commentId: parentComment,
          replyId: comment._id,
          replierName: req.user.fullName
        }
      });
    }
  }

  res.status(201).json({
    success: true,
    message: 'Comment created successfully',
    data: comment
  });
});

// Get comments for a specific post
export const getComments = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const comments = await Comment.getPostComments(postId, page, limit);

  // Add like status for current user
  const commentsWithLikeStatus = comments.map(comment => {
    const commentObj = comment.toObject();
    commentObj.isLiked = comment.isLikedBy(req.user._id);
    
    // Add like status for replies
    if (commentObj.replies) {
      commentObj.replies = commentObj.replies.map(reply => {
        const replyObj = reply.toObject();
        replyObj.isLiked = reply.isLikedBy(req.user._id);
        return replyObj;
      });
    }
    
    return commentObj;
  });

  res.status(200).json({
    success: true,
    data: commentsWithLikeStatus
  });
});

// Get replies for a specific comment
export const getCommentReplies = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Check if comment exists
  const comment = await Comment.findById(id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  const replies = await Comment.getCommentReplies(id, page, limit);

  // Add like status for current user
  const repliesWithLikeStatus = replies.map(reply => {
    const replyObj = reply.toObject();
    replyObj.isLiked = reply.isLikedBy(req.user._id);
    return replyObj;
  });

  res.status(200).json({
    success: true,
    data: repliesWithLikeStatus
  });
});

// Get comment by ID
export const getCommentById = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id)
    .populate('author', 'fullName profilePicture role islamicProfile')
    .populate('post', 'content author');

  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.status !== 'published') {
    return next(new AppError('Comment not found', 404));
  }

  // Add like status for current user
  const commentObj = comment.toObject();
  commentObj.isLiked = comment.isLikedBy(req.user._id);

  res.status(200).json({
    success: true,
    data: commentObj
  });
});

// Update comment
export const updateComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.status !== 'published') {
    return next(new AppError('Comment not found', 404));
  }

  comment.content = content;
  await comment.save();

  // Populate author information
  await comment.populate('author', 'fullName profilePicture role islamicProfile');

  // Add like status
  const commentObj = comment.toObject();
  commentObj.isLiked = comment.isLikedBy(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    data: commentObj
  });
});

// Delete comment
export const deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  // Soft delete - mark as deleted instead of removing
  comment.status = 'deleted';
  await comment.save();

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

// Like a comment
export const likeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.status !== 'published') {
    return next(new AppError('Comment not found', 404));
  }

  // Add like
  await comment.addLike(req.user._id);

  // Create notification for comment author (if not liking own comment)
  if (comment.author.toString() !== req.user._id.toString()) {
    await Notification.createNotification({
      recipient: comment.author,
      sender: req.user._id,
      type: 'comment_like',
      title: 'Comment Liked',
      message: `${req.user.fullName} liked your comment`,
      relatedEntity: comment._id,
      relatedEntityType: 'comment',
      actionData: {
        commentId: comment._id,
        likerName: req.user.fullName
      }
    });
  }

  // Populate author information
  await comment.populate('author', 'fullName profilePicture role islamicProfile');

  // Add like status
  const commentObj = comment.toObject();
  commentObj.isLiked = comment.isLikedBy(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Comment liked successfully',
    data: commentObj
  });
});

// Unlike a comment
export const unlikeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.status !== 'published') {
    return next(new AppError('Comment not found', 404));
  }

  // Remove like
  await comment.addLike(req.user._id); // This toggles the like

  // Populate author information
  await comment.populate('author', 'fullName profilePicture role islamicProfile');

  // Add like status
  const commentObj = comment.toObject();
  commentObj.isLiked = comment.isLikedBy(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Comment unliked successfully',
    data: commentObj
  });
});

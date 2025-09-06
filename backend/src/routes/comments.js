import express from 'express';
import { 
  createComment, 
  getComments, 
  getCommentById, 
  updateComment, 
  deleteComment, 
  likeComment, 
  unlikeComment,
  getCommentReplies
} from '../controllers/commentController.js';
import { protect, checkResourceAccess } from '../middleware/auth.js';
import { validate, validationSchemas } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Post comments management
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post
 *               - content
 *             properties:
 *               post:
 *                 type: string
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *               content:
 *                 type: string
 *                 maxLength: 500
 *                 example: "MashaAllah! May Allah bless your efforts."
 *               parentComment:
 *                 type: string
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b4"
 *                 description: "ID of parent comment for replies"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comment created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, validate(validationSchemas.createComment), createComment);

/**
 * @swagger
 * /api/comments/post/{postId}:
 *   get:
 *     summary: Get comments for a specific post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.get('/post/:postId', protect, getComments);

/**
 * @swagger
 * /api/comments/{id}/replies:
 *   get:
 *     summary: Get replies for a specific comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of replies per page
 *     responses:
 *       200:
 *         description: Comment replies retrieved successfully
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/replies', protect, getCommentReplies);

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', protect, getCommentById);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Updated comment content"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Access denied - can only update your own comments
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', protect, checkResourceAccess('author'), validate(validationSchemas.createComment), updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Access denied - can only delete your own comments
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', protect, checkResourceAccess('author'), deleteComment);

/**
 * @swagger
 * /api/comments/{id}/like:
 *   post:
 *     summary: Like a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment liked successfully
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/like', protect, likeComment);

/**
 * @swagger
 * /api/comments/{id}/unlike:
 *   delete:
 *     summary: Unlike a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment unliked successfully
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/unlike', protect, unlikeComment);

export default router;

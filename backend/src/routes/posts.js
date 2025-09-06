import express from 'express';
import { 
  createPost, 
  getPosts, 
  getPostById, 
  updatePost, 
  deletePost, 
  likePost, 
  unlikePost,
  getFeed,
  getUserPosts,
  searchPosts
} from '../controllers/postController.js';
import { protect, checkResourceAccess } from '../middleware/auth.js';
import { validate, validateQuery, validationSchemas } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Community posts and feed management
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
 *                 maxLength: 2000
 *                 example: "Alhamdulillah! Excited to share that our Quran recitation class has reached 50 students."
 *               type:
 *                 type: string
 *                 enum: [general, question, announcement, lesson, inspiration]
 *                 default: general
 *                 example: "general"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["quran", "learning", "community"]
 *               visibility:
 *                 type: string
 *                 enum: [public, followers, private]
 *                 default: public
 *                 example: "public"
 *               lessonInfo:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Introduction to Tajweed"
 *                   duration:
 *                     type: number
 *                     example: 60
 *                   difficulty:
 *                     type: string
 *                     enum: [beginner, intermediate, advanced]
 *                     example: "beginner"
 *                   topics:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["tajweed", "quran"]
 *     responses:
 *       201:
 *         description: Post created successfully
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
 *                   example: "Post created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, validate(validationSchemas.createPost), createPost);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of posts per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [general, question, announcement, lesson, inspiration]
 *         description: Filter by post type
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, validateQuery(validationSchemas.pagination), getPosts);

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get personalized feed for current user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/feed', protect, validateQuery(validationSchemas.pagination), getFeed);

/**
 * @swagger
 * /api/posts/search:
 *   get:
 *     summary: Search posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 */
router.get('/search', protect, validateQuery(validationSchemas.search), searchPosts);

/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Get posts by specific user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: User posts retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/user/:userId', protect, validateQuery(validationSchemas.pagination), getUserPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', protect, getPostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 2000
 *               type:
 *                 type: string
 *                 enum: [general, question, announcement, lesson, inspiration]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, followers, private]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Access denied - can only update your own posts
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', protect, checkResourceAccess('author'), validate(validationSchemas.createPost), updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Access denied - can only delete your own posts
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', protect, checkResourceAccess('author'), deletePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/like', protect, likePost);

/**
 * @swagger
 * /api/posts/{id}/unlike:
 *   delete:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/unlike', protect, unlikePost);

export default router;

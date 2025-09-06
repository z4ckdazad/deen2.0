import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  uploadProfilePicture,
  deleteProfile,
  getUserById,
  getUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from '../controllers/userController.js';
import { protect, authorize, checkResourceAccess } from '../middleware/auth.js';
import { validate, validateQuery, validationSchemas } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profiles
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', protect, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Ahmed Hassan"
 *               bio:
 *                 type: string
 *                 example: "Updated bio"
 *               islamicProfile:
 *                 type: string
 *                 example: "hafiz"
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Quran Recitation", "Arabic Language"]
 *               experience:
 *                 type: number
 *                 example: 5
 *               location:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "Pakistan"
 *                   city:
 *                     type: string
 *                     example: "Karachi"
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   website:
 *                     type: string
 *                     example: "https://example.com"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', protect, validate(validationSchemas.updateProfile), updateProfile);

/**
 * @swagger
 * /api/users/profile/picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/picture', protect, upload.single('profilePicture'), uploadProfilePicture);

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/profile', protect, deleteProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', protect, getUserById);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, imaam, admin]
 *         description: Filter by role
 *       - in: query
 *         name: islamicProfile
 *         schema:
 *           type: string
 *         description: Filter by Islamic profile
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, validateQuery(validationSchemas.pagination), getUsers);

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to follow
 *     responses:
 *       200:
 *         description: User followed successfully
 *       400:
 *         description: Cannot follow yourself or already following
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/follow', protect, followUser);

/**
 * @swagger
 * /api/users/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to unfollow
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       404:
 *         description: User not found or not following
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/unfollow', protect, unfollowUser);

/**
 * @swagger
 * /api/users/{id}/followers:
 *   get:
 *     summary: Get user's followers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Number of followers per page
 *     responses:
 *       200:
 *         description: Followers retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/followers', protect, validateQuery(validationSchemas.pagination), getFollowers);

/**
 * @swagger
 * /api/users/{id}/following:
 *   get:
 *     summary: Get users that this user is following
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Number of following per page
 *     responses:
 *       200:
 *         description: Following retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/following', protect, validateQuery(validationSchemas.pagination), getFollowing);

export default router;

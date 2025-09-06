import express from 'express';
import { 
  getImaamList, 
  getImaamById, 
  searchImaam, 
  getFeaturedImaam,
  getImaamBySpecialization,
  requestConnection,
  getConnectionRequests,
  acceptConnection,
  rejectConnection
} from '../controllers/imaamController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateQuery, validationSchemas } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Imaam
 *   description: Imaam directory and connections
 */

/**
 * @swagger
 * /api/imaam:
 *   get:
 *     summary: Get list of all verified Imaam
 *     tags: [Imaam]
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
 *         description: Number of Imaam per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, rating, students, experience]
 *           default: rating
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Imaam list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     imaam:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Imaam'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, validateQuery(validationSchemas.pagination), getImaamList);

/**
 * @swagger
 * /api/imaam/featured:
 *   get:
 *     summary: Get featured Imaam
 *     tags: [Imaam]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of featured Imaam to return
 *     responses:
 *       200:
 *         description: Featured Imaam retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/featured', protect, getFeaturedImaam);

/**
 * @swagger
 * /api/imaam/search:
 *   get:
 *     summary: Search Imaam by name or specialization
 *     tags: [Imaam]
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
router.get('/search', protect, validateQuery(validationSchemas.search), searchImaam);

/**
 * @swagger
 * /api/imaam/specialization/{specialization}:
 *   get:
 *     summary: Get Imaam by specialization
 *     tags: [Imaam]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: specialization
 *         required: true
 *         schema:
 *           type: string
 *         description: Specialization to filter by
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
 *         description: Number of Imaam per page
 *     responses:
 *       200:
 *         description: Imaam by specialization retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/specialization/:specialization', protect, validateQuery(validationSchemas.pagination), getImaamBySpecialization);

/**
 * @swagger
 * /api/imaam/{id}:
 *   get:
 *     summary: Get Imaam by ID
 *     tags: [Imaam]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Imaam ID
 *     responses:
 *       200:
 *         description: Imaam details retrieved successfully
 *       404:
 *         description: Imaam not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', protect, getImaamById);

/**
 * @swagger
 * /api/imaam/{id}/connect:
 *   post:
 *     summary: Request connection with Imaam
 *     tags: [Imaam]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Imaam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 200
 *                 example: "I would like to learn Quran recitation from you"
 *     responses:
 *       201:
 *         description: Connection request sent successfully
 *       400:
 *         description: Cannot connect to yourself or already connected
 *       404:
 *         description: Imaam not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/connect', protect, requestConnection);

/**
 * @swagger
 * /api/imaam/connections/requests:
 *   get:
 *     summary: Get pending connection requests (for Imaam)
 *     tags: [Imaam]
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
 *         description: Number of requests per page
 *     responses:
 *       200:
 *         description: Connection requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Imaam role required
 */
router.get('/connections/requests', protect, authorize('imaam'), validateQuery(validationSchemas.pagination), getConnectionRequests);

/**
 * @swagger
 * /api/imaam/connections/{connectionId}/accept:
 *   post:
 *     summary: Accept connection request (for Imaam)
 *     tags: [Imaam]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Connection request accepted successfully
 *       404:
 *         description: Connection request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Imaam role required
 */
router.post('/connections/:connectionId/accept', protect, authorize('imaam'), acceptConnection);

/**
 * @swagger
 * /api/imaam/connections/{connectionId}/reject:
 *   post:
 *     summary: Reject connection request (for Imaam)
 *     tags: [Imaam]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection ID
 *     responses:
 *       200:
 *         description: Connection request rejected successfully
 *       404:
 *         description: Connection request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Imaam role required
 */
router.post('/connections/:connectionId/reject', protect, authorize('imaam'), rejectConnection);

export default router;

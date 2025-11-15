const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMe, updateMe } = require('../controllers/userController');

/**
 * User Profile Routes
 * 
 * All routes require authentication (Bearer token in Authorization header).
 * Use auth middleware to verify JWT token before accessing endpoints.
 * 
 * Routes:
 *   - GET  /api/users/me  → Fetch current user's profile
 *   - PUT  /api/users/me  → Update current user's profile
 * 
 * Authentication:
 *   Header: Authorization: Bearer <JWT_TOKEN>
 *   Token obtained from: POST /api/auth/login or POST /api/auth/register
 */

/**
 * GET /api/users/me
 * 
 * Retrieves the authenticated user's complete profile.
 * Password field is excluded from response for security.
 * 
 * Response (200 OK):
 *   {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "username": "johndoe",
 *     "email": "john@example.com",
 *     "phone": "5551234567",
 *     "dob": "1990-01-15T00:00:00.000Z",
 *     "createdAt": "2024-01-01T12:00:00.000Z",
 *     "updatedAt": "2024-01-15T08:30:00.000Z"
 *   }
 * 
 * Response (401 Unauthorized): Invalid or missing token
 *   { "error": "Authentication required." }
 */
router.get('/me', auth, getMe);

/**
 * PUT /api/users/me
 * 
 * Updates the authenticated user's profile information.
 * All fields are optional. Omitted fields are not changed.
 * All fields are validated before saving.
 * Password cannot be updated through this endpoint.
 * 
 * Request body (all optional):
 *   {
 *     "email": "newemail@example.com",      // Email format validated
 *     "phone": "(555) 123-4567",            // Normalized to 5551234567
 *     "dob": "1990-01-15"                   // YYYY-MM-DD format, user must be 13+
 *   }
 * 
 * Response (200 OK): Updated user profile
 *   {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "username": "johndoe",
 *     "email": "newemail@example.com",
 *     "phone": "5551234567",
 *     "dob": "1990-01-15T00:00:00.000Z",
 *     "createdAt": "2024-01-01T12:00:00.000Z",
 *     "updatedAt": "2024-01-15T09:00:00.000Z"
 *   }
 * 
 * Response (400 Bad Request): Validation errors
 *   {
 *     "fieldErrors": {
 *       "email": "Please enter a valid email address.",
 *       "phone": "Phone number must be 7-15 digits."
 *     },
 *     "message": "Validation failed."
 *   }
 * 
 * Response (401 Unauthorized): Invalid or missing token
 *   { "error": "Invalid or expired token." }
 */
router.put('/me', auth, updateMe);

module.exports = router;

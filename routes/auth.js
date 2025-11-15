const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

/**
 * Authentication Routes
 * 
 * POST /api/auth/login
 *   - Authenticate user with username and password
 *   - Returns: { token, user }
 * 
 * POST /api/auth/register
 *   - Create new user account
 *   - Returns: { token, user } (auto-logs in user)
 */

router.post('/login', login);
router.post('/register', register);

module.exports = router;


const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Authentication Middleware
 * 
 * Protects API endpoints by verifying JWT tokens in Authorization header.
 * Must be used before accessing endpoints that require authentication.
 * 
 * How it works:
 *   1. Extracts token from "Authorization: Bearer <token>" header
 *   2. Verifies token signature using JWT_SECRET
 *   3. On success: Sets req.userId and req.username, calls next()
 *   4. On failure: Returns 401 Unauthorized with error message
 * 
 * Token Payload Structure (created by auth controller):
 *   - sub: User ID (MongoDB ObjectId)
 *   - username: User's username
 *   - iat: Issued at timestamp
 *   - exp: Expiration timestamp (24 hours from issue)
 * 
 * Expected Authorization Header:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Response (401 Unauthorized):
 *   - No token: "Authentication required."
 *   - Invalid token: "Invalid or expired token."
 * 
 * Usage in routes:
 *   router.get('/protected-endpoint', auth, (req, res) => {
 *     // req.userId and req.username are now available
 *     const userId = req.userId; // User ID from token
 *   });
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports = function (req, res, next) {
  // Extract Authorization header and parse Bearer token
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.*)$/i);
  const token = m ? m[1] : null;
  
  // Return 401 if no token provided
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  
  // Verify token and set user context
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;      // MongoDB User ID
    req.username = payload.username; // Username for logging/reference
    next();
  } catch (err) {
    // Token verification failed (invalid signature, expired, malformed)
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

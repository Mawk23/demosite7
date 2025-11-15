const User = require('../models/user.model');

/**
 * Email Validation Helper
 * 
 * Validates email format using simplified RFC 5322 pattern.
 * Checks for: username@domain.extension
 * Max length: 254 characters (RFC standard)
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} true if valid, false otherwise
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Phone Number Normalization Helper
 * 
 * Removes formatting characters (spaces, dashes, parentheses).
 * Preserves leading + for international format (E.164).
 * Example: "(555) 123-4567" → "5551234567"
 * Example: "+1 555 123 4567" → "+15551234567"
 * 
 * @param {string} phone - Phone number to normalize
 * @returns {string} Normalized phone number or empty string if invalid
 */
function normalizePhone(phone) {
  if (!phone) return '';
  // Remove formatting: spaces, dashes, parentheses
  const cleaned = phone.replace(/\s|-|\(|\)/g, '');
  // Match digits with optional leading + (E.164 format)
  const match = cleaned.match(/^\+?(\d+)$/);
  if (match) {
    return match[0]; // Return with + preserved if present
  }
  return '';
}

/**
 * Phone Validation Helper
 * 
 * Validates phone number has 7-15 digits (E.164 standard).
 * Allows optional leading + for international format.
 * Normalizes the phone before validation.
 * Optional field: empty phone is valid.
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} true if valid or empty, false if invalid
 */
function isValidPhone(phone) {
  if (!phone) return true; // Phone is optional
  const normalized = normalizePhone(phone);
  // E.164 format: + optional, then 7-15 digits
  return /^\+?[0-9]{7,15}$/.test(normalized);
}

/**
 * Date of Birth Validation Helper
 * 
 * Validates date of birth meets requirements:
 *   1. Valid date format
 *   2. Date is in the past (not future)
 *   3. User is at least 13 years old (COPPA compliance)
 * 
 * Calculates age by comparing birth year, month, and day.
 * Optional field: empty dob is valid.
 * 
 * @param {string} dob - Date of birth (ISO format: YYYY-MM-DD)
 * @returns {boolean} true if valid or empty, false if invalid
 */
function validateDOB(dob) {
  if (!dob) return true; // DOB is optional
  
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false; // Invalid date format
  
  const now = new Date();
  if (d > now) return false; // Can't be in the future
  
  // Calculate age in years
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
    age--;
  }
  
  return age >= 13; // Must be at least 13 years old
}

/**
 * Get Current User Profile
 * GET /api/users/me
 * 
 * Retrieves the authenticated user's full profile.
 * Requires: Authorization header with valid JWT token
 * Password field is excluded from response.
 * 
 * Response (200 OK):
 *   { _id, username, email, phone, dob, createdAt, updatedAt }
 * 
 * Response (404 Not Found): User no longer exists in database
 * 
 * @param {Object} req - Express request (req.userId set by authMiddleware)
 * @param {Object} res - Express response
 */
async function getMe(req, res) {
  const userId = req.userId;
  
  // Find user by ID, exclude password field
  const user = await User.findById(userId).select('-password').exec();
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  
  res.json(user);
}

/**
 * Update Current User Profile
 * PUT /api/users/me
 * 
 * Allows user to update their profile information.
 * Validates all input fields before updating.
 * Requires: Authorization header with valid JWT token
 * 
 * Request body (all optional):
 *   - email: Valid email address
 *   - phone: 7-15 digit phone number
 *   - dob: Date of birth (YYYY-MM-DD, must be 13+ years old)
 * 
 * Response (200 OK):
 *   Updated user object { _id, username, email, phone, dob, ... }
 * 
 * Response (400 Bad Request): Validation failed
 *   { fieldErrors: { email: "error message", ... }, message: "Validation failed." }
 * 
 * Response (404 Not Found): User no longer exists in database
 * 
 * @param {Object} req - Express request (req.userId set by authMiddleware)
 * @param {Object} res - Express response
 */
async function updateMe(req, res) {
  const userId = req.userId;
  const { email, phone, dob } = req.body || {};

  const updates = {};
  const fieldErrors = {};

  // Validate and process email update
  if (email !== undefined && email !== '') {
    if (!validateEmail(email)) {
      fieldErrors.email = 'Please enter a valid email address.';
    } else {
      // Store email in lowercase for consistency
      updates.email = email.toLowerCase();
    }
  }

  // Validate and process phone update
  if (phone !== undefined && phone !== '') {
    if (!isValidPhone(phone)) {
      fieldErrors.phone = 'Phone number must be 7-15 digits.';
    } else {
      // Normalize phone before storing
      updates.phone = normalizePhone(phone);
    }
  }

  // Validate and process date of birth update
  if (dob !== undefined && dob !== '') {
    if (!validateDOB(dob)) {
      fieldErrors.dob = 'Date of birth must be a valid date in the past, and you must be at least 13 years old.';
    } else {
      // Convert to Date object for MongoDB storage
      updates.dob = new Date(dob);
    }
  }

  // If any validation errors, return them all at once
  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({ fieldErrors, message: 'Validation failed.' });
  }

  // Update user document and return updated version (new: true)
  // Exclude password from response
  const user = await User.findByIdAndUpdate(userId, updates, { new: true })
    .select('-password')
    .exec();
  
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  
  res.json(user);
}

module.exports = { getMe, updateMe, validateEmail, validateDOB, isValidPhone, normalizePhone };

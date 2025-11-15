const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Login Handler
 * POST /api/auth/login
 * 
 * Authenticates a user by verifying username and password.
 * Password is securely compared using bcrypt.compare().
 * On success, returns a JWT token and user profile.
 * 
 * Request body:
 *   - username (string, required)
 *   - password (string, required)
 * 
 * Response (200 OK):
 *   { token: "jwt_token", user: { _id, username, email, phone, dob } }
 * 
 * Response (400 Bad Request): Missing username or password
 * Response (401 Unauthorized): Invalid credentials
 */
async function login(req, res) {
  const { username, password } = req.body || {};
  
  // Check that both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password.' });
  }

  // Find user in database by username
  const user = await User.findOne({ username }).exec();
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Securely verify password using bcrypt.compare()
  // Compares plain-text password with stored hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Generate JWT token (payload: user ID + username, expires in 4 hours)
  const token = jwt.sign(
    { sub: user._id.toString(), username: user.username },
    JWT_SECRET,
    { expiresIn: '4h' }
  );

  // Return token and user profile (password excluded)
  return res.json({
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      dob: user.dob
    }
  });
}

/**
 * Register Handler
 * POST /api/auth/register
 * 
 * Creates a new user account. Password is hashed with bcrypt (cost 12).
 * Username must be unique. On success, returns JWT token for immediate login.
 * 
 * Request body:
 *   - username (string, required): 3-30 chars, alphanumeric + underscore
 *   - password (string, required): Minimum 6 characters
 *   - email (string, optional): User's email address
 * 
 * Response (201 Created):
 *   { token: "jwt_token", user: { _id, username, email } }
 * 
 * Response (400 Bad Request): Invalid input (username format, password length)
 * Response (409 Conflict): Username already taken
 */
async function register(req, res) {
  const { username, password, email } = req.body || {};

  // Validate username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Validate username format: 3-30 alphanumeric chars and underscores
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return res.status(400).json({
      error: 'Username must be 3-30 characters, alphanumeric or underscore only.'
    });
  }

  // Validate password minimum length (6 characters)
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  // Check if username already exists (must be unique)
  const existing = await User.findOne({ username }).exec();
  if (existing) {
    return res.status(409).json({ error: 'Username already taken.' });
  }

  // Hash password using bcrypt with cost factor 12
  // Cost 12 = ~250ms per hash, resistant to brute-force attacks
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create new user document with hashed password
  const user = new User({
    username,
    password: hashedPassword,
    email: email || '' // Email optional, defaults to empty string
  });

  // Save user to MongoDB
  await user.save();

  // Generate JWT token for immediate login after registration
  const token = jwt.sign(
    { sub: user._id.toString(), username: user.username },
    JWT_SECRET,
    { expiresIn: '4h' }
  );

  // Return 201 (Created) with token and user profile
  return res.status(201).json({
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email
    }
  });
}

module.exports = { login, register };

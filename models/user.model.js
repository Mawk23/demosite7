const mongoose = require('mongoose');

/**
 * User Schema Definition
 * 
 * Defines the structure of User documents in MongoDB.
 * Enforces required fields and data types.
 * Automatically tracks document creation and modification times.
 * 
 * Fields:
 *   - username: Unique string identifier for login
 *     • Required: true
 *     • Unique: true (enforced by MongoDB unique index)
 *     • Usage: User's login credential
 *   
 *   - password: Hashed password (bcrypt hash)
 *     • Required: true
 *     • Stored: Always stored as bcrypt hash, never plain text
 *     • Never returned in API responses (excluded via .select('-password'))
 *     • Cost factor: bcrypt 12 (securely hashed)
 *   
 *   - email: User's email address
 *     • Required: true
 *     • Format: Validated by controller (RFC 5322 simplified)
 *     • Max length: 254 characters (RFC standard)
 *     • Stored: Lowercase for consistency
 *   
 *   - phone: User's phone number (optional)
 *     • Required: false
 *     • Format: 7-15 digit E.164 format
 *     • Normalized: Spaces, dashes, parentheses removed
 *     • Preserved: Leading + for international format
 *     • Example: "(555) 123-4567" stored as "5551234567"
 *   
 *   - dob: Date of birth (optional)
 *     • Required: false
 *     • Format: ISO Date (YYYY-MM-DD)
 *     • Validation: Must be 13+ years old, in the past
 *     • Stored: As Date object for range queries
 *   
 *   - timestamps: createdAt and updatedAt (automatic)
 *     • createdAt: Set when document is created
 *     • updatedAt: Updated whenever document is modified
 *     • Format: ISO 8601 datetime
 * 
 * Database Indexes:
 *   - username: Unique index (created by { unique: true })
 *   - _id: Default MongoDB primary key
 * 
 * Usage in Controllers:
 *   const user = await User.findById(userId);
 *   const user = await User.findOne({ username: 'john' });
 *   const user = await User.findByIdAndUpdate(id, updates, { new: true });
 *   const user = await User.create({ username, password, email });
 * 
 * @type {mongoose.Model}
 */
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String 
  },
  dob: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

# Code Documentation - DemoApp2

This document explains the purpose, functionality, and implementation of every code module in the DemoApp2 application.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Controllers](#backend-controllers)
3. [Routes](#routes)
4. [Middleware](#middleware)
5. [Models](#models)
6. [Frontend](#frontend)
7. [Configuration](#configuration)

---

## Architecture Overview

**DemoApp2** is a full-stack web application with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Static HTML)                   │
│  • index.html (Login page)                                  │
│  • register.html (Registration page)                         │
│  • profile.html (User profile management)                    │
│  • app.js (Client-side logic)                               │
│  • styles.css (Styling)                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API Calls
┌──────────────────────▼──────────────────────────────────────┐
│                 Backend (Express.js Server)                  │
│  • server.js (Main entry point)                              │
│  • routes/auth.js (Authentication routes)                    │
│  • routes/users.js (Profile routes)                          │
│  • controllers/authController.js (Login/Register logic)      │
│  • controllers/userController.js (Profile logic)             │
│  • middleware/authMiddleware.js (JWT verification)           │
└──────────────────────┬──────────────────────────────────────┘
                       │ MongoDB Query Operations
┌──────────────────────▼──────────────────────────────────────┐
│              Database (MongoDB with Mongoose)                │
│  • models/user.model.js (User schema definition)             │
│  • MongoDB collections for user data storage                 │
└─────────────────────────────────────────────────────────────┘
```

**Key Technologies:**
- **Node.js 18 LTS**: JavaScript runtime
- **Express.js 4.18**: Web framework for routing and middleware
- **MongoDB 6.0**: NoSQL database for data persistence
- **Mongoose 7.8**: ODM (Object Document Mapper) for MongoDB schema validation
- **JWT (jsonwebtoken 9.0)**: Token-based authentication
- **bcryptjs 5.1**: Password hashing for security

---

## Backend Controllers

### authController.js

**File**: `controllers/authController.js`

**Purpose**: Handles user authentication (login and registration) logic.

#### login(req, res)

```javascript
async function login(req, res)
```

**Functionality**:
- Authenticates a user by username and password
- Verifies password using bcrypt.compare()
- Generates JWT token on success
- Returns token and user profile

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "secretpass123"
}
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "5551234567",
    "dob": "1990-01-15T00:00:00.000Z"
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "Invalid username or password."
}
```

**Implementation Details**:
- Finds user in MongoDB by username
- Compares provided password hash with stored hash
- Generates JWT with 4-hour expiration
- Token payload includes user ID (sub) and username

#### register(req, res)

```javascript
async function register(req, res)
```

**Functionality**:
- Creates a new user account
- Validates username format (3-30 alphanumeric + underscore)
- Validates password strength (minimum 6 characters)
- Checks for duplicate username
- Hashes password with bcrypt (cost factor 12)
- Returns JWT token for immediate login

**Request Body**:
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@example.com"
}
```

**Response (201 Created)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "username": "newuser",
    "email": "newuser@example.com"
  }
}
```

**Response (409 Conflict)**:
```json
{
  "error": "Username already taken."
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "Username must be 3-30 characters, alphanumeric or underscore only."
}
```

**Implementation Details**:
- Uses regex `/^[a-zA-Z0-9_]{3,30}$/` to validate username
- Uses bcrypt with cost 12 for secure password hashing
- Email field is optional but provided in request
- Response status is 201 (Created) on success

---

### userController.js

**File**: `controllers/userController.js`

**Purpose**: Handles user profile retrieval and updates with input validation.

#### Validation Helpers

**validateEmail(email)**
- Validates email format using RFC 5322 simplified pattern
- Checks max length of 254 characters (RFC standard)
- Returns: boolean
- Used before storing email addresses

**validateDOB(dob)**
- Validates date of birth
- Requirements:
  - Must be valid date format
  - Must be in the past (not future)
  - User must be at least 13 years old (COPPA compliance)
- Returns: boolean
- Calculates age accurately considering month/day

**isValidPhone(phone)**
- Validates phone number format
- Accepts 7-15 digit numbers (E.164 standard)
- Allows optional leading + for international format
- Phone field is optional (empty is valid)
- Returns: boolean

**normalizePhone(phone)**
- Removes formatting characters: spaces, dashes, parentheses
- Preserves leading + for international format
- Examples:
  - "(555) 123-4567" → "5551234567"
  - "+1 555 123 4567" → "+15551234567"
- Returns: normalized phone string

#### getMe(req, res)

```javascript
async function getMe(req, res)
```

**Functionality**:
- Retrieves authenticated user's complete profile
- Excludes password field from response for security
- Requires JWT authentication (Bearer token)

**Route**: `GET /api/users/me`

**Headers Required**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "5551234567",
  "dob": "1990-01-15T00:00:00.000Z",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-15T08:30:00.000Z"
}
```

**Response (404 Not Found)**:
```json
{
  "error": "User not found."
}
```

#### updateMe(req, res)

```javascript
async function updateMe(req, res)
```

**Functionality**:
- Updates user profile information
- All fields are optional (omitted fields not changed)
- Validates each field before updating
- Password cannot be updated through this endpoint
- Returns updated user profile

**Route**: `PUT /api/users/me`

**Headers Required**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body** (all optional):
```json
{
  "email": "newemail@example.com",
  "phone": "(555) 123-4567",
  "dob": "1990-01-15"
}
```

**Response (200 OK)**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "newemail@example.com",
  "phone": "5551234567",
  "dob": "1990-01-15T00:00:00.000Z",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z"
}
```

**Response (400 Bad Request)**:
```json
{
  "fieldErrors": {
    "email": "Please enter a valid email address.",
    "phone": "Phone number must be 7-15 digits."
  },
  "message": "Validation failed."
}
```

**Implementation Details**:
- Converts email to lowercase for consistency
- Normalizes phone number before storing
- Converts DOB to Date object for MongoDB storage
- Returns all validation errors at once (not one at a time)
- Uses `findByIdAndUpdate` with `new: true` to return updated document

---

## Routes

### routes/auth.js

**File**: `routes/auth.js`

**Purpose**: Defines authentication endpoints.

**Endpoints**:

```
POST /api/auth/login
  → calls authController.login()
  → Authenticates user with username/password
  → Returns: { token, user }

POST /api/auth/register
  → calls authController.register()
  → Creates new user account
  → Returns: { token, user } (auto-logs in)
```

**Rate Limiting**: Basic rate limiter (10 requests per 60 seconds)

---

### routes/users.js

**File**: `routes/users.js`

**Purpose**: Defines user profile endpoints (protected by JWT authentication).

**Endpoints**:

```
GET /api/users/me
  → Requires: Authorization header with Bearer token
  → calls authController.getMe()
  → Returns: User profile

PUT /api/users/me
  → Requires: Authorization header with Bearer token
  → calls authController.updateMe()
  → Request body: { email?, phone?, dob? }
  → Returns: Updated user profile
```

**Authentication Middleware**: `auth` middleware verifies JWT token before accessing endpoints.

---

## Middleware

### middleware/authMiddleware.js

**File**: `middleware/authMiddleware.js`

**Purpose**: Protects API endpoints by verifying JWT tokens in Authorization header.

**How It Works**:

1. **Extract Token**: Reads "Authorization: Bearer <token>" header
2. **Verify Token**: Uses jsonwebtoken.verify() with JWT_SECRET
3. **Set User Context**: On success, sets req.userId and req.username
4. **Call Next**: Passes control to next middleware/route handler
5. **Return Error**: On failure, returns 401 Unauthorized

**Token Payload**:
```javascript
{
  sub: "507f1f77bcf86cd799439011",    // User ID (MongoDB ObjectId)
  username: "johndoe",                 // Username from token
  iat: 1704110400,                     // Issued at timestamp
  exp: 1704124800                      // Expires in 4 hours
}
```

**Usage in Routes**:
```javascript
router.get('/protected', auth, (req, res) => {
  const userId = req.userId;     // Available after auth middleware
  const username = req.username; // Available after auth middleware
  // Handle request
});
```

**Response (401 Unauthorized)** - No Token:
```json
{
  "error": "Authentication required."
}
```

**Response (401 Unauthorized)** - Invalid Token:
```json
{
  "error": "Invalid or expired token."
}
```

**JWT Secret**: Stored in environment variable `JWT_SECRET` (defaults to 'dev_secret_change_me' in development).

---

## Models

### models/user.model.js

**File**: `models/user.model.js`

**Purpose**: Defines MongoDB user schema using Mongoose.

**Schema Fields**:

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| username | String | Yes | Yes | Unique identifier for login (3-30 alphanumeric + underscore) |
| password | String | Yes | No | bcrypt hashed password (never returned in API responses) |
| email | String | Yes | No | User's email address (stored lowercase) |
| phone | String | No | No | Phone number (7-15 digits, E.164 format, optional) |
| dob | Date | No | No | Date of birth (optional, must be 13+ years old) |
| createdAt | Date | Auto | No | Timestamp when user was created |
| updatedAt | Date | Auto | No | Timestamp when user was last updated |

**Mongoose Features**:
- `timestamps: true` automatically tracks createdAt and updatedAt
- `unique: true` on username creates MongoDB unique index
- Password field should always be excluded from API responses using `.select('-password')`

**Usage Examples**:

```javascript
// Find user by ID
const user = await User.findById(userId).select('-password');

// Find user by username
const user = await User.findOne({ username: 'johndoe' });

// Create new user
const user = new User({
  username: 'johndoe',
  password: hashedPassword,
  email: 'john@example.com'
});
await user.save();

// Update user
const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
```

---

## Frontend

### public/index.html

**File**: `public/index.html`

**Purpose**: Login page for user authentication.

**Features**:
- Username input field
- Password input field
- Login button
- Error message display
- Link to registration page ("Create one here")

**Page Flow**:
1. User enters username and password
2. Clicks "Login" button
3. JavaScript calls `api('/api/auth/login', ...)`
4. Token stored in localStorage
5. Redirects to `/profile.html`

**Styling**: Uses `styles.css` for responsive card layout.

---

### public/register.html

**File**: `public/register.html`

**Purpose**: Registration page for new user account creation.

**Features**:
- Username input field (3-30 alphanumeric characters)
- Password input field (minimum 6 characters)
- Email input field
- Register button
- Error message display
- Link to login page ("Sign in here")

**Page Flow**:
1. User enters username, password, and email
2. JavaScript validates input on client-side
3. Clicks "Register" button
4. JavaScript calls `api('/api/auth/register', ...)`
5. Token stored in localStorage (auto-login)
6. Redirects to `/profile.html`

**Client-Side Validation**:
- Username: 3-30 alphanumeric + underscore
- Password: minimum 6 characters
- Email: valid email format (RFC 5322 simplified)

---

### public/profile.html

**File**: `public/profile.html`

**Purpose**: User profile management page.

**Features**:
- Display username (read-only)
- Edit email address
- Edit phone number
- Edit date of birth
- Save button
- Logout button
- Status message display (success/error)

**Page Flow**:
1. Page loads, checks for token in localStorage
2. Fetches user profile via GET `/api/users/me`
3. Displays current user information
4. User can modify email, phone, dob
5. Clicks "Save" button
6. JavaScript validates input on client-side
7. Sends PUT `/api/users/me` request
8. Shows success or error message

**Client-Side Validation**:
- Email: valid email format
- Phone: 7-15 digits
- DOB: valid date in past, user must be 13+ years old

---

### public/app.js

**File**: `public/app.js`

**Purpose**: Client-side logic for all frontend pages.

**Functionality**:

#### Validation Functions (Client-side)

```javascript
validateEmail(email)      // RFC 5322 simplified email validation
normalizePhone(phone)     // Remove formatting from phone
isValidPhone(phone)       // Validate 7-15 digit phone
isValidDOB(dob)          // Validate DOB (past date, 13+ years old)
```

#### API Helper Function

```javascript
async function api(path, opts = {})
```

- Makes HTTP requests to backend API
- Automatically includes JWT token from localStorage in Authorization header
- Adds Content-Type: application/json header
- Parses JSON response
- Throws error if response is not OK

**Usage**:
```javascript
const user = await api('/api/users/me');
const result = await api('/api/auth/login', { 
  method: 'POST', 
  body: JSON.stringify({ username, password }) 
});
```

#### Login Page Logic

Triggered when `#loginBtn` element exists (on index.html):
- Validates username and password are entered
- Calls `api('/api/auth/login', ...)`
- Stores token in localStorage
- Redirects to `/profile.html`
- Shows error on validation or server failure

#### Registration Page Logic

Triggered when `#registerBtn` element exists (on register.html):
- Validates username format (3-30 alphanumeric + underscore)
- Validates password length (minimum 6 characters)
- Validates email format
- Calls `api('/api/auth/register', ...)`
- Stores token in localStorage
- Redirects to `/profile.html`
- Shows error on validation or server failure

#### Profile Page Logic

Triggered when `#profileForm` element exists (on profile.html):
- **Load**: Fetches user profile on page load
- **Logout**: Clears token and redirects to login
- **Update**: Validates and updates profile information
- **Error Handling**: Redirects to login if token is invalid

---

### public/styles.css

**File**: `public/styles.css`

**Purpose**: Styling for all frontend pages.

**Layout**: Responsive card-based design with:
- Centered container
- Card styling with shadow and padding
- Form inputs with labels
- Buttons with hover states
- Error/success message styling
- Mobile responsive

---

## Configuration

### server.js

**File**: `server.js`

**Purpose**: Main entry point for the Express application.

**Startup Process**:
1. Loads environment variables from `.env`
2. Creates Express app
3. Applies security middleware (helmet, CORS)
4. Applies rate limiting to auth endpoints
5. Mounts routes:
   - `/api/auth` → authentication routes
   - `/api/users` → profile routes
6. Serves static frontend files from `/public`
7. Fallback: Serves `index.html` for unknown routes (SPA routing)
8. Connects to MongoDB and starts listening

**Middleware Stack**:
```
helmet()                    // Security headers
express.json()              // Parse JSON requests
cors()                      // Enable CORS
authLimiter                 // Rate limiting on auth routes
express.static()            // Serve static files
Custom error handling       // Not explicitly shown but good practice
```

**Environment Variables**:
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/demoapp2)
- `JWT_SECRET`: Secret key for JWT signing (default: dev_secret_change_me)

### .env.example

**File**: `.env.example`

**Purpose**: Template for environment variables.

**Variables**:
```
MONGODB_URI=mongodb://localhost:27017/demoapp2
JWT_SECRET=your_secret_key_here
PORT=3000
```

**Usage**: Copy to `.env` and update values for your environment.

### package.json

**File**: `package.json`

**Purpose**: Node.js project manifest with dependencies and scripts.

**Scripts**:
- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run Jest tests
- `npm run seed`: Seed database with sample data

**Dependencies**:
- express, mongoose, bcryptjs, jsonwebtoken
- helmet, cors, express-rate-limit (security)
- dotenv (environment variables)

**Dev Dependencies**:
- jest, supertest (testing)
- mongodb-memory-server (in-memory MongoDB for tests)
- nodemon (auto-reload in development)

---

## Data Flow Examples

### Registration Flow

```
1. User fills registration form (register.html)
   ↓
2. Clicks "Register" button
   ↓
3. app.js validates input:
   - Username: 3-30 alphanumeric + underscore
   - Password: minimum 6 characters
   - Email: valid format
   ↓
4. app.js calls api('/api/auth/register', { method: 'POST', ... })
   ↓
5. server.js routes POST /api/auth/register to authController.register()
   ↓
6. authController.register():
   - Validates username format and password strength
   - Checks username is unique in database
   - Hashes password with bcrypt (cost 12)
   - Creates User document in MongoDB
   - Generates JWT token
   ↓
7. Server returns 201 response with token and user
   ↓
8. app.js stores token in localStorage
   ↓
9. app.js redirects to profile.html
   ↓
10. profile.html loads, fetches GET /api/users/me (authenticated with token)
    ↓
11. User can view and edit profile
```

### Login Flow

```
1. User enters credentials (index.html)
   ↓
2. Clicks "Login" button
   ↓
3. app.js calls api('/api/auth/login', { method: 'POST', ... })
   ↓
4. server.js routes POST /api/auth/login to authController.login()
   ↓
5. authController.login():
   - Finds user by username
   - Verifies password with bcrypt.compare()
   - Generates JWT token
   ↓
6. Server returns 200 response with token and user
   ↓
7. app.js stores token in localStorage
   ↓
8. app.js redirects to profile.html
```

### Profile Update Flow

```
1. User modifies email/phone/dob on profile.html
   ↓
2. Clicks "Save" button
   ↓
3. app.js validates input
   ↓
4. app.js calls api('/api/users/me', { method: 'PUT', ... })
   ↓
5. authMiddleware verifies token from Authorization header
   ↓
6. server.js routes PUT /api/users/me to userController.updateMe()
   ↓
7. userController.updateMe():
   - Validates each field
   - Normalizes phone number
   - Updates MongoDB document
   ↓
8. Server returns 200 response with updated user
   ↓
9. app.js shows success message
```

---

## Error Handling

### Client-Side (app.js)

```javascript
try {
  const result = await api('/api/auth/login', {...});
  // Success handling
} catch (err) {
  // err.error: Server error message
  // err.message: Response message
  // err.status: HTTP status code
}
```

### Server-Side

Responses include proper HTTP status codes:
- `201`: Created (registration success)
- `200`: OK (login success, profile fetch/update)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials, missing/invalid token)
- `404`: Not Found (user not found)
- `409`: Conflict (username already taken)

---

## Security Considerations

1. **Password Hashing**: bcryptjs with cost factor 12
2. **JWT Tokens**: 4-hour expiration
3. **Rate Limiting**: Basic rate limiter on auth endpoints
4. **CORS**: Enabled for cross-origin requests
5. **Helmet**: Security headers (XSS protection, etc.)
6. **Password Excluded**: Never returned in API responses
7. **Input Validation**: Both client-side and server-side
8. **Email Validation**: RFC 5322 format check
9. **Age Restriction**: COPPA compliance (13+ years old)

---

## Testing

All code is tested with Jest and Supertest:

**Test Files**:
- `tests/auth.test.js`: Authentication endpoint tests
- `tests/validation.test.js`: Validation function tests

**Running Tests**:
```bash
npm test
```

**Coverage**: 13 tests, all passing
- Login endpoint
- Registration endpoint
- Profile fetch endpoint
- Profile update endpoint
- Input validation (email, phone, DOB)


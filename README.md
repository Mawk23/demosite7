# DemoApp2 — Simple Profile Manager

This is a full-stack web application that implements:
- **Registration**: Anyone can create a new account
- **Login**: Authenticate with username and password (JWT)
- **Profile Management**: View and update user information (email, phone, date of birth)

**Stack**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt. Static frontend served from `/public`.

## Quick Start

### Option 1: Run Locally (Node.js + MongoDB)

1. Install dependencies:
```powershell
npm install
```

2. Create `.env` file from `.env.example`:
```powershell
Copy-Item .env.example .env
```
Update `JWT_SECRET` to a secure value.

3. (Optional) Seed a test user:
```powershell
npm run seed
```
Seed user: `alice` / `password123`

4. Start the server:
```powershell
npm start
```
Open http://localhost:3000 in your browser.

### Option 2: Run with Docker (Recommended)

```powershell
# Production setup
docker-compose up --build

# Development setup (with hot-reload)
docker-compose up --build
```

The app will be available at http://localhost:3000.

## Features

- **Open Registration**: Anyone can sign up with username, password, and email
- **Secure Authentication**: JWT tokens with 4-hour expiration, bcrypt password hashing (cost 12)
- **Profile Management**: Update email, phone, date of birth
- **Input Validation**: Client-side and server-side validation
  - Username: 3-30 alphanumeric characters (+ underscore)
  - Password: Minimum 6 characters
  - Email: RFC 5322 format validation
  - Phone: 7-15 digits (E.164 format), optional
  - DOB: Valid date, in the past, user must be 13+ years old (COPPA)
- **Responsive Design**: Works on desktop and mobile browsers
- **Production Ready**: Docker, rate limiting, CORS, security headers (Helmet)

## Project Structure

```
demoapp2/
├── controllers/              # Business logic
│   ├── authController.js     # Login & registration
│   └── userController.js     # Profile management
├── models/
│   └── user.model.js         # Mongoose User schema
├── routes/
│   ├── auth.js               # POST /api/auth/login, /register
│   └── users.js              # GET/PUT /api/users/me
├── middleware/
│   └── authMiddleware.js     # JWT token verification
├── public/                   # Frontend (static HTML/CSS/JS)
│   ├── index.html            # Login page
│   ├── register.html         # Registration page
│   ├── profile.html          # Profile management page
│   ├── app.js                # Client-side logic
│   └── styles.css            # Styling
├── tests/                    # Jest test suite (13 tests)
│   ├── auth.test.js
│   └── validation.test.js
├── .github/workflows/        # GitHub Actions CI/CD
├── Dockerfile                # Production image
├── Dockerfile.dev            # Development image (hot-reload)
├── docker-compose.yml        # Production config
├── docker-compose.override.yml # Development config
├── wait-for-db.sh            # MongoDB readiness check
├── seed.js                   # Database seed script
├── server.js                 # Express entry point
├── package.json
├── CODE_DOCUMENTATION.md     # Complete code documentation
└── README.md                 # This file
```

## API Endpoints

### Authentication

- **POST** `/api/auth/login`
  - Request: `{ username, password }`
  - Response: `{ token, user }`

- **POST** `/api/auth/register`
  - Request: `{ username, password, email }`
  - Response: `{ token, user }`

### Profile (Requires Authentication)

- **GET** `/api/users/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: User profile object

- **PUT** `/api/users/me`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ email?, phone?, dob? }`
  - Response: Updated user profile

## Documentation

### Code Documentation
- **[CODE_DOCUMENTATION.md](./CODE_DOCUMENTATION.md)** — Comprehensive documentation of every module, function, and data flow.

### Deployment & Security
- **[DEPLOYMENT_AND_SECURITY.md](./DEPLOYMENT_AND_SECURITY.md)** — Security hardening, HTTPS setup, environment variables, deployment guides.
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** — Pre-deployment checklist for security, testing, and validation.
- **[QUICKSTART.md](./QUICKSTART.md)** — Quick setup guide for developers.

## Testing

Run the test suite (13 tests, all passing):

```powershell
npm test
```

Tests cover:
- Login endpoint
- Registration endpoint
- Profile fetch and update
- Input validation (email, phone, DOB)

## Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18 LTS |
| Web Framework | Express.js | 4.18 |
| Database | MongoDB | 6.0 |
| ODM | Mongoose | 7.8 |
| Authentication | JWT | 9.0 |
| Password Hashing | bcryptjs | 5.1 |
| Testing | Jest | 29.7 |
| Containerization | Docker | Latest |

## Security Features

1. **Password Security**: bcryptjs with cost factor 12 (~250ms per hash)
2. **JWT Authentication**: 4-hour token expiration
3. **Input Validation**: Strict validation rules enforced server-side
4. **Rate Limiting**: Basic rate limiter on authentication endpoints (10 req/min)
5. **Security Headers**: Helmet.js for XSS protection, HSTS, etc.
6. **CORS**: Enabled for cross-origin requests
7. **Age Compliance**: COPPA-compliant (13+ years old requirement)
8. **Password Exclusion**: Never returned in API responses

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/demoapp2
JWT_SECRET=your_secure_secret_key
PORT=3000
NODE_ENV=production
```

See `.env.example` for template.

## Development

### Hot-Reload Development Server

Using Docker Compose (recommended):

```powershell
docker-compose up --build
```

Code changes automatically reload via nodemon.

### Local Development (without Docker)

```powershell
npm install
npm run dev
```

### Run Tests with Coverage

```powershell
npm test -- --coverage
```

## Deployment

For production deployment instructions, see:
- **[DEPLOYMENT_AND_SECURITY.md](./DEPLOYMENT_AND_SECURITY.md)** — Step-by-step deployment guides
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** — Pre-deployment validation

Supported platforms:
- Heroku
- AWS (EC2, ECS, Elastic Beanstalk)
- DigitalOcean
- Kubernetes
- Docker (any platform)

## Notes

- This is a production-ready demo with proper structure, validation, testing, and deployment patterns.
- Frontend uses localStorage for token storage (suitable for demo; production should use HttpOnly secure cookies).
- All passwords are hashed and never stored in plain text.
- For security in production, follow DEPLOYMENT_AND_SECURITY.md guidelines.
- Database includes timestamps (createdAt, updatedAt) for audit trails.

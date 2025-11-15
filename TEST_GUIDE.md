# Quick Start Guide - Test the Application

## 🚀 Your Application is Ready!

Your DemoApp2 application is fully functional and running in Docker. Here's how to test it:

---

## Access the Application

**URL**: http://localhost:3000

The application is running in Docker containers:
- **Web Server**: demoapp2-app-1 (port 3000)
- **Database**: demoapp2-mongo-1 (MongoDB, port 27017)

---

## Test User Journey

### 1. Register a New Account

1. Go to http://localhost:3000
2. Click **"Create one here"** link (or go to http://localhost:3000/register.html)
3. Fill in the registration form:
   - **Username**: Any name (3-30 alphanumeric characters, can include underscore)
   - **Password**: Any password (6+ characters)
   - **Email**: Valid email address

Example:
```
Username: johndoe
Password: mypassword123
Email: john@example.com
```

4. Click **Register**
5. You will be automatically logged in and redirected to your profile

### 2. View Your Profile

After registration, you should see:
- Your username (read-only)
- Your email
- Phone number field (empty)
- Date of birth field (empty)

### 3. Update Your Profile

1. Fill in optional fields:
   - **Phone**: Enter a phone number (e.g., "(555) 123-4567" or "+1-555-123-4567")
   - **Date of Birth**: Enter your birthdate (YYYY-MM-DD format, must be 13+ years old)

2. Click **Save**
3. You should see "Profile saved successfully" message
4. Information will be stored in MongoDB

### 4. Test Login

1. Click **Logout** button
2. You should be returned to the login page
3. Enter your username and password
4. Click **Login**
5. You should be logged in and see your saved profile information

---

## What's Implemented

✅ **Open Registration** - Anyone can create an account  
✅ **Secure Login** - JWT-based authentication  
✅ **Profile Management** - View and update user information  
✅ **Input Validation** - Email, phone, date of birth validation  
✅ **Security** - Encrypted passwords, JWT tokens, rate limiting  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Docker** - Production-ready containerization  
✅ **Tests** - 13 automated tests (all passing)  

---

## Running Tests

To run the automated test suite:

```powershell
npm test
```

Expected output:
```
PASS  tests/auth.test.js
PASS  tests/validation.test.js

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
```

---

## API Endpoints

If you want to test the API directly:

### Register
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@example.com"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "newuser",
    "email": "newuser@example.com"
  }
}
```

### Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123"
}
```

### Get Profile
```
GET http://localhost:3000/api/users/me
Authorization: Bearer <token>
```

### Update Profile
```
PUT http://localhost:3000/api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "phone": "(555) 456-7890",
  "dob": "1995-05-20"
}
```

---

## Documentation

The application includes comprehensive documentation:

1. **CODE_DOCUMENTATION.md** ← Start here for technical details
   - Architecture overview
   - Complete function documentation
   - Data flow examples
   - Security considerations

2. **README.md** ← Main project guide
   - Feature overview
   - Setup instructions
   - Technology stack
   - Deployment options

3. **IMPLEMENTATION_COMPLETE.md**
   - What was implemented
   - Test results
   - All features explained

4. **DEPLOYMENT_AND_SECURITY.md**
   - Production deployment
   - Security hardening
   - Environment configuration

5. **PRODUCTION_CHECKLIST.md**
   - Pre-deployment validation
   - Security checklist

---

## Validation Rules

The application enforces strict validation rules:

### Registration
- **Username**: 3-30 alphanumeric characters or underscore
- **Password**: Minimum 6 characters
- **Email**: Valid email format
- **Uniqueness**: Username must be unique (no duplicates)

### Profile Update
- **Email**: Valid RFC 5322 email format
- **Phone**: 7-15 digit E.164 format (optional)
- **DOB**: 
  - Valid date format (YYYY-MM-DD)
  - Must be in the past
  - User must be at least 13 years old (COPPA)

---

## Troubleshooting

### Application not accessible at http://localhost:3000

Check if Docker containers are running:
```powershell
docker ps
```

Should show `demoapp2-app-1` and `demoapp2-mongo-1` in running state.

If not running, start them:
```powershell
docker-compose up --build
```

### MongoDB connection error

Verify MongoDB container is healthy:
```powershell
docker-compose logs mongo
```

If there are issues, restart:
```powershell
docker-compose restart mongo
```

### Clear all data and start fresh

```powershell
docker-compose down -v
docker-compose up --build
```

This will:
- Stop all containers
- Remove MongoDB volume (deletes all data)
- Rebuild and restart everything

---

## Example User Data

Here's what a complete user record looks like in MongoDB:

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "johndoe",
  "password": "$2b$12$...(bcrypt hash)...",
  "email": "john@example.com",
  "phone": "5551234567",
  "dob": ISODate("1995-05-20T00:00:00Z"),
  "createdAt": ISODate("2025-01-11T12:00:00Z"),
  "updatedAt": ISODate("2025-01-11T15:30:00Z")
}
```

Note: Password is never returned in API responses for security.

---

## Next Steps

### For Development
1. Read `CODE_DOCUMENTATION.md` to understand the codebase
2. Modify code in `controllers/`, `routes/`, or `public/` folders
3. Changes auto-reload in development (thanks to Docker hot-reload)
4. Run `npm test` to validate changes

### For Production Deployment
1. Follow `DEPLOYMENT_AND_SECURITY.md`
2. Use production checklist from `PRODUCTION_CHECKLIST.md`
3. Deploy to your platform (Heroku, AWS, DigitalOcean, etc.)

### To Extend Features
The codebase is structured for easy additions:
- Add new routes in `routes/` folder
- Add business logic in `controllers/` folder
- Add validation helpers in controller files
- Add frontend pages in `public/` folder
- Update tests in `tests/` folder

---

## Support Documentation Files

| File | Purpose |
|------|---------|
| CODE_DOCUMENTATION.md | Complete technical documentation |
| README.md | Project overview and setup |
| IMPLEMENTATION_COMPLETE.md | What was implemented |
| DEPLOYMENT_AND_SECURITY.md | Production deployment guide |
| PRODUCTION_CHECKLIST.md | Pre-deployment checklist |
| QUICKSTART.md | Quick setup guide |
| this file | Test instructions |

---

## Key Features at a Glance

- ✅ **Registration**: Create accounts with validation
- ✅ **Authentication**: Secure JWT-based login
- ✅ **Profile Management**: Save and update user data
- ✅ **Validation**: Email, phone, DOB, age verification
- ✅ **Security**: Encrypted passwords, token expiration
- ✅ **Database**: MongoDB with Mongoose ORM
- ✅ **Testing**: 13 automated tests
- ✅ **Docker**: Production-ready containers
- ✅ **Documentation**: Comprehensive code docs
- ✅ **Responsive**: Mobile and desktop friendly

---

## Happy Testing! 🎉

Your application is ready to use. Register a new account, update your profile, and test all the features.

For technical questions, refer to `CODE_DOCUMENTATION.md`.

For deployment, follow `DEPLOYMENT_AND_SECURITY.md`.

# Quick Start Guide

Get DemoApp2 up and running in minutes.

## Prerequisites

- Node.js 18+ (from [nodejs.org](https://nodejs.org))
- MongoDB (local or Atlas connection string)
- Docker & Docker Compose (optional, but recommended)

## Local Setup (Without Docker)

1. **Clone or download the project**

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Create `.env` file**
   ```powershell
   # Copy from .env.example
   cp .env.example .env
   
   # Edit .env and set:
   # - MONGODB_URI (e.g., mongodb://localhost:27017/demoapp2)
   # - JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   ```

4. **Ensure MongoDB is running**
   - If local: `mongod`
   - If Atlas: MongoDB server is cloud-hosted

5. **Seed a test user (optional)**
   ```powershell
   npm run seed
   ```
   Creates user: `alice` / `password123`

6. **Start the dev server**
   ```powershell
   npm run dev
   ```
   or production:
   ```powershell
   npm start
   ```

7. **Open in browser**
   - http://localhost:3000

## Docker Setup (Recommended)

Simplest way to run locally with MongoDB:

```powershell
# Build and run (uses docker-compose.override.yml for dev mode)
docker-compose up --build

# Visit http://localhost:3000
# MongoDB is auto-started and seeded
```

To run production config (without dev overrides):
```powershell
docker-compose -f docker-compose.yml up --build
```

Stop:
```powershell
docker-compose down
```

Clean up volumes:
```powershell
docker-compose down -v
```

## Testing

```powershell
npm test
```

All tests pass? Great! You're ready to deploy.

## Login

- **Username**: alice
- **Password**: password123

Edit your profile (email, phone, date of birth) and save.

## Project Files

| File | Purpose |
|------|---------|
| `server.js` | Express server entry point |
| `controllers/` | Login, profile business logic |
| `routes/` | API endpoint definitions |
| `public/index.html` | Login page |
| `public/profile.html` | Profile page |
| `public/app.js` | Client-side logic |
| `.github/workflows/ci.yml` | GitHub Actions CI config |
| `DEPLOYMENT_AND_SECURITY.md` | Production guide |
| `PRODUCTION_CHECKLIST.md` | Pre-deploy checklist |

## Next Steps

1. **Customize**: Edit seed user, add registration, customize UI.
2. **Deploy**: Follow [DEPLOYMENT_AND_SECURITY.md](./DEPLOYMENT_AND_SECURITY.md).
3. **Monitor**: Set up logging and alerts (Sentry, DataDog, etc.).
4. **Enhance**: Add 2FA, refresh tokens, audit logging.

## Troubleshooting

### MongoDB connection error
- Ensure MongoDB is running (`mongod` on Windows/Mac/Linux or connect to Atlas).
- Check `MONGODB_URI` in `.env`.

### Port 3000 already in use
- Change `PORT` in `.env` or `.docker-compose.yml`.
- Or kill the process: `lsof -ti:3000 | xargs kill -9` (Mac/Linux).

### Docker issues
- Rebuild: `docker-compose build --no-cache`
- Clean: `docker system prune -a`

### Tests timeout
- Increase Jest timeout in test file: `jest.setTimeout(120000)`

## Support

See `README.md`, `DEPLOYMENT_AND_SECURITY.md`, and code comments for details.

Happy coding!

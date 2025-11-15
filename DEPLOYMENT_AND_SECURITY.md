# Deployment & Security Hardening Guide

This guide covers production deployment, security best practices, and environment configuration for DemoApp2.

## Environment Variables (Production)

Create a `.env` file (do NOT commit to version control) with the following:

```
MONGODB_URI=<production-mongodb-atlas-uri-or-managed-service>
JWT_SECRET=<generate-a-secure-random-string-256-bits-or-more>
NODE_ENV=production
PORT=3000
```

To generate a secure JWT secret in PowerShell:
```powershell
$bytes = [byte[]]::new(32)
[System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Or use Node.js:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## HTTPS/TLS Configuration

### Option 1: Reverse Proxy (Recommended for Production)
Use a reverse proxy (Nginx, HAProxy, AWS ALB) in front of your app to handle TLS.

Example Nginx config:
```nginx
server {
  listen 443 ssl;
  server_name yourdomain.com;
  
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Option 2: Built-in HTTPS (for small deployments)
Modify `server.js` to use Node's https module:

```javascript
const fs = require('fs');
const https = require('https');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(3000, () => {
  console.log('Secure server listening on port 3000');
});
```

For Let's Encrypt certificates:
```bash
certbot certonly --standalone -d yourdomain.com
```

## Security Best Practices

### 1. Authentication & Sessions
- **JWT Expiry**: Currently set to 4 hours. Consider shorter expiry (1h) and implement refresh tokens for longer sessions.
- **Token Storage**: Current setup uses localStorage (vulnerable to XSS). For higher security:
  - Use HttpOnly, Secure, SameSite cookies instead.
  - Example middleware to set cookie:
    ```javascript
    res.cookie('token', jwt_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    ```

### 2. Password Security
- Bcrypt cost factor is set to 12 (good). Consider increasing to 13+ in high-security scenarios.
- Never log or send passwords in responses (already implemented).

### 3. Input Validation & Sanitization
- All user inputs are validated on the server (email, phone, DOB).
- Mongoose schemas do not execute arbitrary code (safe from injection in this setup).
- Consider adding input length limits in middleware:
  ```javascript
  app.use(express.json({ limit: '10kb' }));
  ```

### 4. Rate Limiting
- Basic rate limiter on `/api/auth/login` (10 requests per minute).
- For production, consider:
  - Increase strictness on login endpoint (e.g., 5 per minute, 15 min lockout).
  - Apply rate limiting to all API endpoints.
  - Use a distributed rate limiter (Redis) if running multiple instances.

### 5. CORS
- CORS is enabled with default settings (allows all origins).
- For production, restrict to your frontend domain:
  ```javascript
  app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true
  }));
  ```

### 6. Security Headers
- Helmet middleware is already enabled (adds HSTS, X-Frame-Options, etc.).
- Additional hardening:
  ```javascript
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  }));
  ```

### 7. Logging & Monitoring
- Avoid logging sensitive data (passwords, tokens, emails in cleartext).
- For production, use structured logging:
  ```javascript
  const winston = require('winston');
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });
  ```
- Monitor with services like Sentry, LogRocket, or DataDog.

### 8. Database Security
- Use MongoDB Atlas with IP whitelisting and encrypted connections.
- Ensure `MONGODB_URI` includes credentials securely (use env vars, not hardcoded).
- Enable MongoDB authentication and use strong passwords.

## Deployment Platforms

### Heroku
1. Create a Procfile in the project root:
   ```
   web: npm start
   ```

2. Push to Heroku:
   ```bash
   heroku create your-app-name
   heroku config:set JWT_SECRET=<your-secret>
   heroku addons:create mongolab:sandbox  # or use MongoDB Atlas
   git push heroku main
   ```

### AWS Elastic Beanstalk
1. Create `.ebextensions/https.config`:
   ```yaml
   Resources:
     AWSEBSecurityGroupInbound:
       Type: AWS::EC2::SecurityGroupIngress
       Properties:
         GroupId: {"Fn::GetAtt" : ["AWSEBSecurityGroup", "GroupId"]}
         IpProtocol: tcp
         FromPort: 443
         ToPort: 443
         CidrIp: 0.0.0.0/0
   ```

2. Deploy:
   ```bash
   eb init -p node.js-18 your-app
   eb create your-environment
   eb setenv JWT_SECRET=<your-secret> MONGODB_URI=<your-uri>
   eb deploy
   ```

### DigitalOcean App Platform
1. Push repo to GitHub.
2. Connect via DigitalOcean dashboard.
3. Set environment variables in the dashboard (JWT_SECRET, MONGODB_URI).
4. Deploy.

### Docker Swarm / Kubernetes
For larger deployments, use Kubernetes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demoapp2
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demoapp2
  template:
    metadata:
      labels:
        app: demoapp2
    spec:
      containers:
      - name: app
        image: your-registry/demoapp2:latest
        ports:
        - containerPort: 3000
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: NODE_ENV
          value: "production"
```

## Pre-Deployment Checklist

- [ ] All environment variables set and validated.
- [ ] JWT_SECRET is a strong, unique, random string.
- [ ] MongoDB is using a managed service (Atlas, AWS, Azure) with strong credentials.
- [ ] HTTPS/TLS is configured (via reverse proxy or built-in).
- [ ] CORS is restricted to your frontend domain(s).
- [ ] Rate limiting is configured on auth endpoints.
- [ ] Logging is set up and monitoring is enabled.
- [ ] Database backups are automated.
- [ ] Error messages don't leak sensitive information.
- [ ] Tests pass: `npm test`
- [ ] No secrets are committed to version control.
- [ ] Security headers are verified (use securityheaders.com or Mozilla Observatory).

## Running Tests Before Deployment

```powershell
npm install
npm test
```

All tests should pass before pushing to production.

## Monitoring & Alerting

- Use application performance monitoring (APM): New Relic, Datadog, AWS CloudWatch.
- Set up alerts for:
  - High error rates
  - Slow response times
  - Database connection failures
  - Failed login attempts (potential brute-force)

## Further Hardening

1. **Implement refresh tokens**: Shorten JWT expiry, use secure refresh token flow.
2. **Add 2FA**: Integrate TOTP or SMS-based two-factor authentication.
3. **Audit logging**: Log all profile updates and logins to an audit table.
4. **API versioning**: Prefix endpoints with `/api/v1/` for future compatibility.
5. **GraphQL instead of REST**: Consider GraphQL for better query efficiency and security.

## Security Scanning & Compliance

- Run `npm audit` regularly:
  ```powershell
  npm audit fix
  ```
- Use OWASP ZAP or Burp Suite for penetration testing.
- Check compliance (GDPR, CCPA) for data handling.

---

For questions or additional security concerns, consult the OWASP Top 10 and Node.js security best practices.

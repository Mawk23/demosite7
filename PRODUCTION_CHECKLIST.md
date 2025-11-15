# Production Deployment Checklist

Complete this checklist before deploying your application to production.

## Security

- [ ] **JWT Secret**: Generate a strong, unique JWT_SECRET (32+ random bytes). Do NOT use the default dev value.
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Environment Variables**: All sensitive config is in `.env`, never committed to Git.
  - [ ] `.env` is in `.gitignore`
  - [ ] `.env.example` exists with placeholder values
  - [ ] All required vars set in production environment

- [ ] **HTTPS/TLS**: Application runs behind HTTPS
  - [ ] Use reverse proxy (Nginx, ALB, CDN) for TLS termination, OR
  - [ ] Use Node.js built-in HTTPS with valid certificates (Let's Encrypt recommended)

- [ ] **Password Security**:
  - [ ] Bcrypt cost factor is 12 or higher (checked in `package.json` and code)
  - [ ] No plain-text passwords logged or sent to client

- [ ] **Helmet Middleware**: Enabled for HTTP security headers
  - [ ] Content-Security-Policy set
  - [ ] HSTS enabled with appropriate max-age

- [ ] **Rate Limiting**: Applied to auth endpoints
  - [ ] Login endpoint limited to ≤5 requests per minute per IP
  - [ ] Consider rate limiting on other endpoints

- [ ] **CORS**: Restricted to specific origin(s)
  - [ ] Not set to `*` in production
  - [ ] Only trusted frontend domains whitelisted

- [ ] **Input Validation**: Server-side validation on all endpoints
  - [ ] Email format validated
  - [ ] Phone number format validated
  - [ ] Date of birth validated (past date, age ≥ 13)
  - [ ] No SQL injection vulnerabilities (using Mongoose)

- [ ] **Authentication**:
  - [ ] JWT tokens have reasonable expiry (e.g., 1h for access, refresh token for long sessions)
  - [ ] Tokens stored securely (HttpOnly cookie preferred over localStorage)
  - [ ] Token validation on all protected endpoints

- [ ] **Logging & Monitoring**:
  - [ ] No sensitive data (passwords, emails, tokens) logged
  - [ ] Structured logging enabled (JSON format preferred)
  - [ ] Monitoring/alerting set up (Sentry, DataDog, New Relic, etc.)
  - [ ] Audit logging for logins and profile updates

- [ ] **Database Security**:
  - [ ] MongoDB connection requires authentication
  - [ ] Use MongoDB Atlas or managed service with TLS
  - [ ] Database backups automated and tested
  - [ ] Database access restricted by firewall/security groups

## Deployment

- [ ] **Dependencies**: All production dependencies pinned
  - [ ] `npm ci` used in CI/deployment (not `npm install`)
  - [ ] Dev dependencies excluded from production build

- [ ] **Environment-Specific Config**:
  - [ ] `NODE_ENV=production` set in production environment
  - [ ] `MONGODB_URI` points to production database
  - [ ] `PORT` set appropriately (or uses reverse proxy)

- [ ] **Build & Artifacts**:
  - [ ] Application builds without errors
  - [ ] No sensitive data in build artifacts
  - [ ] Docker image built and tested (if using Docker)

- [ ] **Server/Infrastructure**:
  - [ ] Auto-restart enabled (systemd, supervisor, PM2, Docker restart policy)
  - [ ] Health checks configured
  - [ ] Load balancing set up (if multiple instances)
  - [ ] Reverse proxy (Nginx, HAProxy) configured for HTTPS and load balancing

- [ ] **Database**:
  - [ ] Migrations/seed data applied to production DB
  - [ ] Test data removed (or isolated to non-production DB)
  - [ ] Seed user (alice/password123) replaced with proper admin user or removed

- [ ] **Monitoring & Logging**:
  - [ ] Application logs aggregated and searchable
  - [ ] Error alerts configured
  - [ ] Performance metrics tracked
  - [ ] Disk space and memory monitored

- [ ] **DNS & CDN**:
  - [ ] Domain configured and DNS records updated
  - [ ] CDN/cache configured (if applicable)
  - [ ] SSL certificate obtained and renewed (Let's Encrypt auto-renewal set up)

## Testing & Validation

- [ ] **Tests Pass**: `npm test` passes with 0 failures
- [ ] **Manual Testing**: Login → Profile → Update → Logout flow tested end-to-end
- [ ] **Error Handling**: Test with invalid inputs (bad email, short phone, future date)
- [ ] **Authentication**: Protected endpoints reject unauthenticated requests
- [ ] **Rate Limiting**: Verify rate limiting works (exceed limit, verify 429 response)
- [ ] **HTTPS**: Verify no mixed content warnings (all resources over HTTPS)
- [ ] **Security Headers**: Check with https://securityheaders.com/ or Mozilla Observatory
- [ ] **Performance**: Load test with expected user volume (curl, Apache Bench, k6, etc.)

## Post-Deployment

- [ ] **Verify Deployment**: Visit production URL and test login flow
- [ ] **Monitor Logs**: Check for errors in first few hours
- [ ] **Performance**: Confirm response times are acceptable
- [ ] **Set Up Alerts**: Ensure critical alerts are configured and on-call team notified
- [ ] **Backup Verification**: Confirm backups are running and can be restored
- [ ] **Documentation**: Update run books and deployment procedures

## Optional Hardening

- [ ] **2FA**: Implement two-factor authentication (TOTP or SMS)
- [ ] **Refresh Tokens**: Implement separate refresh token for extended sessions
- [ ] **IP Whitelisting**: Restrict admin endpoints to known IPs
- [ ] **WAF**: Deploy Web Application Firewall (AWS WAF, Cloudflare, etc.)
- [ ] **DDoS Protection**: Enable DDoS protection (Cloudflare, AWS Shield, etc.)
- [ ] **Audit Logging**: Log all sensitive operations to immutable audit table
- [ ] **Data Encryption**: Encrypt sensitive fields at rest (PII, payment data if added)
- [ ] **API Versioning**: Implement versioning for backward compatibility
- [ ] **GraphQL**: Consider GraphQL instead of REST for better query efficiency

## Secrets Management (Beyond .env)

For large deployments, use a secrets vault:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- 1Password, LastPass for team sharing

Example with AWS Secrets Manager:
```javascript
const aws = require('aws-sdk');
const secretsManager = new aws.SecretsManager();
const secret = await secretsManager.getSecretValue({ SecretId: 'demoapp2-prod' }).promise();
const { JWT_SECRET, MONGODB_URI } = JSON.parse(secret.SecretString);
```

## Rollback Plan

- [ ] Document rollback procedure
- [ ] Keep previous version deployable
- [ ] Database migration reversibility verified
- [ ] Quick rollback test documented and practiced

## Contact & Support

- [ ] Establish on-call schedule
- [ ] Document escalation procedures
- [ ] Error notification channels configured (Slack, PagerDuty, etc.)

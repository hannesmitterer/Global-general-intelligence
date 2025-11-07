# Security Runbook

This runbook provides security best practices, checklists, and procedures for the Nexus API and Global General Intelligence ecosystem.

---

## Table of Contents

1. [Security Checklist](#security-checklist)
2. [Session Management](#session-management)
3. [Secret Handling](#secret-handling)
4. [Rate Limiting](#rate-limiting)
5. [Input Validation](#input-validation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Data Protection](#data-protection)
8. [Incident Response](#incident-response)
9. [Compliance](#compliance)

---

## Security Checklist

### Pre-Deployment Checklist

- [ ] **Environment Variables**: All secrets stored in environment variables (never in code)
- [ ] **HTTPS Enforced**: TLS 1.3 enabled for all connections
- [ ] **Rate Limiting**: Applied to all public endpoints
- [ ] **Input Validation**: All user inputs sanitized and validated
- [ ] **SQL Injection**: Parameterized queries used (no string concatenation)
- [ ] **XSS Protection**: Output properly escaped in frontend
- [ ] **CSRF Protection**: CSRF tokens on state-changing operations
- [ ] **Dependency Audit**: `npm audit` run and vulnerabilities fixed
- [ ] **Secret Scanning**: No secrets committed to repository
- [ ] **Access Control**: RBAC properly configured
- [ ] **Logging**: Security events logged (auth failures, permission denials)
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **CORS**: Properly configured (not `*` in production)
- [ ] **Session Expiry**: Short-lived access tokens (≤ 1 hour)
- [ ] **Database**: Connection strings use internal URLs (not public)

### Post-Deployment Checklist

- [ ] **Monitoring**: Security alerts configured (failed logins, rate limit hits)
- [ ] **Backups**: Automated database backups enabled
- [ ] **Audit Logs**: Centralized logging configured
- [ ] **Penetration Testing**: Security scan completed
- [ ] **Incident Plan**: Incident response plan documented
- [ ] **Update Process**: Procedure for security patches defined

---

## Session Management

### Access Token Lifecycle

```typescript
interface AccessToken {
  type: 'access_token';
  user_id: string;
  role: string;
  expires_at: number; // Unix timestamp
}

// Token generation
import jwt from 'jsonwebtoken';

function generateAccessToken(user: User): string {
  const payload = {
    user_id: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };
  
  return jwt.sign(payload, process.env.NEXUS_JWT_SECRET!, { algorithm: 'HS256' });
}
```

### Session Cleanup

**Automatic Cleanup (Every 15 minutes):**

```typescript
import cron from 'node-cron';

// Schedule cleanup job
cron.schedule('*/15 * * * *', async () => {
  console.log('Running session cleanup...');
  
  // Delete expired sessions from database
  await db.query(`
    DELETE FROM sessions
    WHERE expires_at < NOW()
  `);
  
  // Delete expired tokens from Redis
  const keys = await redis.keys('session:*');
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl <= 0) {
      await redis.del(key);
    }
  }
  
  console.log('Session cleanup completed');
});
```

### Refresh Token Rotation

```typescript
async function refreshAccessToken(refreshToken: string) {
  // Verify refresh token
  const payload = jwt.verify(refreshToken, process.env.NEXUS_JWT_SECRET!) as any;
  
  // Check if token is in database (not revoked)
  const tokenRecord = await db.query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2',
    [refreshToken, payload.user_id]
  );
  
  if (!tokenRecord.rows.length) {
    throw new Error('Invalid or revoked refresh token');
  }
  
  // Generate new access token
  const user = await getUser(payload.user_id);
  const newAccessToken = generateAccessToken(user);
  
  // Optional: Rotate refresh token
  const newRefreshToken = generateRefreshToken(user);
  await db.query(
    'UPDATE refresh_tokens SET token = $1 WHERE token = $2',
    [newRefreshToken, refreshToken]
  );
  
  return { access_token: newAccessToken, refresh_token: newRefreshToken };
}
```

### Session Revocation

```typescript
async function revokeSession(userId: string, reason: string) {
  // Revoke all refresh tokens
  await db.query(
    'DELETE FROM refresh_tokens WHERE user_id = $1',
    [userId]
  );
  
  // Add user to blacklist (for access token invalidation)
  await redis.setex(`blacklist:${userId}`, 3600, reason);
  
  // Log event
  await auditLog({
    event: 'session.revoked',
    user_id: userId,
    reason: reason,
    timestamp: new Date()
  });
}
```

---

## Secret Handling

### Environment Variables

**Never commit secrets to code.** Use environment variables:

```bash
# .env (DO NOT COMMIT)
NEXUS_JWT_SECRET=random-256-bit-secret-here
NEXUS_DATABASE_PASSWORD=strong-database-password
NEXUS_GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
NEXUS_WEBHOOK_SECRET=whsec_random_secret
```

**`.gitignore` (ensure .env is ignored):**

```
.env
.env.local
.env.production
*.key
*.pem
secrets/
```

### Secret Rotation

Rotate secrets regularly (every 90 days):

**Rotation Process:**

1. Generate new secret
2. Update environment variable in deployment platform
3. Deploy with both old and new secrets supported (grace period)
4. After 24 hours, remove old secret support
5. Update documentation

**Example: JWT Secret Rotation**

```typescript
const JWT_SECRETS = [
  process.env.NEXUS_JWT_SECRET_NEW,  // Primary
  process.env.NEXUS_JWT_SECRET_OLD   // Fallback (during rotation)
];

function verifyToken(token: string) {
  for (const secret of JWT_SECRETS) {
    try {
      return jwt.verify(token, secret!);
    } catch (err) {
      // Try next secret
    }
  }
  throw new Error('Invalid token');
}
```

### Secret Storage

**For production, use a secret manager:**

- **AWS**: AWS Secrets Manager
- **GCP**: Google Secret Manager
- **Azure**: Azure Key Vault
- **HashiCorp**: Vault

**Example with AWS Secrets Manager:**

```typescript
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });

async function getSecret(secretName: string): Promise<string> {
  const response = await client.getSecretValue({ SecretId: secretName });
  return response.SecretString!;
}

// Usage
const jwtSecret = await getSecret('nexus/jwt-secret');
```

---

## Rate Limiting

### Implementation

**Using `express-rate-limit`:**

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Strict rate limiter for authentication
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  skipSuccessfulRequests: false,
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/auth/', authLimiter);
```

### Per-User Rate Limiting

```typescript
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const perUserLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  },
  store: new RedisStore({
    client: redis,
    prefix: 'rl:',
  }),
});
```

### Rate Limit Headers

Responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1699056960
```

### Custom Rate Limiting Logic

```typescript
async function checkRateLimit(userId: string, action: string, limit: number): Promise<boolean> {
  const key = `ratelimit:${userId}:${action}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 60 seconds window
  }
  
  if (current > limit) {
    // Log rate limit violation
    await auditLog({
      event: 'rate_limit.exceeded',
      user_id: userId,
      action: action,
      limit: limit,
      current: current
    });
    return false;
  }
  
  return true;
}
```

---

## Input Validation

### Schema Validation

**Using `zod` for type-safe validation:**

```typescript
import { z } from 'zod';

const TaskSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['data_processing', 'ml_inference', 'text_analysis']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigned_to: z.string().regex(/^agent_[a-z0-9_]+$/),
  parameters: z.record(z.any()).optional(),
  deadline: z.string().datetime().optional()
});

app.post('/tasks', async (req, res) => {
  try {
    const validatedData = TaskSchema.parse(req.body);
    // Process validated data
    const task = await createTask(validatedData);
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
```

### SQL Injection Prevention

**Always use parameterized queries:**

```typescript
// ❌ BAD: String concatenation (SQL injection risk)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ GOOD: Parameterized query
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);
```

### XSS Prevention

**Escape output in templates:**

```typescript
import escape from 'escape-html';

function renderUserProfile(user: User): string {
  return `
    <div>
      <h1>${escape(user.name)}</h1>
      <p>${escape(user.bio)}</p>
    </div>
  `;
}
```

### Command Injection Prevention

**Never use `exec` with user input:**

```typescript
import { spawn } from 'child_process';

// ❌ BAD: Command injection risk
const { exec } = require('child_process');
exec(`ls ${userInput}`); // DANGEROUS!

// ✅ GOOD: Use spawn with array arguments
const ls = spawn('ls', [userInput]);
```

---

## Authentication & Authorization

### Multi-Factor Authentication (MFA)

**TOTP Implementation:**

```typescript
import speakeasy from 'speakeasy';

// Generate secret for user
function generateMFASecret(userId: string) {
  const secret = speakeasy.generateSecret({
    name: `Nexus API (${userId})`,
    issuer: 'Nexus'
  });
  
  // Store secret.base32 in database
  return {
    secret: secret.base32,
    qr_code: secret.otpauth_url
  };
}

// Verify TOTP code
function verifyMFACode(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps before/after
  });
}
```

### Role-Based Access Control (RBAC)

```typescript
const permissions = {
  seedbringer: ['read', 'write', 'admin'],
  council: ['read'],
  agent: ['telemetry:write', 'task:read'],
  observer: ['telemetry:read']
};

function authorize(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    const userPermissions = permissions[userRole] || [];
    
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}

// Usage
app.post('/tasks', authorize('write'), createTask);
app.get('/tasks', authorize('read'), listTasks);
```

---

## Data Protection

### Encryption at Rest

**Database encryption:**

```sql
-- PostgreSQL: Enable encryption at column level
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
INSERT INTO users (email, password)
VALUES (
  pgp_sym_encrypt('user@example.com', 'encryption-key'),
  crypt('password', gen_salt('bf'))
);

-- Decrypt
SELECT pgp_sym_decrypt(email::bytea, 'encryption-key') FROM users;
```

### Encryption in Transit

**Force TLS 1.3:**

```typescript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync(process.env.NEXUS_TLS_KEY_PATH!),
  cert: fs.readFileSync(process.env.NEXUS_TLS_CERT_PATH!),
  minVersion: 'TLSv1.3' as const
};

https.createServer(options, app).listen(443);
```

### PII Redaction

**Automatically redact sensitive data in logs:**

```typescript
function redactPII(obj: any): any {
  const sensitive = ['password', 'ssn', 'credit_card', 'token', 'secret'];
  
  if (typeof obj !== 'object') return obj;
  
  const redacted = { ...obj };
  for (const key in redacted) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactPII(redacted[key]);
    }
  }
  
  return redacted;
}

// Usage in logger
console.log(JSON.stringify(redactPII(userData)));
```

---

## Incident Response

### Security Incident Playbook

**Step 1: Detect**
- Monitor logs for unusual activity
- Check alerting system for security alerts
- Review user reports

**Step 2: Contain**
- Revoke compromised credentials
- Block malicious IP addresses
- Disable affected accounts

**Step 3: Investigate**
- Collect audit logs
- Identify scope of breach
- Determine root cause

**Step 4: Remediate**
- Patch vulnerabilities
- Rotate secrets
- Update access controls

**Step 5: Notify**
- Inform affected users
- Report to authorities (if required)
- Document incident

**Step 6: Learn**
- Conduct post-mortem
- Update security procedures
- Implement preventive measures

### Emergency Contacts

```bash
# Emergency contact list (store securely)
SECURITY_TEAM_EMAIL=security@example.com
SECURITY_TEAM_PHONE=+1-555-0100
ON_CALL_ENGINEER=oncall@example.com
```

---

## Compliance

### GDPR Compliance

- [ ] **Data Minimization**: Only collect necessary data
- [ ] **Right to Access**: Users can download their data
- [ ] **Right to Erasure**: Users can delete their accounts
- [ ] **Consent**: Explicit consent for data processing
- [ ] **Data Portability**: Export data in machine-readable format
- [ ] **Breach Notification**: Notify within 72 hours of breach

### Audit Logging

```typescript
interface AuditLog {
  event: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  resource?: string;
  action: string;
  result: 'success' | 'failure';
  timestamp: Date;
  metadata?: Record<string, any>;
}

async function auditLog(log: AuditLog) {
  await db.query(`
    INSERT INTO audit_logs (event, user_id, ip_address, action, result, timestamp, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [log.event, log.user_id, log.ip_address, log.action, log.result, log.timestamp, log.metadata]);
}

// Usage
await auditLog({
  event: 'user.login',
  user_id: 'usr_123',
  ip_address: req.ip,
  action: 'authenticate',
  result: 'success',
  timestamp: new Date()
});
```

---

## Security Tools

### Dependency Scanning

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Generate audit report
npm audit --json > audit-report.json
```

### Static Analysis

```bash
# ESLint security plugin
npm install --save-dev eslint-plugin-security

# Run scan
npx eslint . --ext .ts,.js
```

### Secret Scanning

```bash
# TruffleHog (finds secrets in git history)
docker run --rm -v $(pwd):/repo trufflesecurity/trufflehog git file:///repo

# GitGuardian (CI/CD integration)
ggshield scan repo .
```

---

**For security concerns:** Email security@example.com or open a private security advisory on GitHub.

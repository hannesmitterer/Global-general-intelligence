# Deployment Instructions

This guide covers deploying the Nexus API and supporting services to **Render** and **Netlify**.

---

## Table of Contents

1. [Render Deployment (Backend API)](#render-deployment-backend-api)
2. [Netlify Deployment (Frontend/Static)](#netlify-deployment-frontendstatic)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Post-Deployment Verification](#post-deployment-verification)

---

## Render Deployment (Backend API)

### Prerequisites

- Render account (https://render.com)
- GitHub repository connected to Render
- PostgreSQL database (can be provisioned on Render)

### Step 1: Create a New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `Global-general-intelligence` repository

### Step 2: Configure Build Settings

| Setting            | Value                              |
|--------------------|------------------------------------|
| **Name**           | `nexus-api`                        |
| **Environment**    | `Node`                             |
| **Region**         | Select closest to your users       |
| **Branch**         | `main`                             |
| **Build Command**  | `npm install && npm run build`     |
| **Start Command**  | `npm start`                        |

### Step 3: Set Environment Variables

Navigate to **Environment** tab and add the following variables (see [Environment Variables](#environment-variables) section for details):

```bash
NODE_ENV=production
PORT=8080
NEXUS_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXUS_JWT_SECRET=your-random-secure-secret
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
NEXUS_LOG_LEVEL=info
NEXUS_RATE_LIMIT_ENABLED=true
```

### Step 4: Add PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name: `nexus-db`
3. Database: `nexus_production`
4. User: `nexus`
5. Copy the **Internal Database URL**
6. Add to `DATABASE_URL` environment variable in your Web Service

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Monitor logs for any errors
4. Once deployed, note your service URL: `https://nexus-api.onrender.com`

### Step 6: Enable Health Checks

1. In Web Service settings, go to **"Health & Alerts"**
2. Set Health Check Path: `/telemetry/health`
3. Enable Auto-Deploy from `main` branch

---

## Netlify Deployment (Frontend/Static)

### Prerequisites

- Netlify account (https://netlify.com)
- GitHub repository connected to Netlify

### Step 1: Create New Site

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select `Global-general-intelligence`

### Step 2: Configure Build Settings

| Setting              | Value                           |
|----------------------|---------------------------------|
| **Branch**           | `main`                          |
| **Build Command**    | `npm run build` (if applicable) |
| **Publish Directory**| `public` or `dist`              |

### Step 3: Set Environment Variables

Navigate to **Site settings** → **Environment variables**:

```bash
REACT_APP_NEXUS_API_URL=https://nexus-api.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Step 4: Deploy

1. Click **"Deploy site"**
2. Netlify will build and deploy automatically
3. Once deployed, note your site URL: `https://your-site.netlify.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Domain settings**
2. Add custom domain (e.g., `nexus.yourdomain.com`)
3. Update DNS records as instructed
4. Enable HTTPS (automatic with Let's Encrypt)

---

## Environment Variables

### Backend (Render)

#### Required Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=8080

# Authentication
NEXUS_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
NEXUS_JWT_SECRET=your-random-256-bit-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@host:5432/nexus_production

# Redis (Session/Cache)
REDIS_URL=redis://default:password@host:6379
```

#### Optional Variables

```bash
# Logging
NEXUS_LOG_LEVEL=info  # debug, info, warn, error

# Rate Limiting
NEXUS_RATE_LIMIT_ENABLED=true
NEXUS_RATE_LIMIT_MAX_REQUESTS=1000
NEXUS_RATE_LIMIT_WINDOW_MS=60000

# CORS (if frontend on different domain)
NEXUS_CORS_ORIGIN=https://your-site.netlify.app

# Role-Based Access Control
SEEDBRINGER_EMAILS=admin@example.com,lead@example.com
COUNCIL_EMAILS=member1@example.com,member2@example.com

# WebSocket
NEXUS_WS_HEARTBEAT_INTERVAL=30000

# Security
NEXUS_SESSION_SECRET=another-random-secret
NEXUS_COOKIE_SECURE=true
NEXUS_COOKIE_SAME_SITE=strict
```

### Frontend (Netlify)

```bash
# API Endpoint
REACT_APP_NEXUS_API_URL=https://nexus-api.onrender.com

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# Environment
REACT_APP_ENV=production
```

### Generating Secrets

Use a cryptographically secure random generator:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Database Setup

### PostgreSQL Schema Migration

After deploying the database, run migrations:

```bash
# Connect to Render PostgreSQL
psql $DATABASE_URL

# Run schema creation
\i database/schema.sql
```

**Sample Schema** (`database/schema.sql`):

```sql
CREATE TABLE IF NOT EXISTS agents (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  capabilities JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to VARCHAR(255) REFERENCES agents(id),
  parameters JSONB,
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry_metrics (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(255) REFERENCES agents(id),
  timestamp TIMESTAMP NOT NULL,
  metrics JSONB NOT NULL,
  tags JSONB
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_telemetry_agent_time ON telemetry_metrics(agent_id, timestamp DESC);
```

### Redis Setup

For Render, use **Upstash Redis** (free tier available):

1. Sign up at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Select region closest to your Render service
4. Copy the Redis URL
5. Add to `REDIS_URL` environment variable

---

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://nexus-api.onrender.com/telemetry/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "agents": { "total": 0, "active": 0 },
  "system": { "uptime_seconds": 120 }
}
```

### 2. Authentication Test

```bash
curl -X POST https://nexus-api.onrender.com/auth/oauth/google \
  -H "Content-Type: application/json" \
  -d '{"id_token": "your-test-token"}'
```

### 3. WebSocket Connection

```javascript
const ws = new WebSocket('wss://nexus-api.onrender.com/telemetry/stream?token=test');
ws.onopen = () => console.log('Connected!');
ws.onerror = (err) => console.error('Error:', err);
```

### 4. Monitor Logs

**Render:**
- Go to your service → **Logs** tab
- Monitor for errors or warnings

**Netlify:**
- Go to **Deploys** → Select deployment → **Deploy log**

---

## Troubleshooting

### Common Issues

#### 1. Build Fails on Render

**Error:** `Cannot find module 'typescript'`

**Solution:**
```bash
# Ensure typescript is in dependencies, not devDependencies
npm install --save typescript
```

#### 2. Database Connection Error

**Error:** `ECONNREFUSED` or `ENOTFOUND`

**Solution:**
- Verify `DATABASE_URL` is set correctly
- Use **Internal Database URL** from Render (not external)
- Check database is running in Render dashboard

#### 3. CORS Error on Frontend

**Error:** `Access-Control-Allow-Origin blocked`

**Solution:**
- Set `NEXUS_CORS_ORIGIN` to your Netlify URL
- Or configure CORS in server code:
  ```javascript
  app.use(cors({
    origin: process.env.NEXUS_CORS_ORIGIN || '*'
  }));
  ```

#### 4. OAuth Not Working

**Error:** `Invalid ID token`

**Solution:**
- Verify `NEXUS_GOOGLE_CLIENT_ID` matches Google Console
- Add authorized redirect URIs in Google Console:
  - `https://nexus-api.onrender.com/auth/callback`
  - `https://your-site.netlify.app`

---

## Scaling Considerations

### Horizontal Scaling (Render)

1. Go to your Web Service → **Settings**
2. Increase **Instance Count** (requires paid plan)
3. Consider Redis for session sharing across instances

### Caching Strategy

1. Enable Redis caching for frequently accessed data
2. Set appropriate TTL values:
   ```javascript
   cache.set('agents:list', data, 'EX', 300); // 5 minutes
   ```

### Database Optimization

1. Add indexes for common queries
2. Use connection pooling:
   ```javascript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000
   });
   ```

---

## Security Checklist

- [ ] Environment variables set (no hardcoded secrets)
- [ ] HTTPS enforced (automatic on Render/Netlify)
- [ ] Database uses internal URLs (not exposed externally)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Session secrets rotated regularly
- [ ] Logs do not contain sensitive data
- [ ] OAuth redirect URIs whitelisted in Google Console

---

## Next Steps

1. **Set up monitoring**: Use Render's built-in metrics or integrate with DataDog/New Relic
2. **Configure alerts**: Set up email/Slack notifications for service downtime
3. **Enable backups**: Configure automated database backups in Render
4. **CI/CD**: Enable auto-deploy on `main` branch commits
5. **Load testing**: Use tools like k6 or Artillery to test API performance

---

**For additional support:**
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- Nexus API Issues: https://github.com/hannesmitterer/Global-general-intelligence/issues

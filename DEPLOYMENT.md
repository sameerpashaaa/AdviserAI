# Deployment Guide — Adviser AI

## Overview

Adviser AI is designed to deploy to **Vercel**. This guide walks through the complete production setup.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Build environment |
| npm | 10+ | Package management |
| Vercel CLI | Latest | Deployment (optional) |
| Git | Any | Version control |

---

## 1. External Services Setup

### 1.1 Supabase (PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database**
3. Copy the **Connection String** (URI format)
4. Set as `DATABASE_URL` in your environment:
   ```
   DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres
   ```
   > **Note:** Use port `6543` (transaction pooler) for Vercel serverless functions.

### 1.2 Auth0

1. Create an application at [auth0.com](https://auth0.com) → **Regular Web Application**
2. Set **Allowed Callback URLs**: `https://yourdomain.com/auth/callback`
3. Set **Allowed Logout URLs**: `https://yourdomain.com`
4. Set **Allowed Web Origins**: `https://yourdomain.com`
5. Copy **Domain**, **Client ID**, **Client Secret**
6. Generate a 32+ char random secret for `AUTH0_SECRET`:
   ```bash
   openssl rand -hex 32
   ```

### 1.3 Upstash Redis (Rate Limiting)

1. Create a database at [console.upstash.com](https://console.upstash.com)
2. Select **REST API**
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 1.4 Vercel Blob (File Storage)

1. In Vercel dashboard → your project → **Storage → Connect Store → Blob**
2. Or run: `vercel blob add`
3. Copy `BLOB_READ_WRITE_TOKEN`

### 1.5 Resend (Email)

1. Create account at [resend.com](https://resend.com)
2. Add and verify your sending domain (DNS records provided)
3. Create an API key → copy as `RESEND_API_KEY`

### 1.6 Razorpay (Payments)

1. Create account at [razorpay.com](https://razorpay.com)
2. **Settings → API Keys** → Generate Key
3. Copy `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### 1.7 Google Gemini

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create an API key
3. Set as `GEMINI_API_KEY`

---

## 2. Vercel Deployment

### 2.1 Initial Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo in the [Vercel dashboard](https://vercel.com/new).

### 2.2 Environment Variables

Set all required variables in **Vercel Dashboard → Project → Settings → Environment Variables**:

```
# Database
DATABASE_URL=postgresql://...

# Auth0
AUTH0_SECRET=<32+ char random string>
AUTH0_BASE_URL=https://yourdomain.com
AUTH0_ISSUER_BASE_URL=https://yourapp.us.auth0.com
AUTH0_CLIENT_ID=<auth0_client_id>
AUTH0_CLIENT_SECRET=<auth0_client_secret>

# AI
GEMINI_API_KEY=<gemini_api_key>

# Rate limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=<token>

# Storage
BLOB_READ_WRITE_TOKEN=<vercel_blob_token>

# Email
RESEND_API_KEY=re_...

# Payments
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=<secret>

# Error tracking (optional)
SENTRY_DSN=https://...@sentry.io/...

# Logging
LOG_LEVEL=info
```

### 2.3 Build Configuration

The `next.config.ts` includes production security headers. No additional Vercel config is needed.

---

## 3. Database Migration

After deployment, push the database schema:

```bash
# From local machine with DATABASE_URL set:
npx drizzle-kit push

# Or generate and review SQL migrations first:
npx drizzle-kit generate
npx drizzle-kit migrate
```

> **Important:** Run migrations before your first user signs in.

---

## 4. Post-Deployment Checklist

- [ ] **Health check passes**: `GET https://yourdomain.com/api/health` returns `{ "status": "healthy" }`
- [ ] **Auth0 callback works**: Sign in via Auth0 redirects correctly
- [ ] **DB connection**: Health endpoint shows `database: { status: "up" }`
- [ ] **Redis connection**: Health endpoint shows `redis: { status: "up" }`
- [ ] **File upload**: Test profile picture upload
- [ ] **Email delivery**: Trigger a welcome email and verify delivery
- [ ] **Payment flow**: Run a test payment with Razorpay test keys
- [ ] **AI response**: Submit a query in the adviser and verify streaming response
- [ ] **Admin panel**: Visit `/admin` and confirm 403 for non-admin, access for admin role

---

## 5. Custom Domain

1. Vercel Dashboard → **Project → Settings → Domains → Add Domain**
2. Add DNS records as instructed
3. Update `AUTH0_BASE_URL` to your custom domain
4. Update Auth0 callback and logout URLs

---

## 6. Monitoring

### Health Endpoint

```
GET https://yourdomain.com/api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up", "ping": "PONG" },
    "gemini": { "status": "configured" }
  }
}
```

Set up an uptime monitor (e.g. UptimeRobot, Vercel Cron) to ping this endpoint every 5 minutes.

### Structured Logging

All API requests log to stdout as NDJSON in production. Use Vercel Log Drains to forward to your log aggregator (Datadog, Logtail, Loki, etc.):

**Vercel Dashboard → Project → Settings → Log Drains → Add Drain**

---

## 7. Rollback

```bash
# List recent deployments
vercel ls

# Promote a previous deployment
vercel rollback [deployment-url]
```

---

## 8. Environment Isolation

| Environment | Branch | Variables |
|---|---|---|
| Production | `main` | Vercel "Production" env vars |
| Staging | `develop` | Vercel "Preview" env vars |
| Local | — | `.env.local` |

Use separate Auth0 tenants, Razorpay test keys, and Supabase projects per environment.

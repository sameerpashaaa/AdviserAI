# Adviser AI — Elite Strategic Intelligence Platform

[![CI](https://github.com/your-org/adviser-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/adviser-ai/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

> **Democratizing world-class strategic advisory with AI.** Get McKinsey-grade insights, market research, business validation, and expert strategy in minutes.

---

## Overview

Adviser AI is a multi-agent AI platform that provides:

- 🔬 **Deep Research Engine** — multi-source parallel research with citation scoring
- 🎯 **Strategic Frameworks** — SWOT, PESTLE, Porter's Five Forces, BCG Matrix, automated with AI
- 🚀 **Business Validator** — VC-grade idea validation with TAM/SAM/SOM analysis
- 📈 **Trend Intelligence** — real-time trend detection across 50,000+ sources
- ⚠️ **Risk Assessment** — comprehensive risk registry with mitigation playbooks
- 💰 **Financial Modeling** — revenue projections, unit economics, LTV/CAC analysis
- 📋 **Report Generation** — boardroom-ready PDFs and executive presentations

---

## Architecture

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 App Router, React 19, TypeScript |
| **AI** | Google Gemini API (multi-agent orchestration) |
| **Database** | Supabase (PostgreSQL) + Drizzle ORM |
| **Auth** | Auth0 (`@auth0/nextjs-auth0`) |
| **Rate Limiting** | Upstash Redis |
| **File Storage** | Vercel Blob |
| **Email** | Resend |
| **Payments** | Razorpay Standard Checkout |
| **Deployment** | Vercel |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system diagram and data flow.

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (or Supabase project)
- Auth0 tenant
- Upstash Redis instance
- Vercel Blob store

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/adviser-ai.git
cd adviser-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in all required values (see table below)

# 4. Push database schema
npx drizzle-kit push

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase/PostgreSQL connection string |
| `AUTH0_SECRET` | ✅ | Random 32+ char secret for session encryption |
| `AUTH0_BASE_URL` | ✅ | Your app's base URL (e.g. `http://localhost:3000`) |
| `AUTH0_ISSUER_BASE_URL` | ✅ | Auth0 domain (e.g. `https://myapp.us.auth0.com`) |
| `AUTH0_CLIENT_ID` | ✅ | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | ✅ | Auth0 application client secret |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `UPSTASH_REDIS_REST_URL` | ⚠️ | Upstash Redis REST URL (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ | Upstash Redis REST token |
| `BLOB_READ_WRITE_TOKEN` | ⚠️ | Vercel Blob storage token |
| `RESEND_API_KEY` | ⚠️ | Resend email service API key |
| `RAZORPAY_KEY_ID` | ⚠️ | Razorpay payment gateway key ID |
| `RAZORPAY_KEY_SECRET` | ⚠️ | Razorpay payment gateway key secret |
| `SENTRY_DSN` | ❌ | Sentry error tracking DSN (optional) |
| `LOG_LEVEL` | ❌ | Log verbosity: `debug`, `info`, `warn`, `error` |

✅ = Required | ⚠️ = Required in production | ❌ = Optional

---

## Project Structure

```
adviser-ai/
├── app/                    # Next.js App Router pages and API routes
│   ├── admin/              # Admin panel (role-gated)
│   ├── api/                # API route handlers
│   │   ├── admin/          # Admin-only APIs (users, flags, usage)
│   │   ├── adviser/        # AI conversation endpoints
│   │   ├── health/         # Health check endpoint
│   │   ├── notifications/  # In-app notifications
│   │   └── settings/       # User profile & settings
│   ├── adviser/            # AI chat interface
│   ├── dashboard/          # Main dashboard
│   └── (legal)/            # Privacy policy, terms of service
│
├── components/             # Reusable React components
│   ├── layout/             # Navbar, sidebar, shell
│   └── ui/                 # Design system components
│
├── lib/                    # Server-side utilities
│   ├── agents/             # AI agent orchestration (do not modify)
│   ├── api/                # API middleware (handler, rateLimit, requireAdmin)
│   ├── db/                 # Drizzle schema, migrations, runtime queries
│   ├── auth.ts             # Auth0 session utilities
│   ├── email.ts            # Resend email helper
│   ├── logger.ts           # Structured JSON logger
│   ├── sentry.ts           # Sentry stub (replace with @sentry/nextjs)
│   └── subscriptionCache.ts # Redis-backed subscription tier cache
│
├── __tests__/              # Jest tests
├── .github/workflows/      # GitHub Actions CI
├── drizzle/                # Generated Drizzle migrations
├── public/                 # Static assets
├── ARCHITECTURE.md         # System architecture documentation
└── DEPLOYMENT.md           # Production deployment guide
```

---

## Development

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
npm test             # Run Jest tests
npm run build        # Production build
```

### Database

```bash
npx drizzle-kit push    # Push schema changes directly (dev/staging)
npx drizzle-kit generate # Generate migration files
npx drizzle-kit studio  # Open Drizzle Studio (visual DB browser)
```

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes, write tests
3. Ensure CI passes: `npm run type-check && npm run lint && npm test`
4. Submit a pull request to `main`

**Do not modify** agent orchestration logic in `lib/agents/`, prompt templates, pricing tier definitions, or core business rules without a design review.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete production deployment guide.

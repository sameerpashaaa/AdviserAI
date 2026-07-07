# Architecture — Adviser AI

## System Overview

Adviser AI is a multi-agent AI strategic advisory platform built on Next.js 16 App Router with Google Gemini as the underlying LLM. It uses a layered architecture: a React frontend communicates with Next.js API routes, which orchestrate AI agents and persist data to a PostgreSQL database via Drizzle ORM.

---

## Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Next.js as Next.js App Router
    participant withHandler as withHandler Middleware
    participant Redis as Upstash Redis
    participant DB as PostgreSQL (Supabase)
    participant Gemini as Google Gemini API

    Browser->>Next.js: HTTP Request (authenticated)
    Next.js->>withHandler: Route handler invoked
    withHandler->>Redis: Rate limit check (per user or IP)
    Redis-->>withHandler: ok / rate_limited
    withHandler->>withHandler: Zod schema validation
    withHandler->>DB: Auth0 session → DB user lookup
    DB-->>withHandler: User + subscription tier
    withHandler->>Gemini: AI agent orchestration (streaming SSE)
    Gemini-->>withHandler: Token stream
    withHandler->>DB: Persist conversation + messages + usage
    withHandler-->>Browser: SSE stream / JSON response
```

---

## Data Model

```mermaid
erDiagram
    organizations ||--o{ users : "has members"
    users ||--o{ userSettings : "has one"
    users ||--o{ workspaces : "owns"
    users ||--o{ conversations : "creates"
    users ||--o{ subscriptions : "has"
    users ||--o{ usageEvents : "generates"
    users ||--o{ notifications : "receives"
    workspaces ||--o{ conversations : "contains"
    conversations ||--o{ messages : "has"
    conversations ||--o{ reports : "generates"
    users ||--o{ auditLogs : "actor in"

    users {
        uuid id PK
        text email UK
        text name
        text avatar_url
        user_role role
        subscription_tier subscription_tier
        timestamp deleted_at
    }

    conversations {
        uuid id PK
        uuid user_id FK
        uuid workspace_id FK
        text title
        boolean pinned
        timestamp deleted_at
    }

    messages {
        uuid id PK
        uuid conversation_id FK
        message_role role
        text content
        int token_count
    }

    subscriptions {
        uuid id PK
        uuid user_id FK
        subscription_tier plan
        subscription_status status
        timestamp current_period_end
    }

    auditLogs {
        uuid id PK
        uuid user_id FK
        text action
        text resource_type
        jsonb old_value
        jsonb new_value
    }

    featureFlags {
        uuid id PK
        text name UK
        boolean enabled
        subscription_tier minimum_tier
    }
```

---

## AI Agent Pipeline

```
User Query
    │
    ▼
Intent Classifier (Gemini Flash)
    │ Classifies: research / strategy / validation / trend / career / finance / risk / report
    ▼
Agent Router
    │
    ├─► Research Agent     ──► Deep web research + citation scoring
    ├─► Strategy Agent     ──► SWOT/PESTLE/Porter's frameworks
    ├─► Validation Agent   ──► TAM/SAM/SOM + viability scoring
    ├─► Trend Agent        ──► Trend detection + opportunity mapping
    ├─► Career Agent       ──► Career planning + skills analysis
    ├─► Finance Agent      ──► Financial modeling + unit economics
    └─► Risk Agent         ──► Risk registry + mitigation playbooks
                │
                ▼
        Synthesis Agent (assembles multi-agent outputs)
                │
                ▼
        Response Stream (SSE to browser)
                │
                ▼
        DB Persistence (conversation, messages, usage, tokens, cost)
```

---

## Authentication Flow

```
Browser → /auth/login
    │
    ▼
Auth0 Universal Login
    │
    ▼
Auth0 Callback → /auth/callback
    │
    ▼
@auth0/nextjs-auth0 sets encrypted session cookie
    │
    ▼
getSessionFromCookiesAsync() in API routes
    │  (resolves Auth0 session OR custom base64 session cookie)
    ▼
DB lookup by email → internal user ID
    │
    ▼
Request handler proceeds with { userId, email, name }
```

---

## Rate Limiting

All API routes use distributed rate limiting via Upstash Redis:

- **Authenticated users**: keyed on `user:{userId}` → 30 req/min
- **Anonymous/IP fallback**: keyed on `ip:{clientIP}` → 10 req/min
- In-memory fallback is active when Upstash env vars are not set (development only)

---

## File Storage

File uploads (knowledge items, profile pictures) use **Vercel Blob**:

1. Client POSTs file to `/api/knowledge/upload` or `/api/avatar/upload`
2. API validates MIME type and file size
3. `@vercel/blob` stores file and returns a public CDN URL
4. URL is persisted to `knowledge_items.file_url` or `users.avatar_url`

---

## Email (Transactional)

Emails are sent via **Resend** (`lib/email.ts`):

- Welcome emails on first sign-in
- Notification digests
- System alerts

If `RESEND_API_KEY` is not set, all email sends are logged to console (development fallback).

---

## Subscription Tiers

| Tier | Monthly Queries | Reports | Features |
|---|---|---|---|
| Free | 20 | 3 | Basic agents |
| Pro | 200 | 50 | All agents + exports |
| Team | 1,000 | Unlimited | Multi-workspace + API |
| Enterprise | Custom | Custom | White-label + SLAs |

Tier limits are enforced server-side in `lib/agents/tierLimits.ts`.

---

## Security

| Control | Implementation |
|---|---|
| Auth | Auth0 (OAuth 2.0 / OIDC) |
| Rate limiting | Upstash Redis (distributed) |
| Input validation | Zod schemas on all endpoints |
| SQL injection | Drizzle ORM parameterized queries |
| XSS | `react-markdown` without `rehype-raw` |
| Security headers | CSP, HSTS, X-Frame-Options in `next.config.ts` |
| Admin access | Role check in DB (`users.role = admin`) |
| Soft deletes | `deleted_at` timestamp on all user data |
| Audit trail | `audit_logs` table for all sensitive mutations |

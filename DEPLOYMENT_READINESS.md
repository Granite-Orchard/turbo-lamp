# Deployment Readiness Report: Veen

> Generated assessment for deploying the web app to Vercel and the API to Digital Ocean.

---

## CRITICAL — Must Fix Before Deploy

### 1. Hardcoded API URL in web client

**File:** `apps/web/src/lib/api/config.ts:1`

```ts
export const BASE_URL = "http://localhost:3001/api/core/v1";
```

`NEXT_PUBLIC_API_URL` env var is defined in `.env.local` but never read by this file. The web app will always try to reach `localhost:3001`, even in production.

**Fix:** Read from `process.env.NEXT_PUBLIC_API_URL` with a fallback.

### 2. No `middleware.ts` — Route protection is inactive

**File:** `apps/web/src/proxy.ts`

`proxy.ts` contains Next.js middleware logic (session cookie check, route protection for `/dashboard` and `/onboarding`) but is not named `middleware.ts` and is not at the web app root. Next.js will not execute it.

**Fix:** Rename `proxy.ts` to `middleware.ts` and export the function as `middleware`.

### 3. No production database migrations

**Directory:** `apps/api/src/migrations/` (does not exist)

The TypeORM production config has `migrationsRun: true` but there are no migration files. The DB schema will not be managed automatically at startup in production.

**Fix:** Generate initial TypeORM migrations from existing entities and commit them.

---

## HIGH — Should Fix Before Deploy

### 4. No `vercel.json`

No Vercel configuration file exists. In a Turborepo monorepo, Vercel needs explicit root directory config to know which app to build.

**Fix:** Create `vercel.json` at the repo root with `rootDir: "apps/web"` and the appropriate build command.

### 5. Sentry tracesSampleRate is 1.0

**File:** `apps/api/src/instrument.ts:20`

```ts
tracesSampleRate: 1.0, //  Capture 100% of the transactions
```

Captures 100% of transactions in production. This will be expensive at scale.

**Fix:** Lower to `0.1` or `0.2` for production.

### 6. No Digital Ocean deployment config

No Procfile, app platform spec (`.do/app.yaml`), or deployment scripts exist. The only Docker config is a local `docker-compose.yml`.

**Fix:** Create a Digital Ocean App Platform spec or Dockerfile-based deployment configuration.

### 7. `npm` as a runtime dependency

**File:** `package.json:24`

```json
"dependencies": {
  "npm": "^11.13.0"
}
```

npm is a tool, not a library. This should be removed or moved to devDependencies.

---

## MEDIUM — Recommended

### 8. No shared packages

Turborepo is configured but no `@repo/*` packages exist. The monorepo structure adds overhead without shared code between the API and web app.

### 9. TypeScript strictness relaxed in API

**File:** `apps/api/tsconfig.json`

`noImplicitAny: false`, `strictBindCallApply: false`, `noFallthroughCasesInSwitch: false` — these reduce type safety.

### 10. Health check endpoint not referenced in deployment config

Health endpoints exist (`/health`, `/health/live`, `/health/ready`) but aren't referenced in any deployment configuration for liveness/readiness probes.

### 11. `.env` / `.env.local` files in working tree

Verify these are properly gitignored before pushing. The `env.example` files are sanitized, but real credentials exist in the local `.env` files.

---

## Vercel (Web App) — Setup Checklist

- [ ] Fix `config.ts` to read `NEXT_PUBLIC_API_URL` env var
- [ ] Rename `proxy.ts` → `middleware.ts` and export as `middleware`
- [ ] Create `vercel.json` with `rootDir: "apps/web"` for monorepo support
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel environment variables
- [ ] Ensure `next.config.ts` output mode is compatible (no static export needed)
- [ ] Configure environment variables for `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and any OAuth keys

## Digital Ocean (API) — Setup Checklist

- [ ] Create a Digital Ocean App Platform spec (`.do/app.yaml`) or equivalent
- [ ] Set up managed PostgreSQL and Redis instances
- [ ] Configure all env vars (20+ variables) in DO's dashboard
- [ ] Generate initial TypeORM migrations from entities
- [ ] Ensure Dockerfile healthcheck aligns with DO's health check probe
- [ ] Set `NODE_ENV=production` and reduce Sentry sample rate
- [ ] Configure CORS `ALLOWED_ORIGINS` to include the Vercel deployment URL

---

## Summary

| Area | Status |
|------|--------|
| API code quality | Ready (tests, linting, Sentry, health checks) |
| API deployment config | **Not ready** — no DO spec, no migrations |
| Web code quality | Ready (Next.js 16, React 19, shadcn/ui) |
| Web deployment config | **Not ready** — no vercel.json, broken API URL, no middleware |
| CI/CD | Partial — coverage + vulnerability scanning exist, no deploy pipeline |
| Secrets management | `.env` files exist locally; verify gitignore before deploy |

---

## Environment Variables Reference

### API (20+ required)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | Yes | Server port (default: 3001) |
| `ALLOWED_ORIGINS` | Yes | Comma-separated CORS origins |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_CACHE_URL` | Yes | Redis for caching |
| `REDIS_QUEUE_URL` | Yes | Redis for BullMQ job queues |
| `REDIS_THROTTLE_URL` | Yes | Redis for rate limiting |
| `JWT_PRIVATE` | Yes | RSA private key for JWT signing |
| `JWT_PUBLIC` | Yes | RSA public key for JWT verification |
| `API_SECRET` | Yes | API secret key |
| `TOKEN_TTL` | Yes | Token time-to-live |
| `FRONTEND_URL` | Yes | Frontend URL for redirects |
| `BACKEND_URL` | Yes | Backend URL |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Yes | Google OAuth callback URL |
| `SMTP_URL` | Yes | SMTP server URL |
| `SMTP_FROM_EMAIL` | Yes | SMTP sender email |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth client secret |
| `GITHUB_CALLBACK_URL` | Optional | GitHub OAuth callback URL |
| `RESEND_API_KEY` | Optional | Resend API key |
| `RESEND_FROM_EMAIL` | Optional | Resend sender email |
| `SENTRY_DSN` | Optional | Sentry error tracking DSN |

### Web

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL for client-side calls |
| `BETTER_AUTH_SECRET` | Yes | Auth secret |
| `BETTER_AUTH_URL` | Yes | Auth URL |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth client secret |

# opencode -s ses_fe84059d1ffepbrbfNHLs9qTe0

# Production Audit — Veen

Full production audit of the codebase and CI/CD/IaC. Stack: DigitalOcean App (API), Cloudflare (DNS), Vercel (frontend), Upstash (Redis), Supabase (DB), GitHub Actions (API deploy). Ordered by severity. All references are `file:line`.

## Critical

### 1. Session JWT expiry is ~42 days, not 1 hour (unit bug)

`expiresIn` is computed in milliseconds and passed as a numeric to `jsonwebtoken`, which interprets numeric values as **seconds**.

- Session token: `apps/api/src/modules/auth/auth.service.ts:138-146` passes `3,600,000` → valid ~42 days instead of 1 hour.
- Invitation/verification tokens inflated to ~19 years (`meeting-participants.service.ts:144`, `meeting-groups.service.ts:176`).
- OAuth states inflated to ~3.5 days instead of 5 min (`oauth-initiation.guard.ts:88`, `oauth-register-initiation.guard.ts:90`).

Worse, `sessions.expiresAt` (1h) is **never enforced at auth time** — `JwtStrategy` only checks the JWT signature/exp. Stolen tokens stay valid for weeks.

### 2. IDOR / broken object-level authorization (any authenticated user can read/modify others' data)

- `GET /meetings/:id` — `meetings.controller.ts:62-87` fetches by `{ id }` only; leaks attendee emails + group data of any meeting.
- `GET /meeting-groups/:id` — `meeting-groups.controller.ts:217-238` fetches by `{ id }` only; leaks any group incl. all participant emails and the 7-day magic link.
- `POST /meeting-participants` — `meeting-participants.controller.ts:37-54` lets anyone add participants to **any** group and set `authState: AUTHORIZED`, `invitationState`, `userId` — privilege escalation into groups they don't own.
- `GET /meeting-participants/meeting-group/:id` — `meeting-participants.controller.ts:56-75` enumerates emails of any group.
- `POST /meeting-attendees` — `meeting-attendees.controller.ts:31-47` no ownership check on `meetingId`.

The `magicLink` (7-day bearer invite URL) is returned in `MeetingGroupResponseDto:23` and becomes readable via the IDOR above.

### 3. Production emails will not be delivered

`.do/app.yaml:24-25` sets `RESEND_FROM_EMAIL=onboarding@resend.dev` — Resend's **sandbox** sender, which only sends to your own verified address. Real invite emails will fail for actual users. Failures are also silently swallowed: the email is sent from a fire-and-forget CQRS handler (`invitation-created.handler.ts`) with no retry or error surfacing.

### 4. `GET /api/core/v1/health/debug-sentry` is live in production

~~`health.controller.ts:29-33` throws an error on demand — anyone can spam it to burn Sentry quota and log volume. Gate it behind `NODE_ENV !== 'production'`.~~

**Resolved**: the `/debug-sentry` route was removed from `health.controller.ts`.

## High

### 5. No security headers / CSP on the frontend, plus a wide-open image optimizer

`next.config.ts` has no `headers()` — no CSP, no `frame-ancestors` (clickjacking). Combined with `dangerouslyAllowSVG: true` and `remotePatterns: [{ hostname: "*" }]`, the Next image optimizer will fetch SVGs from any host (SSRF/SVG-XSS surface). Restrict to known hosts (e.g. `lh3.googleusercontent.com`) and add security headers.

### 6. Brute-force protection on auth is not actually applied

`@Throttle({ default: { limit: 3, ttl: 60_000 } })` (`auth.controller.ts:42`) overrides a throttler named `default`, but the module only configures `short`/`medium`/`long` (`app.module.ts:127-133`). The override is silently ignored — login is only limited by the global 1000/hr. Add a named throttler for auth or use `@Throttle({ short: ... })`.

### 7. Logout is client-side only, sessions are never revocable

`logoutAction` just deletes the cookie (`apps/web/src/lib/api/auth.ts:7-11`). There's no server endpoint, and sessions are stored in the DB but never checked/invalidated. Compounds issue #1.

### 8. BullMQ on Upstash Redis is risky

Upstash's default eviction policy is `allkeys-lru` — under memory pressure it can silently evict job keys, dropping jobs. BullMQ also needs a Redis with `maxRetriesPerRequest: null` (set) and eviction policy `noeviction`. Verify the Upstash DB policy; this is a known footgun.

### 9. CI "Wait for health" doesn't verify the new deployment

`deploy-api.yml:54-74` runs `doctl apps create-deployment` (returns immediately) then polls the public URL, which still serves the old healthy instance during a rolling deploy. CI can pass while the new deploy failed and auto-rolled-back. Poll `doctl apps get-deployment <id>` for the target deployment's phase instead.

## Medium

### 10. Migrations run twice

`migrationsRun: isProduction` (`app.module.ts:68`) **and** the PRE_DEPLOY `migrate` job (`.do/app.yaml:50-59`). Redundant; a race on multi-instance boot. Pick one (keep the job, set `migrationsRun: false`).

### 11. `basic-xxs` (0.5 vCPU / 512 MB), single instance

NestJS + BullMQ workers + Sentry profiling + 3 Redis clients + TypeORM pool on 512 MB is OOM-prone, and with `instance_count: 1` every deploy has downtime. Consider `basic-s` and 2+ instances.

### 12. Mutable `latest` image tag for the API service and migrate job

`.do/app.yaml:34,56` — any manual DOCR push retags `latest` and changes what a re-deploy runs. Pin to `sha-<git-sha>`.

### 13. Accounts controller uses the wrong id

`findAllBy({ userId: req.user.id })` (`accounts.controller.ts:32,46,68,90`) compares the `userId` column against the account row id instead of `req.user.userId`; returns empty/wrong results.

### 14. Web app has zero tests and no CI

`ci.yml` only gates the API. Web has no lint/typecheck/build in CI, so broken frontend merges are caught only by Vercel's deploy-time build.

### 15. OAuth callback doesn't enforce verification expiry

`consume(state)` (`auth.controller.ts:134`) doesn't check `expiresAt`; only the JWT exp (inflated per #1) gates it.

## Low / hygiene

- **Actions not SHA-pinned** in workflows (all `@v4`/`@v3` tags) — supply-chain risk; pin to SHAs.
- **`/forgot-password` link exists but no page** (`login-client.tsx:127`).
- **`SMTP_FROM_EMAIL=noreply@mailhog.com`** placeholder left in the prod spec (unused, but confusing).
- **`@supabase/server`** dependency is unused; `passport-github2` etc. appear dead.
- **Waitlist idempotency key generated per call** (`waitlist.ts:9`) — `_rid` is a fresh UUID each retry, so idempotency never dedupes.
- **`emailVerified: false` on registration with no verification flow** — confirm this is intended.
- **`osv-scanner` sets `upload-sarif: false`** — findings don't surface in the GitHub Security tab (Trivy SARIF does).
- **README is the stock Turborepo template** — no ops/runbook for the prod stack.
- **`accounts`/`users` unit coverage** — the 80% gate uses `collectCoverageFrom` that omits most controllers, so IDOR endpoints are effectively untested.
- Minor: `availability_overrides.date` stored as varchar; `body-hash` in `cache.interceptor.ts` for non-GET is dead code (only GETs cached).

## What's done well

- No secrets committed; env files gitignored; Docker ignores them; secrets live in DO app-level env.
- RS256 JWT with issuer/audience verification; `@Exclude()` serialization + `whitelist`/`forbidNonWhitelisted` pipes.
- httpOnly + Secure + SameSite=Lax cookies (CSRF largely mitigated by same-site + domain scope).
- Trivy scan + OSV scanner + 80% coverage gate + reusable quality workflow.
- Non-root container user, healthchecks, migration pre-deploy job, concurrency-safe deploy.

## Suggested priority

1. Fix the `expiresIn` unit bug (pass strings or seconds) — it's the single highest-impact fix.
2. Add ownership checks to the 5 IDOR endpoints (enforce `authorId`/membership in `findOne`/`findAll`/`create`).
3. Change `RESEND_FROM_EMAIL` to a verified domain; make email sending retryable/observable.
4. ~~Disable `/health/debug-sentry` in prod~~ (removed); add real auth rate limits; add web security headers + restrict image hosts.
5. Make the deploy workflow wait on the actual deployment; pin image tags; size up the DO instance.

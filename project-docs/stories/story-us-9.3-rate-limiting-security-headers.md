# Story US-9.3: Rate limiting and security headers

| Field | Value |
|---|---|
| Epic | 9 — Polish, testing and launch |
| Status | review |
| PRD refs | NFR Security |
| Depends on | US-4.5 |
| Branch | `feature/us-9.3-rate-limiting-security-headers` |
| PR | #51 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** system owner,
**I want** rate limits on auth and order APIs and standard security headers,
**so that** abuse is limited and common attacks are mitigated.

## Acceptance criteria
1. Sensitive routes (`POST /api/orders`, `POST /api/owner/uploads`, auth-related routes) return 429 with a `Retry-After` header after the limit is exceeded.
2. Security headers are set globally: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options (or frame-ancestors), Referrer-Policy and Strict-Transport-Security in production.
3. Limits are configurable in one file and covered by unit tests.
4. The 429 response uses the standard error body.

## Tasks
- [ ] Rate limiter helper in `src/lib` (in-memory for MVP, Redis-compatible interface).
- [ ] Apply it in controllers via a wrapper.
- [ ] Add headers in `next.config` or middleware.

## Technical notes
- An in-memory limiter is per instance on Vercel; note this limitation and revisit post-MVP.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

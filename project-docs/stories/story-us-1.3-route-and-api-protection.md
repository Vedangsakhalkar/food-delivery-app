# Story US-1.3: Route and API protection

| Field | Value |
|---|---|
| Epic | 1 — Authentication and profile |
| Status | review |
| PRD refs | FR-3 |
| Depends on | US-0.5, US-1.2 |
| Branch | `feature/us-1.3-route-and-api-protection` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** system owner,
**I want** pages and APIs restricted by role,
**so that** users can only see and do what their role allows.

## Acceptance criteria
1. Given I am logged out, when I open a customer, owner or admin page, then I am redirected to `/login`.
2. Given I am logged in with the wrong role, then I see the access-denied page (mock S4).
3. Given a protected API is called without a session, it returns 401; with the wrong role, 403.
4. Middleware and API controllers use the same role rules (one shared config).

## Tasks
- [ ] Next.js middleware for page routes.
- [ ] Apply `requireUser(roles)` in controllers.
- [ ] Access-denied page.

## Technical notes
- Public pages: home, search, restaurant, login, signup, forgot-password, privacy.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

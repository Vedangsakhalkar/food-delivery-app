# Story US-1.4: Reset a forgotten password

| Field | Value |
|---|---|
| Epic | 1 — Authentication and profile |
| Status | ready-for-dev |
| PRD refs | FR-1 |
| Depends on | US-1.2 |
| Branch | `feature/us-1.4-password-reset` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** registered user,
**I want** to reset my password by email,
**so that** I can regain access to my account.

## Acceptance criteria
1. Given I enter my email at `/forgot-password`, then I always see the same confirmation message whether or not the account exists.
2. Given I open the emailed link, then I can set a new password (8+ chars) and am signed in or sent to login.
3. An expired or reused link shows a clear error with a way to request a new one.
4. Supabase redirect URLs include the reset-password page.

## Tasks
- [ ] Forgot-password page (mock A3).
- [ ] Reset-password page.
- [ ] Configure redirect URLs in Supabase (see auth-setup.md).

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

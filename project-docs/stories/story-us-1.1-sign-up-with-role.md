# Story US-1.1: Sign up with a role

| Field | Value |
|---|---|
| Epic | 1 — Authentication and profile |
| Status | ready-for-dev |
| PRD refs | FR-1, FR-3 |
| Depends on | US-0.5, US-0.6 |
| Branch | `feature/us-1.1-sign-up-with-role` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** new visitor,
**I want** to create an account as a customer or a restaurant owner,
**so that** I can order food or manage my restaurant.

## Acceptance criteria
1. Given I am on `/signup`, when I submit a valid name, phone, email, password (8+ chars) and choose Customer or Owner, then an account is created and I am told to confirm my email.
2. Given the email is already registered, then I see a clear error and no second account is created.
3. Given I try to submit the role `admin` (or any other value), the server rejects it with 422.
4. After first sign-in, a `users` row exists with my Supabase user id and the chosen role (created by `requireUser`/`ensureUser` from US-0.5, exposed through `GET /api/me`).
5. Validation errors show inline under each field (mock A2).

## Tasks
- [ ] Build the sign-up page with shadcn `Form`, `Input`, `RadioGroup`.
- [ ] Zod schema in `src/validators/auth.ts`.
- [ ] Role is passed in the sign-up metadata (`options.data.role`); whitelisting is done by `ensureUser` (US-0.5).
- [ ] `GET /api/me` controller returning the signed-in user.

## Technical notes
- Never trust a client-supplied role beyond the whitelist.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

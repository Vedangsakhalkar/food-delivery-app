# Story US-0.5: Auth and role-based access helpers

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | ready-for-dev |
| PRD refs | FR-3 |
| Depends on | US-0.3, US-0.4 |
| Branch | `feature/us-0.5-auth-and-rbac-helpers` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** server helpers that identify the user and enforce roles,
**so that** every protected API can reuse one tested mechanism.

## Acceptance criteria
1. `requireUser(roles?)` reads the Supabase cookie session (`@supabase/ssr`), verifies it with `supabase.auth.getUser`, loads the `users` row and returns it.
2. Missing or invalid session returns 401; a valid user with the wrong role returns 403.
3. A Supabase browser client and a server client exist in `src/lib`; the secret key is used only in server code.
4. Unit tests cover no session, wrong role and success.

## Tasks
- [ ] Create the Supabase clients.
- [ ] Implement `requireUser`.
- [ ] Write tests with a mocked Supabase client.

## Technical notes
- Roles: `customer`, `owner`, `admin`. Admins are created manually in the database.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

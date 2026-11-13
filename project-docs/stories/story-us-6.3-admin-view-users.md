# Story US-6.3: Admin views all users

| Field | Value |
|---|---|
| Epic | 6 — Admin |
| Status | ready-for-dev |
| PRD refs | FR-21 |
| Depends on | US-1.3 |
| Branch | `feature/us-6.3-admin-view-users` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** admin,
**I want** to see every registered user and their role,
**so that** I can support users.

## Acceptance criteria
1. Given I open `/admin/users`, then I see name, email, role and join date, read-only (mock M3).
2. I can filter by role and search by email.
3. Results are paginated; non-admins get 403.

## Tasks
- [ ] `GET /api/admin/users` and `adminService.listUsers`.
- [ ] Admin users page.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

# Story US-6.3: Admin views all users

| Field | Value |
|---|---|
| Epic | 6 — Admin |
| Status | done |
| PRD refs | FR-21 |
| Depends on | US-1.3 |
| Branch | `feature/us-6.3-admin-view-users` |
| PR | #45 |

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
- [x] `GET /api/admin/users` and `adminService.listUsers`.
- [x] Admin users page.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

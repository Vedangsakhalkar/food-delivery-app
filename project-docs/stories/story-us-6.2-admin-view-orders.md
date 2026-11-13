# Story US-6.2: Admin views all orders

| Field | Value |
|---|---|
| Epic | 6 — Admin |
| Status | review |
| PRD refs | FR-21 |
| Depends on | US-4.5 |
| Branch | `feature/us-6.2-admin-view-orders` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** admin,
**I want** to see every order in the system,
**so that** I can support users and monitor activity.

## Acceptance criteria
1. Given I open `/admin/orders`, then I see all orders newest first, read-only (mock M2).
2. I can filter by status and search by order code.
3. Results are paginated.
4. Non-admins get 403.

## Tasks
- [ ] `GET /api/admin/orders` and `adminService.listOrders`.
- [ ] Admin orders page.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

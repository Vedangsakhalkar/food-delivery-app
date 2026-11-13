# Story US-6.1: Admin disables and enables restaurants

| Field | Value |
|---|---|
| Epic | 6 — Admin |
| Status | review |
| PRD refs | FR-20 |
| Depends on | US-2.1, US-3.1 |
| Branch | `feature/us-6.1-admin-disable-enable-restaurants` |
| PR | #43 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** admin,
**I want** to disable or re-enable a restaurant with a reason,
**so that** I can remove problem restaurants without deleting data.

## Acceptance criteria
1. Given I open `/admin/restaurants`, then I see all restaurants with status (mock M1).
2. Given I disable a restaurant with a reason, then it disappears from home and search and ordering from it is refused (409).
3. Given I re-enable it, then it is visible and orderable again.
4. The owner sees a Disabled banner with the reason on `/owner/restaurant`.
5. Only role `admin` can call the admin APIs.

## Tasks
- [ ] `adminService` restaurant methods; `GET /api/admin/restaurants`, `PATCH /api/admin/restaurants/[id]`.
- [ ] Admin restaurants page with `Table`, `Dialog`.
- [ ] Server-side check of `is_disabled` in `placeOrder` (verify US-4.5 covers it; add a test).

## Technical notes
- Admins are created manually in the database.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

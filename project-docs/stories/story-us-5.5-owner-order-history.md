# Story US-5.5: Owner order history

| Field | Value |
|---|---|
| Epic | 5 — Order management |
| Status | review |
| PRD refs | FR-19 |
| Depends on | US-5.4 |
| Branch | `feature/us-5.5-owner-order-history` |
| PR | #42 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** restaurant owner,
**I want** to see my finished orders,
**so that** I can review past business.

## Acceptance criteria
1. Given I open `/owner/history`, then I see delivered, rejected and cancelled orders newest first (mock O6).
2. `GET /api/owner/orders?status=` accepts a comma list of statuses validated by Zod.
3. Results are paginated and limited to my restaurant.

## Tasks
- [ ] Extend the owner orders query with a status filter and pagination.
- [ ] History page with a shadcn `Table`.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

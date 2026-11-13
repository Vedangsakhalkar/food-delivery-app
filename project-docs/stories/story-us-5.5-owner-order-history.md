# Story US-5.5: Owner order history

| Field | Value |
|---|---|
| Epic | 5 — Order management |
| Status | done |
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
- [x] Extend the owner orders query with a status filter and pagination.
- [x] History page with a shadcn `Table`.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

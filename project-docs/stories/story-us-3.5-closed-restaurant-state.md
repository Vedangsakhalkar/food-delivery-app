# Story US-3.5: Closed restaurant state

| Field | Value |
|---|---|
| Epic | 3 — Restaurant discovery (customer) |
| Status | done |
| PRD refs | FR-8 |
| Depends on | US-3.4 |
| Branch | `feature/us-3.5-closed-restaurant-state` |
| PR | #32 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to see clearly when a restaurant is closed,
**so that** I do not try to order when I cannot.

## Acceptance criteria
1. Given the current IST time is outside `opens_at`-`closes_at`, then the restaurant page shows a Closed banner with opening time and disabled add buttons (mock C4).
2. The open/closed rule (including overnight hours) lives in one service function that is unit tested.
3. Given a restaurant is closed, `POST /api/orders` for it is refused with 409 (enforced in US-4.5 using the same function).
4. The home card shows a Closed badge.

## Tasks
- [x] `isOpenNow(restaurant, now)` in a service/util with tests for edge cases (midnight, overnight).
- [x] Closed banner and disabled states in the UI.

## Technical notes
- Time zone is IST for the MVP (single region).

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

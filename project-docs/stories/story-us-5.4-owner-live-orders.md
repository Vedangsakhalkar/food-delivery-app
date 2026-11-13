# Story US-5.4: Owner live orders and status updates

| Field | Value |
|---|---|
| Epic | 5 — Order management |
| Status | ready-for-dev |
| PRD refs | FR-19 |
| Depends on | US-4.5, US-1.3 |
| Branch | `feature/us-5.4-owner-live-orders` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** restaurant owner,
**I want** to see incoming orders and move them through the statuses,
**so that** customers get their food and know its progress.

## Acceptance criteria
1. Given I open `/owner/orders`, then I see active orders for my restaurant, polling every 10-15 seconds (mock O3).
2. I can Accept or Reject a `placed` order, then move accepted orders to Preparing, Out for Delivery and Delivered.
3. Invalid transitions (e.g. `placed` to `delivered`) return 409; I cannot change a cancelled or finished order.
4. I can only see and update orders of my own restaurant; others return 404.
5. Reject asks for a short reason (stored on the order).

## Tasks
- [ ] `orderService.updateStatus` using the shared state machine.
- [ ] `GET /api/owner/orders`, `PATCH /api/owner/orders/[id]/status`.
- [ ] Live orders page with action buttons (shadcn `Card`, `Button`, `Dialog`).

## Technical notes
- Add `rejection_reason` to `orders` via a migration if not present.
- Email triggers are added in US-8.2.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

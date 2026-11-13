# Story US-5.3: Cancel an order before acceptance

| Field | Value |
|---|---|
| Epic | 5 — Order management |
| Status | done |
| PRD refs | FR-16 |
| Depends on | US-5.2 |
| Branch | `feature/us-5.3-cancel-order` |
| PR | #40 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to cancel my order while it is still Placed,
**so that** I am not charged for food I no longer want.

## Acceptance criteria
1. Given my order is `placed`, then I see a Cancel order button; confirming it sets the status to `cancelled`.
2. Given the status is anything else, then there is no button and `POST /api/orders/[id]/cancel` returns 409.
3. The transition rule lives in the order status state machine (shared with US-5.4) and is unit tested.
4. Cancelling someone else's order returns 404.

## Tasks
- [x] Order status state machine in `orderService` (transition table, one place).
- [x] `POST /api/orders/[id]/cancel` and confirm `AlertDialog`.

## Technical notes
- The state machine is created here and reused by US-5.4.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

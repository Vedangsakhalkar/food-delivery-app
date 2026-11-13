# Story US-5.2: Order detail with live status

| Field | Value |
|---|---|
| Epic | 5 — Order management |
| Status | review |
| PRD refs | FR-14, FR-15 |
| Depends on | US-5.1 |
| Branch | `feature/us-5.2-order-detail-live-status` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to open an order and see its current status update by itself,
**so that** I know where my food is.

## Acceptance criteria
1. Given I open `/orders/[id]`, then I see items, address snapshot, totals, payment method (COD) and a status timeline (mock C9).
2. The page polls `GET /api/orders/[id]` every 10-15 seconds and stops polling on a final status.
3. Another customer's order id returns 404.
4. Statuses shown: Placed, Accepted, Preparing, Out for Delivery, Delivered, Rejected, Cancelled.

## Tasks
- [ ] `orderService.getForCustomer`.
- [ ] `GET /api/orders/[id]`.
- [ ] Order detail page with polling hook and timeline built from shadcn `Badge`/`Separator`.

## Technical notes
- Pause polling when the tab is hidden.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

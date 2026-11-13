# Story US-5.1: Customer order history

| Field | Value |
|---|---|
| Epic | 5 — Order management |
| Status | in-progress |
| PRD refs | FR-15 |
| Depends on | US-4.5 |
| Branch | `feature/us-5.1-customer-order-history` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to see my past and current orders,
**so that** I can track and revisit them.

## Acceptance criteria
1. Given I open `/orders`, then I see my orders newest first with code, restaurant, date, total and status (mock C8).
2. Only my own orders are returned.
3. Results are paginated with `limit` and `cursor`.
4. With no orders I see the empty state with a link to browse restaurants.

## Tasks
- [ ] `orderRepository.listByCustomer` (index `customer_id, created_at desc`).
- [ ] `GET /api/orders` and the orders page with a status `Badge`.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

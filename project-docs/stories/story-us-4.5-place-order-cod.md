# Story US-4.5: Place an order with cash on delivery

| Field | Value |
|---|---|
| Epic | 4 — Cart and checkout |
| Status | done |
| PRD refs | FR-12, FR-13 |
| Depends on | US-4.3, US-4.4, US-3.5 |
| Branch | `feature/us-4.5-place-order-cod` |
| PR | #37 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to choose an address and place my order with cash on delivery,
**so that** my food is prepared and delivered.

## Acceptance criteria
1. Given a valid cart and a chosen or new address, when I place the order, then `POST /api/orders` creates the order with status `placed` and returns its code (e.g. `TDK-10234`), and I see the confirmation page (mock C7).
2. The server rechecks everything: restaurant exists, is open and not disabled; every item exists, is available and belongs to that restaurant; quantities are 1-20; totals are recomputed.
3. Order, order items and the address are inserted in one transaction as snapshots (name, price, address).
4. Payment method is always `cod`; any other value is rejected with 422.
5. Failures return the standard error body with 409 (closed/unavailable) or 422 (invalid) and the cart is kept.
6. Only role `customer` may place orders.

## Tasks
- [x] Migration `orders` and `order_items` tables (RLS on, indexes from the architecture).
- [x] `orderRepository`, `orderService.placeOrder`, order code generator.
- [x] `POST /api/orders` controller with Zod schema.
- [x] Checkout page (mock C6) and confirmation page; clear the cart on success.

## Technical notes
- Emails are added in US-8.1 through a hook point in `placeOrder`; they must never fail the order.
- Rate limiting is added in US-9.4.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

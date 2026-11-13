# Story US-4.1: Add, remove and change items in the cart

| Field | Value |
|---|---|
| Epic | 4 — Cart and checkout |
| Status | in-progress |
| PRD refs | FR-9 |
| Depends on | US-3.4 |
| Branch | `feature/us-4.1-cart-add-remove-change` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to add dishes to a cart and change quantities,
**so that** I can build my order.

## Acceptance criteria
1. Given I click Add on an available item, then it appears in the cart with quantity 1; the header shows the item count.
2. Given I change quantity (1 to 20) or remove an item, then the cart and totals update immediately (mock C5).
3. The cart persists across page refresh (local storage) and is cleared after a successful order or on log out.
4. Given I am a guest and click Add, then I am prompted to log in and returned to the restaurant afterwards.
5. The cart stores only item id, quantity and restaurant id; prices shown are refreshed from the server.

## Tasks
- [ ] Cart store (React context + reducer) and `useCart` hook.
- [ ] Cart page and header cart indicator (shadcn `Sheet`/`Button`, `Badge`).
- [ ] Unit tests for the cart reducer.

## Technical notes
- Cart is client-side only; the server never trusts it (see US-4.5).

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

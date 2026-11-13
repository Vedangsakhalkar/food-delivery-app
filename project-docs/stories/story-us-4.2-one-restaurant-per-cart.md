# Story US-4.2: One restaurant per cart

| Field | Value |
|---|---|
| Epic | 4 — Cart and checkout |
| Status | done |
| PRD refs | FR-10 |
| Depends on | US-4.1 |
| Branch | `feature/us-4.2-one-restaurant-per-cart` |
| PR | #34 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to be told when I add an item from a different restaurant,
**so that** I never mix restaurants in one order.

## Acceptance criteria
1. Given my cart has items from restaurant A, when I add an item from restaurant B, then a dialog asks whether to clear the cart and start a new one (mock dialogs).
2. Given I confirm, the cart is replaced with the new item; given I cancel, the cart is unchanged.
3. The cart header shows which restaurant it belongs to.
4. The rule is in the cart reducer and also enforced by the server in US-4.5.

## Tasks
- [x] Add the restaurant guard to the cart reducer.
- [x] Replace-cart confirmation `AlertDialog`.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

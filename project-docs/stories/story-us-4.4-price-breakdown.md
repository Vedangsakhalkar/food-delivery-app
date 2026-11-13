# Story US-4.4: Subtotal, taxes, delivery fee and total

| Field | Value |
|---|---|
| Epic | 4 — Cart and checkout |
| Status | done |
| PRD refs | FR-11 |
| Depends on | US-4.2 |
| Branch | `feature/us-4.4-price-breakdown` |
| PR | #36 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to see subtotal, taxes, delivery fee and total,
**so that** I know exactly what I will pay.

## Acceptance criteria
1. Given items in the cart, then the cart and checkout show subtotal, tax, delivery fee and total in rupees (mocks C5, C6).
2. Tax rate and delivery fee are fixed constants in one config file (architecture decision).
3. All maths uses integer paise with a single rounding rule, implemented once in `pricingService` and unit tested.
4. `POST /api/quote` (or the order endpoint) recomputes totals from database prices so the UI never relies on client prices.

## Tasks
- [x] `pricingService.calculate(items)` and config constants.
- [x] Quote endpoint used by the cart and checkout pages.
- [x] Totals summary component.

## Technical notes
- The same `pricingService` is used when the order is placed (US-4.5).

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

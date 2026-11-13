# Story US-3.4: View a restaurant and its menu

| Field | Value |
|---|---|
| Epic | 3 — Restaurant discovery (customer) |
| Status | ready-for-dev |
| PRD refs | FR-8 |
| Depends on | US-3.1, US-2.4 |
| Branch | `feature/us-3.4-view-restaurant-and-menu` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** visitor,
**I want** to open a restaurant and read its menu,
**so that** I can decide what to order.

## Acceptance criteria
1. Given I open `/restaurants/[id]`, then I see the restaurant's details and its menu grouped by category (mock C3).
2. Unavailable items are shown greyed out and cannot be added.
3. Veg items show a veg indicator; prices use the money formatter.
4. A disabled or unknown restaurant returns 404 for public users.
5. `GET /api/restaurants/[id]` returns restaurant plus categories and items in one response.

## Tasks
- [ ] `restaurantService.getWithMenu` and repository query.
- [ ] Restaurant page with `Tabs`/sections, `Card`, `Badge`.
- [ ] Add-to-cart buttons are rendered but wired in US-4.1.

## Technical notes
- Reviews section is added in US-7.2.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

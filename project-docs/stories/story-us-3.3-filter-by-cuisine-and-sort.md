# Story US-3.3: Filter by cuisine and sort

| Field | Value |
|---|---|
| Epic | 3 — Restaurant discovery (customer) |
| Status | ready-for-dev |
| PRD refs | FR-7 |
| Depends on | US-3.1 |
| Branch | `feature/us-3.3-filter-by-cuisine-and-sort` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** visitor,
**I want** to filter restaurants by cuisine and sort them,
**so that** I can narrow down choices.

## Acceptance criteria
1. Given I pick one or more cuisines, then only matching restaurants are listed.
2. Given I sort by rating or delivery time, then the list reorders accordingly (rating high to low, delivery time low to high).
3. Filters and sort are reflected in the URL query string so the page can be shared and survives refresh.
4. Restaurants without ratings sort after rated ones when sorting by rating.
5. Invalid sort or filter values return 422.

## Tasks
- [ ] Extend `GET /api/restaurants` with `cuisine` and `sort` params and Zod validation.
- [ ] `GET /api/restaurants/cuisines` returning distinct cuisines of active restaurants.
- [ ] Filter chips/`Select` on the home page.

## Technical notes
- Rating data arrives in epic 7; until then `avg_rating` is 0 and the sort is a no-op in practice.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

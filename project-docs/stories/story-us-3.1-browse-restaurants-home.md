# Story US-3.1: Browse restaurants on the home page

| Field | Value |
|---|---|
| Epic | 3 — Restaurant discovery (customer) |
| Status | review |
| PRD refs | FR-5 |
| Depends on | US-2.1 |
| Branch | `feature/us-3.1-browse-restaurants-home` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** visitor (guest or customer),
**I want** to see the restaurants available to order from,
**so that** I can pick somewhere to eat.

## Acceptance criteria
1. Given I open `/` without logging in, then I see restaurant cards with image, name, cuisine, rating and delivery time (mock C1/C1b).
2. Disabled restaurants never appear in the list.
3. Results are paginated with `limit` and `cursor`; a Load more control fetches the next page.
4. While loading I see skeletons; with no restaurants I see the empty state (mock S1).
5. `GET /api/restaurants` is public.

## Tasks
- [ ] `restaurantRepository.listActive` with keyset pagination.
- [ ] `GET /api/restaurants` controller and `restaurantService.list`.
- [ ] Home page and restaurant card (shadcn `Card`, `Badge`, `Skeleton`).

## Technical notes
- Restaurants with no ratings show 'New' instead of a rating.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

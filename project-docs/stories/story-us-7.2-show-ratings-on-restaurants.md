# Story US-7.2: Show ratings and reviews on restaurants

| Field | Value |
|---|---|
| Epic | 7 — Ratings and reviews |
| Status | in-progress |
| PRD refs | FR-7, FR-22 |
| Depends on | US-7.1, US-3.3 |
| Branch | `feature/us-7.2-show-ratings-on-restaurants` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** visitor,
**I want** to see ratings and reviews for a restaurant,
**so that** I can trust my choice.

## Acceptance criteria
1. Restaurant cards and the restaurant page show the average rating and review count.
2. `GET /api/restaurants/[id]/reviews` is public and returns reviews newest first, paginated, with reviewer first name and date.
3. The home page sort by rating (US-3.3) now uses real data.
4. A restaurant with no reviews shows 'New'.

## Tasks
- [ ] `GET /api/restaurants/[id]/reviews`.
- [ ] Reviews section on the restaurant page.

## Technical notes
- Do not expose reviewer email or full name.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

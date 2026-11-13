# Story US-2.1: Owner creates a restaurant

| Field | Value |
|---|---|
| Epic | 2 — Restaurant and menu management (owner) |
| Status | ready-for-dev |
| PRD refs | FR-17 |
| Depends on | US-1.3, US-0.6 |
| Branch | `feature/us-2.1-owner-creates-restaurant` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** restaurant owner,
**I want** to create my restaurant profile after signing up,
**so that** it goes live and I can add a menu.

## Acceptance criteria
1. Given I am a signed-in owner with no restaurant, when I open `/owner`, then I see the welcome screen with a Create restaurant action (mock O1).
2. Given I submit a valid name, cuisine, address, opening and closing time and delivery time in minutes, then the restaurant is created, is live immediately (no approval) and I land on `/owner/restaurant`.
3. Given I already have a restaurant, `POST /api/owner/restaurant` returns 409 (one restaurant per owner).
4. Invalid input (empty name, closing time equal to opening time, delivery time not a positive integer) shows inline errors and returns 422.
5. Only users with role `owner` can call the owner restaurant APIs; customers get 403.

## Tasks
- [ ] Migration `restaurants` table (architecture section 5) with indexes on `cuisine` and `lower(name)`, RLS enabled with no policies.
- [ ] `Restaurant` model, `restaurantRepository`, `restaurantService.create`.
- [ ] `GET/POST /api/owner/restaurant` with Zod schema in `src/validators/restaurant.ts`.
- [ ] Owner welcome page and create form (shadcn `Card`, `Form`, `Input`, `Select`).

## Technical notes
- Opening hours are stored as `opens_at`/`closes_at` (time, IST). Overnight hours (closing before opening) are allowed.
- Image upload is added in US-2.2; this story creates the restaurant without an image.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

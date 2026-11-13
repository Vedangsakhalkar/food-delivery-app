# Story US-7.1: Rate and review a delivered order

| Field | Value |
|---|---|
| Epic | 7 — Ratings and reviews |
| Status | ready-for-dev |
| PRD refs | FR-22 |
| Depends on | US-5.2, US-5.4 |
| Branch | `feature/us-7.1-rate-and-review-order` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** customer,
**I want** to rate (1-5) and review a restaurant after my order is delivered,
**so that** others can choose better and the restaurant gets feedback.

## Acceptance criteria
1. Given my order is `delivered` and unreviewed, then the order page shows a Rate button leading to `/orders/[id]/review` (mock C10).
2. Given I submit a rating 1-5 and an optional comment (max 500 chars), then the review is saved and the restaurant's `avg_rating` and `rating_count` update in the same transaction.
3. A second review for the same order returns 409 (one review per order, enforced by a unique constraint).
4. A review for an order that is not mine or not delivered is refused (404 / 409).

## Tasks
- [ ] Migration `reviews` table (RLS on, unique `order_id`).
- [ ] `reviewRepository`, `reviewService.create` with transaction.
- [ ] `POST /api/orders/[id]/review` and the review page (shadcn `RadioGroup`/`Textarea`).

## Technical notes
- Recalculate the average from stored reviews or increment atomically; avoid race conditions.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

# Story US-3.2: Search restaurants and dishes

| Field | Value |
|---|---|
| Epic | 3 — Restaurant discovery (customer) |
| Status | review |
| PRD refs | FR-6 |
| Depends on | US-3.1, US-2.4 |
| Branch | `feature/us-3.2-search-restaurants-and-dishes` |
| PR | #29 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** visitor,
**I want** to search by restaurant name or dish,
**so that** I can quickly find what I want to eat.

## Acceptance criteria
1. Given I type in the search box and submit, then `/search?q=` shows matching restaurants and matching dishes with their restaurant (mock C2).
2. Matching is case-insensitive and tolerates partial words; an empty or one-character query is rejected with 422 or shows a hint.
3. Disabled restaurants and their dishes never appear.
4. No matches shows an empty state with a suggestion to clear the search.
5. `GET /api/search` is public and uses an index (trigram or full-text) on names.

## Tasks
- [ ] Migration adding the search index (`pg_trgm`) on restaurant and item names.
- [ ] `searchRepository` and `searchService`.
- [ ] `GET /api/search` and the `/search` page with a shadcn `Input` and result lists.

## Technical notes
- Debounce input in the UI (300 ms).

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

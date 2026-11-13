# Story US-9.4: End-to-end tests for key flows

| Field | Value |
|---|---|
| Epic | 9 — Polish, testing and launch |
| Status | ready-for-dev |
| PRD refs | Architecture 11 |
| Depends on | US-5.4 |
| Branch | `feature/us-9.4-e2e-tests` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** Playwright tests for the main journeys,
**so that** regressions in the core flow are caught before release.

## Acceptance criteria
1. A Playwright suite covers: sign up and sign in, browse and search, add to cart and place a COD order, owner accepts and delivers, customer sees the update.
2. Tests run against a test database seeded with known data and are runnable with one command.
3. The suite runs in CI (as a separate job or on `release/dev`) and failures upload traces.

## Tasks
- [ ] Configure Playwright and a test environment.
- [ ] Write the journeys above.
- [ ] Wire into GitHub Actions.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

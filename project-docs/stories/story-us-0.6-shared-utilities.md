# Story US-0.6: Shared utilities and base UI

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | ready-for-dev |
| PRD refs | NFR Usability |
| Depends on | US-0.1, US-0.4 |
| Branch | `feature/us-0.6-shared-utilities` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** shared helpers and a base layout,
**so that** feature stories do not duplicate formatting, API-call and layout code.

## Acceptance criteria
1. Helpers exist for formatting money (paise to rupees), dates and IST time.
2. A typed `apiFetch` wrapper calls `/api` and throws a typed error from the standard error body.
3. A root layout with header, container and toast provider (shadcn `Sonner`/`Toast`) renders on every page.
4. `not-found` and `error` pages exist (mock S4).

## Tasks
- [ ] Add utils in `src/lib`.
- [ ] Install shadcn `sonner`, `skeleton`, `card`.
- [ ] Build the layout and error pages.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

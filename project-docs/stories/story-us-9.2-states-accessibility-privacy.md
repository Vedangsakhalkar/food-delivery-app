# Story US-9.2: Loading, empty, error states and accessibility pass

| Field | Value |
|---|---|
| Epic | 9 — Polish, testing and launch |
| Status | in-progress |
| PRD refs | NFR Usability |
| Depends on | US-7.2, US-5.5, US-6.3 |
| Branch | `feature/us-9.2-states-accessibility-privacy` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** user,
**I want** consistent loading, empty and error states and an accessible interface,
**so that** the app feels reliable and usable for everyone.

## Acceptance criteria
1. Every list and detail page has a skeleton loader, an empty state and an error state (mock S1-S4).
2. A `/privacy` page exists and is linked from the footer.
3. Pages meet WCAG AA basics: keyboard navigation, visible focus, labels on inputs, colour contrast, alt text.
4. Layouts work from 360 px wide to desktop.
5. An automated accessibility check (e.g. axe) runs on key pages with no critical issues.

## Tasks
- [ ] Audit every page against the checklist and fix gaps.
- [ ] Add `/privacy` page and footer.
- [ ] Add axe checks to the e2e suite when US-9.4 exists, or run manually.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

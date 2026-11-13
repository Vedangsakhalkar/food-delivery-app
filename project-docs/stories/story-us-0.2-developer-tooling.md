# Story US-0.2: Set up developer tooling

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | done |
| PRD refs | NFR Maintainability |
| Depends on | US-0.1 |
| Branch | `feature/us-0.2-developer-tooling` |
| PR | #12 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** linting, formatting and testing tools configured,
**so that** code quality is consistent and checked automatically.

## Acceptance criteria
1. `npm run lint`, `npm run typecheck`, `npm run format:check` and `npm test` all run and pass on a clean checkout.
2. ESLint and Prettier share one config; Prettier-conflicting lint rules are disabled.
3. Vitest is configured with one passing sample test in `src/services`.
4. A pre-commit hook (lint-staged) formats and lints staged files.

## Tasks
- [x] Configure ESLint, Prettier, Vitest.
- [x] Add npm scripts.
- [x] Add Husky and lint-staged.

## Technical notes
- Strict TypeScript; no `any` without a comment.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

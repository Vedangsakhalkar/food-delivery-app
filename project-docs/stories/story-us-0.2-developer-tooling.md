# Story US-0.2: Set up developer tooling

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | review |
| PRD refs | NFR Maintainability |
| Depends on | US-0.1 |
| Branch | `feature/us-0.2-developer-tooling` |
| PR | — |

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
- [ ] Configure ESLint, Prettier, Vitest.
- [ ] Add npm scripts.
- [ ] Add Husky and lint-staged.

## Technical notes
- Strict TypeScript; no `any` without a comment.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

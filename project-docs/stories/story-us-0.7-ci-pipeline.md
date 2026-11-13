# Story US-0.7: CI pipeline

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | done |
| PRD refs | Architecture 9 |
| Depends on | US-0.2 |
| Branch | `feature/us-0.7-ci-pipeline` |
| PR | #17 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** a GitHub Actions pipeline on pull requests,
**so that** broken code cannot be merged into `release/dev`.

## Acceptance criteria
1. A workflow runs on every PR into `release/dev`: install, lint, typecheck, test, build.
2. The workflow fails the PR if any step fails.
3. No secrets are required for the pipeline to pass (tests use mocks).

## Tasks
- [x] Add `.github/workflows/ci.yml`.
- [x] Document the status check in the README.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

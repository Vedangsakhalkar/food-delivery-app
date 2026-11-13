# Story US-0.7: CI pipeline

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | review |
| PRD refs | Architecture 9 |
| Depends on | US-0.2 |
| Branch | `feature/us-0.7-ci-pipeline` |
| PR | — |

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
- [ ] Add `.github/workflows/ci.yml`.
- [ ] Document the status check in the README.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

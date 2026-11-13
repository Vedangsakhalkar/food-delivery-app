# Story US-0.4: Error handling, logging and health check

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | done |
| PRD refs | Architecture 8 |
| Depends on | US-0.3 |
| Branch | `feature/us-0.4-error-handling-logging-and-health` |
| PR | #14 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** a standard error model, structured logging and a health endpoint,
**so that** every API fails in the same predictable way and problems are visible.

## Acceptance criteria
1. Domain errors (`NotFoundError`, `ForbiddenError`, `ConflictError`, `ValidationError`) exist in `src/lib/errors.ts`.
2. A `handleError` wrapper turns them into `{ "error": { "code", "message", "details?" } }` with the right status (400, 401, 403, 404, 409, 422, 500).
3. Unexpected errors return 500 with a generic message and are logged with a request id; no stack traces reach the client.
4. `GET /api/health` returns 200 and confirms database connectivity.

## Tasks
- [x] Create errors, handler and logger in `src/lib`.
- [x] Add the health route.
- [x] Unit test the error mapping.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

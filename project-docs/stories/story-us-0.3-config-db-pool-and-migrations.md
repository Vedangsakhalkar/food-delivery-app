# Story US-0.3: Typed config, database pool and migrations

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | review |
| PRD refs | Architecture 8, 10 |
| Depends on | US-0.1 |
| Branch | `feature/us-0.3-config-db-pool-and-migrations` |
| PR | #13 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** validated environment config, a shared PostgreSQL pool and a migration runner,
**so that** services can reach the database safely and the schema is versioned.

## Acceptance criteria
1. `src/lib/env.ts` validates all required env vars with Zod and the app fails fast with a clear message if one is missing.
2. `src/lib/db.ts` exports one `pg` pool that uses `DATABASE_URL` with a small max size (serverless friendly, no prepared statements).
3. `npm run db:migrate` applies SQL files from `db/migrations` in order using `DATABASE_URL_MIGRATIONS` and records them in a migrations table.
4. The first migration creates the `users` table and enables Row Level Security on it with no policies.
5. Secret values never appear in client bundles or logs.

## Tasks
- [ ] Write `env.ts` and `db.ts`.
- [ ] Write the migration runner script.
- [ ] Add migration `0001_users.sql` (RLS on).

## Technical notes
- Every future table migration must enable RLS (see architecture review).

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

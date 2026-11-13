# Story US-9.1: Seed demo restaurants and menus

| Field | Value |
|---|---|
| Epic | 9 — Polish, testing and launch |
| Status | done |
| PRD refs | Roadmap |
| Depends on | US-2.4 |
| Branch | `feature/us-9.1-seed-demo-data` |
| PR | #50 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** a seed script that fills demo restaurants and menus,
**so that** the app can be demoed and tested with realistic data.

## Acceptance criteria
1. `npm run db:seed` creates a demo owner, 6-10 restaurants across several cuisines with categories, items and images.
2. The script is idempotent: running it twice does not duplicate data.
3. It refuses to run when `NODE_ENV=production` unless explicitly forced.
4. Seed images are uploaded to Storage bucket `images` or use stable public URLs.

## Tasks
- [x] `db/seed.ts` using repositories/services.
- [x] npm script and docs in the README.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

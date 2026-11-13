# Story US-0.1: Bootstrap the Next.js project

| Field | Value |
|---|---|
| Epic | 0 — Foundation and scaffolding |
| Status | done |
| PRD refs | Roadmap 8.1-8.5 |
| Depends on | none |
| Branch | `feature/us-0.1-bootstrap-project` |
| PR | #11 |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** developer,
**I want** a working Next.js (App Router) project with Tailwind and shadcn/ui,
**so that** every later story starts from a consistent, running base.

## Acceptance criteria
1. `npm run dev` starts the app and the home page renders without errors.
2. The project uses TypeScript in strict mode, Tailwind CSS and the `src/` directory.
3. shadcn/ui is initialised; `src/components/ui` exists and `Button` is installed via the shadcn CLI.
4. The folders `src/models`, `src/repositories`, `src/services`, `src/validators`, `src/lib`, `src/types` and `db/migrations` exist.
5. `.env.local` is git-ignored and an `.env.example` lists every variable with empty values.

## Tasks
- [x] Run `npx create-next-app@latest` (TypeScript, Tailwind, ESLint, App Router, `src/`).
- [x] Run `npx shadcn@latest init` and add `button`.
- [x] Create the folder structure from architecture.md section 3.
- [x] Add `.env.example`.

## Technical notes
- Follow CLAUDE.md UI rules: shadcn/ui components only.
- Dependencies: `pg`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `resend`.

## Definition of done
- [x] All acceptance criteria met and demonstrated
- [x] Unit tests for services and validators; CI green
- [x] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [x] PR reviewed, issues resolved, merged into `release/dev`
- [x] `stories.yaml` and this file set to `done`

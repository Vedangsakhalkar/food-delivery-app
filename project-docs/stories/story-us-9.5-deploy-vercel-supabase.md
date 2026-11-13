# Story US-9.5: Deploy to Vercel and Supabase production

| Field | Value |
|---|---|
| Epic | 9 — Polish, testing and launch |
| Status | ready-for-dev |
| PRD refs | Architecture 11 |
| Depends on | US-9.2, US-9.3, US-9.4 |
| Branch | `feature/us-9.5-deploy-vercel-supabase` |
| PR | — |

> Status is the source of truth in `project-docs/stories.yaml`. Keep both in sync (see `story-management-rules.md`).

## User story
**As a** team,
**I want** the app deployed to production,
**so that** real users can use it.

## Acceptance criteria
1. A production Supabase project exists with migrations applied and Storage bucket `images` created.
2. The Next.js app is deployed on Vercel with all environment variables set (no secrets in the repo).
3. Supabase Site URL and redirect URLs point to the production domain; Resend sender domain is verified.
4. A smoke test passes in production: sign up, browse, place order, owner accepts.
5. `main` is updated from `release/dev` through a PR.

## Tasks
- [ ] Create production project and run migrations.
- [ ] Configure Vercel and environment variables.
- [ ] Write a short runbook in `project-docs/`.

## Technical notes
- Never commit secrets; rotate any key that was shared in chat.

## Definition of done
- [ ] All acceptance criteria met and demonstrated
- [ ] Unit tests for services and validators; CI green
- [ ] Follows MVC layering and CLAUDE.md rules (shadcn/ui only, no DB access outside repositories)
- [ ] PR reviewed, issues resolved, merged into `release/dev`
- [ ] `stories.yaml` and this file set to `done`

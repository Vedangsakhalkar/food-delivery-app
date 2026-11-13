# Dabba

Food delivery web app (MVP). Next.js (App Router), Tailwind, shadcn/ui, Supabase, `pg`.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in (see `project-docs/auth-setup.md`).
3. `npm run db:migrate`, then (optional demo data) `npm run db:seed`
4. `npm run dev` and open http://localhost:3000

## Scripts
`dev`, `build`, `lint`, `typecheck`, `format:check`, `test`, `test:int` (integration tests against the dev database), `db:migrate`, `db:seed`.

### Demo data
`npm run db:seed` creates 8 demo restaurants (one demo owner each, e.g. `seed-owner-spice-route@dabba.test`) and `demo-customer@dabba.test`, all with password `Demo@12345`. It is idempotent and refuses to run when `NODE_ENV=production`.

## CI
GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request into `release/dev`: install, lint, typecheck, format check, test and build. No secrets are needed. Make the **CI / verify** check required in the repository's branch protection settings so failing PRs cannot be merged.

## Docs
Project docs live in `project-docs/` (PRD, user stories, architecture, mock-ups).

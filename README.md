# Foodzie

Food delivery web app (MVP). Next.js (App Router), Tailwind, shadcn/ui, Supabase, `pg`.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in (see `project-docs/auth-setup.md`).
3. `npm run db:migrate`, then (optional demo data) `npm run db:seed`
4. `npm run dev` and open http://localhost:3000

## Scripts
`dev`, `build`, `lint`, `typecheck`, `format:check`, `test`, `test:int` (integration tests against the dev database), `db:migrate`, `db:seed`.

### End-to-end tests
`npm run e2e` (Playwright) starts its own server and runs: accessibility (axe), mobile-width and security-header checks, and the full order journey (owner creates restaurant and menu, customer orders cash on delivery, owner accepts and delivers, customer reviews). The journey uses throwaway users created through the Supabase admin API and signs them in server-side; it needs `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and a database URL in `.env.local` and is skipped otherwise. If `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable key) is not set locally, run with `E2E_ALLOW_SECRET_AS_ANON=1` (localhost only, never in CI). In CI the journey runs when the `E2E_*` repository secrets in `.github/workflows/e2e.yml` are set.

### Demo data
`npm run db:seed` creates 16 demo restaurants with 107 dishes, each with an illustrated image (one demo owner each, e.g. `seed-owner-spice-route@dabba.test`) `demo-customer@dabba.test` and `demo-admin@dabba.test` (the admin panel login), all with password `Demo@12345`. Re-running it updates the demo data in place. It refuses to run when `NODE_ENV=production`.

## CI
GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request into `release/dev`: install, lint, typecheck, format check, test and build. No secrets are needed. Make the **CI / verify** check required in the repository's branch protection settings so failing PRs cannot be merged.

## Docs
Project docs live in `project-docs/` (PRD, user stories, architecture, mock-ups).

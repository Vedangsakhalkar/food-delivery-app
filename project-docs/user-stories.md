# User Stories — Food Delivery App (MVP)

Source: `prd.md`. Grouped into epics, scaffolding first. Story state lives in `stories.yaml`; detailed story files live in `stories/` (created per epic on request). Epics 0 and 1 are detailed; epics 2-9 are outlines.

| ID | Story | PRD refs | Status | File |
|---|---|---|---|---|
| | **Epic 0 — Foundation and scaffolding** | | | |
| US-0.1 | Bootstrap the Next.js project | Roadmap 8.1-8.5 | ready-for-dev | [story-us-0.1-bootstrap-project.md](stories/story-us-0.1-bootstrap-project.md) |
| US-0.2 | Set up developer tooling | NFR Maintainability | ready-for-dev | [story-us-0.2-developer-tooling.md](stories/story-us-0.2-developer-tooling.md) |
| US-0.3 | Typed config, database pool and migrations | Architecture 8, 10 | ready-for-dev | [story-us-0.3-config-db-pool-and-migrations.md](stories/story-us-0.3-config-db-pool-and-migrations.md) |
| US-0.4 | Error handling, logging and health check | Architecture 8 | ready-for-dev | [story-us-0.4-error-handling-logging-and-health.md](stories/story-us-0.4-error-handling-logging-and-health.md) |
| US-0.5 | Auth and role-based access helpers | FR-3 | ready-for-dev | [story-us-0.5-auth-and-rbac-helpers.md](stories/story-us-0.5-auth-and-rbac-helpers.md) |
| US-0.6 | Shared utilities and base UI | NFR Usability | ready-for-dev | [story-us-0.6-shared-utilities.md](stories/story-us-0.6-shared-utilities.md) |
| US-0.7 | CI pipeline | Architecture 9 | ready-for-dev | [story-us-0.7-ci-pipeline.md](stories/story-us-0.7-ci-pipeline.md) |
| | **Epic 1 — Authentication and profile** | | | |
| US-1.1 | Sign up with a role | FR-1, FR-3 | ready-for-dev | [story-us-1.1-sign-up-with-role.md](stories/story-us-1.1-sign-up-with-role.md) |
| US-1.2 | Sign in and sign out | FR-1, FR-2 | ready-for-dev | [story-us-1.2-sign-in-sign-out.md](stories/story-us-1.2-sign-in-sign-out.md) |
| US-1.3 | Route and API protection | FR-3 | ready-for-dev | [story-us-1.3-route-and-api-protection.md](stories/story-us-1.3-route-and-api-protection.md) |
| US-1.4 | Reset a forgotten password | FR-1 | ready-for-dev | [story-us-1.4-password-reset.md](stories/story-us-1.4-password-reset.md) |
| US-1.5 | Edit my profile | FR-4 | ready-for-dev | [story-us-1.5-edit-profile.md](stories/story-us-1.5-edit-profile.md) |
| | **Epic 2 — Restaurant and menu management (owner)** | | | |
| US-2.1 | Owner creates a restaurant | FR-17 | ready-for-dev | — |
| US-2.2 | Owner edits restaurant and uploads image | FR-17, FR-18a | ready-for-dev | — |
| US-2.3 | Owner manages menu categories | FR-18 | ready-for-dev | — |
| US-2.4 | Owner manages menu items with images | FR-18, FR-18a | ready-for-dev | — |
| | **Epic 3 — Restaurant discovery (customer)** | | | |
| US-3.1 | Browse restaurants on the home page | FR-5 | ready-for-dev | — |
| US-3.2 | Search restaurants and dishes | FR-6 | ready-for-dev | — |
| US-3.3 | Filter by cuisine and sort | FR-7 | ready-for-dev | — |
| US-3.4 | View a restaurant and its menu | FR-8 | ready-for-dev | — |
| US-3.5 | Closed restaurant state | FR-8 | ready-for-dev | — |
| | **Epic 4 — Cart and checkout** | | | |
| US-4.1 | Add, remove and change items in the cart | FR-9 | ready-for-dev | — |
| US-4.2 | One restaurant per cart | FR-10 | ready-for-dev | — |
| US-4.3 | Manage saved delivery addresses | FR-4, FR-12 | ready-for-dev | — |
| US-4.4 | Subtotal, taxes, delivery fee and total | FR-11 | ready-for-dev | — |
| US-4.5 | Place an order with cash on delivery | FR-12, FR-13 | ready-for-dev | — |
| | **Epic 5 — Order management** | | | |
| US-5.1 | Customer order history | FR-15 | ready-for-dev | — |
| US-5.2 | Order detail with live status | FR-14, FR-15 | ready-for-dev | — |
| US-5.3 | Cancel an order before acceptance | FR-16 | ready-for-dev | — |
| US-5.4 | Owner live orders and status updates | FR-19 | ready-for-dev | — |
| US-5.5 | Owner order history | FR-19 | ready-for-dev | — |
| | **Epic 6 — Admin** | | | |
| US-6.1 | Admin disables and enables restaurants | FR-20 | ready-for-dev | — |
| US-6.2 | Admin views all orders | FR-21 | ready-for-dev | — |
| US-6.3 | Admin views all users | FR-21 | ready-for-dev | — |
| | **Epic 7 — Ratings and reviews** | | | |
| US-7.1 | Rate and review a delivered order | FR-22 | ready-for-dev | — |
| US-7.2 | Show ratings and reviews on restaurants | FR-7, FR-22 | ready-for-dev | — |
| | **Epic 8 — Email notifications** | | | |
| US-8.1 | Order placed emails to customer and owner | FR-23, FR-25, FR-26 | ready-for-dev | — |
| US-8.2 | Status change emails to the customer | FR-24, FR-26 | ready-for-dev | — |
| | **Epic 9 — Polish, testing and launch** | | | |
| US-9.1 | Seed demo restaurants and menus | Roadmap | ready-for-dev | — |
| US-9.2 | Loading, empty, error states and accessibility pass | NFR Usability | ready-for-dev | — |
| US-9.3 | Deploy to Vercel and Supabase production | Architecture 10 | ready-for-dev | — |

## Build order
Epic 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9, matching the PRD roadmap (Auth → Restaurants and menus → Discovery → Cart and checkout → Orders → Owner → Admin → Ratings → Polish).

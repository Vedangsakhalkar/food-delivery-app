# User Stories — Foodzie (MVP)

Source: `prd.md`. Grouped into epics, scaffolding first. Story state lives in `stories.yaml`; detailed story files live in `stories/` (created per epic on request). All epics (0-9) have detailed story files.

| ID | Story | PRD refs | Status | File |
|---|---|---|---|---|
| | **Epic 0 — Foundation and scaffolding** | | | |
| US-0.1 | Bootstrap the Next.js project | Roadmap 8.1-8.5 | done | [story-us-0.1-bootstrap-project.md](stories/story-us-0.1-bootstrap-project.md) |
| US-0.2 | Set up developer tooling | NFR Maintainability | done | [story-us-0.2-developer-tooling.md](stories/story-us-0.2-developer-tooling.md) |
| US-0.3 | Typed config, database pool and migrations | Architecture 8, 10 | done | [story-us-0.3-config-db-pool-and-migrations.md](stories/story-us-0.3-config-db-pool-and-migrations.md) |
| US-0.4 | Error handling, logging and health check | Architecture 8 | done | [story-us-0.4-error-handling-logging-and-health.md](stories/story-us-0.4-error-handling-logging-and-health.md) |
| US-0.5 | Auth and role-based access helpers | FR-3 | done | [story-us-0.5-auth-and-rbac-helpers.md](stories/story-us-0.5-auth-and-rbac-helpers.md) |
| US-0.6 | Shared utilities and base UI | NFR Usability | done | [story-us-0.6-shared-utilities.md](stories/story-us-0.6-shared-utilities.md) |
| US-0.7 | CI pipeline | Architecture 9 | done | [story-us-0.7-ci-pipeline.md](stories/story-us-0.7-ci-pipeline.md) |
| | **Epic 1 — Authentication and profile** | | | |
| US-1.1 | Sign up with a role | FR-1, FR-3 | done | [story-us-1.1-sign-up-with-role.md](stories/story-us-1.1-sign-up-with-role.md) |
| US-1.2 | Sign in and sign out | FR-1, FR-2 | done | [story-us-1.2-sign-in-sign-out.md](stories/story-us-1.2-sign-in-sign-out.md) |
| US-1.3 | Route and API protection | FR-3 | done | [story-us-1.3-route-and-api-protection.md](stories/story-us-1.3-route-and-api-protection.md) |
| US-1.4 | Reset a forgotten password | FR-1 | done | [story-us-1.4-password-reset.md](stories/story-us-1.4-password-reset.md) |
| US-1.5 | Edit my profile | FR-4 | done | [story-us-1.5-edit-profile.md](stories/story-us-1.5-edit-profile.md) |
| | **Epic 2 — Restaurant and menu management (owner)** | | | |
| US-2.1 | Owner creates a restaurant | FR-17 | done | [story-us-2.1-owner-creates-restaurant.md](stories/story-us-2.1-owner-creates-restaurant.md) |
| US-2.2 | Owner edits restaurant and uploads image | FR-17, FR-18a | done | [story-us-2.2-owner-edits-restaurant-and-image.md](stories/story-us-2.2-owner-edits-restaurant-and-image.md) |
| US-2.3 | Owner manages menu categories | FR-18 | done | [story-us-2.3-owner-manages-menu-categories.md](stories/story-us-2.3-owner-manages-menu-categories.md) |
| US-2.4 | Owner manages menu items with images | FR-18, FR-18a | done | [story-us-2.4-owner-manages-menu-items.md](stories/story-us-2.4-owner-manages-menu-items.md) |
| | **Epic 3 — Restaurant discovery (customer)** | | | |
| US-3.1 | Browse restaurants on the home page | FR-5 | done | [story-us-3.1-browse-restaurants-home.md](stories/story-us-3.1-browse-restaurants-home.md) |
| US-3.2 | Search restaurants and dishes | FR-6 | done | [story-us-3.2-search-restaurants-and-dishes.md](stories/story-us-3.2-search-restaurants-and-dishes.md) |
| US-3.3 | Filter by cuisine and sort | FR-7 | done | [story-us-3.3-filter-by-cuisine-and-sort.md](stories/story-us-3.3-filter-by-cuisine-and-sort.md) |
| US-3.4 | View a restaurant and its menu | FR-8 | done | [story-us-3.4-view-restaurant-and-menu.md](stories/story-us-3.4-view-restaurant-and-menu.md) |
| US-3.5 | Closed restaurant state | FR-8 | done | [story-us-3.5-closed-restaurant-state.md](stories/story-us-3.5-closed-restaurant-state.md) |
| | **Epic 4 — Cart and checkout** | | | |
| US-4.1 | Add, remove and change items in the cart | FR-9 | done | [story-us-4.1-cart-add-remove-change.md](stories/story-us-4.1-cart-add-remove-change.md) |
| US-4.2 | One restaurant per cart | FR-10 | done | [story-us-4.2-one-restaurant-per-cart.md](stories/story-us-4.2-one-restaurant-per-cart.md) |
| US-4.3 | Manage saved delivery addresses | FR-4, FR-12 | done | [story-us-4.3-manage-saved-addresses.md](stories/story-us-4.3-manage-saved-addresses.md) |
| US-4.4 | Subtotal, taxes, delivery fee and total | FR-11 | done | [story-us-4.4-price-breakdown.md](stories/story-us-4.4-price-breakdown.md) |
| US-4.5 | Place an order with cash on delivery | FR-12, FR-13 | done | [story-us-4.5-place-order-cod.md](stories/story-us-4.5-place-order-cod.md) |
| | **Epic 5 — Order management** | | | |
| US-5.1 | Customer order history | FR-15 | done | [story-us-5.1-customer-order-history.md](stories/story-us-5.1-customer-order-history.md) |
| US-5.2 | Order detail with live status | FR-14, FR-15 | done | [story-us-5.2-order-detail-live-status.md](stories/story-us-5.2-order-detail-live-status.md) |
| US-5.3 | Cancel an order before acceptance | FR-16 | done | [story-us-5.3-cancel-order.md](stories/story-us-5.3-cancel-order.md) |
| US-5.4 | Owner live orders and status updates | FR-19 | done | [story-us-5.4-owner-live-orders.md](stories/story-us-5.4-owner-live-orders.md) |
| US-5.5 | Owner order history | FR-19 | done | [story-us-5.5-owner-order-history.md](stories/story-us-5.5-owner-order-history.md) |
| | **Epic 6 — Admin** | | | |
| US-6.1 | Admin disables and enables restaurants | FR-20 | done | [story-us-6.1-admin-disable-enable-restaurants.md](stories/story-us-6.1-admin-disable-enable-restaurants.md) |
| US-6.2 | Admin views all orders | FR-21 | done | [story-us-6.2-admin-view-orders.md](stories/story-us-6.2-admin-view-orders.md) |
| US-6.3 | Admin views all users | FR-21 | done | [story-us-6.3-admin-view-users.md](stories/story-us-6.3-admin-view-users.md) |
| | **Epic 7 — Ratings and reviews** | | | |
| US-7.1 | Rate and review a delivered order | FR-22 | done | [story-us-7.1-rate-and-review-order.md](stories/story-us-7.1-rate-and-review-order.md) |
| US-7.2 | Show ratings and reviews on restaurants | FR-7, FR-22 | done | [story-us-7.2-show-ratings-on-restaurants.md](stories/story-us-7.2-show-ratings-on-restaurants.md) |
| | **Epic 8 — Email notifications** | | | |
| US-8.1 | Order placed emails to customer and owner | FR-23, FR-25, FR-26 | done | [story-us-8.1-order-placed-emails.md](stories/story-us-8.1-order-placed-emails.md) |
| US-8.2 | Status change emails to the customer | FR-24, FR-26 | done | [story-us-8.2-status-change-emails.md](stories/story-us-8.2-status-change-emails.md) |
| | **Epic 9 — Polish, testing and launch** | | | |
| US-9.1 | Seed demo restaurants and menus | Roadmap | done | [story-us-9.1-seed-demo-data.md](stories/story-us-9.1-seed-demo-data.md) |
| US-9.2 | Loading, empty, error states and accessibility pass | NFR Usability | done | [story-us-9.2-states-accessibility-privacy.md](stories/story-us-9.2-states-accessibility-privacy.md) |
| US-9.3 | Rate limiting and security headers | NFR Security | done | [story-us-9.3-rate-limiting-security-headers.md](stories/story-us-9.3-rate-limiting-security-headers.md) |
| US-9.4 | End-to-end tests for key flows | Architecture 11 | done | [story-us-9.4-e2e-tests.md](stories/story-us-9.4-e2e-tests.md) |
| US-9.5 | Deploy to Vercel and Supabase production | Architecture 11 | ready-for-dev | [story-us-9.5-deploy-vercel-supabase.md](stories/story-us-9.5-deploy-vercel-supabase.md) |

## Build order
Epic 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9, matching the PRD roadmap (Auth → Restaurants and menus → Discovery → Cart and checkout → Orders → Owner → Admin → Ratings → Polish).

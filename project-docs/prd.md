# Product Requirements Document — Food Delivery App (MVP)

| Field | Value |
|---|---|
| Version | 0.1 (Draft, awaiting approval) |
| Date | 2026-11-08 |
| Source | `my-docs/requirements.md` |

## 1. Overview
A browser-based food delivery web app inspired by Zomato. Customers browse restaurants, order food and track orders. Restaurant owners manage menus and orders. This release is the bare-minimum MVP.

## 2. Goals and Non-Goals
**Goals**
- Let a customer go from sign-up to a placed order in a few minutes.
- Let a restaurant owner manage a menu and process incoming orders.
- Establish a clean MVC codebase that can later support a mobile app.

**Non-goals (out of MVP)**
- Native mobile app
- Online payments of any kind (COD only, kept minimal)
- SMS and push notifications (email only)
- Delivery-partner app, live GPS tracking, maps routing
- Coupons, loyalty, ratings with photos, multi-language, push notifications

## 3. Users and Roles
| Role | Description |
|---|---|
| Customer | Browses, orders, tracks orders |
| Restaurant Owner | Manages own restaurant, menu and incoming orders |
| Admin | Can disable restaurants, views all orders and users (minimal) |

## 4. Functional Requirements

### 4.1 Authentication and Profile
- FR-1: Sign up and log in with email/password (Google sign-in optional) via Supabase Auth.
- FR-2: Log out; sessions persist across refreshes.
- FR-3: Role-based access (customer, owner, admin) enforced in API routes.
- FR-4: Customer can edit name, phone, and manage saved delivery addresses.

### 4.2 Restaurant Discovery (Customer)
- FR-5: Home page lists active (not disabled) restaurants.
- FR-6: Search by restaurant name or dish.
- FR-7: Filter by cuisine and sort by rating or delivery time.
- FR-8: Restaurant page shows details and menu grouped by category.

### 4.3 Cart and Checkout
- FR-9: Add, remove and change quantity of items in the cart.
- FR-10: Cart holds items from one restaurant at a time.
- FR-11: Show subtotal, taxes, delivery fee and total.
- FR-12: Choose or add a delivery address.
- FR-13: Place the order with cash on delivery (COD) only. No online payments in the MVP.

### 4.4 Order Management
- FR-14: Order statuses: Placed → Accepted → Preparing → Out for Delivery → Delivered (or Rejected/Cancelled).
- FR-15: Customer views order history and order detail with current status (polling for updates).
- FR-16: Customer can cancel an order before it is accepted.

### 4.5 Restaurant Owner
- FR-17: Create and edit the restaurant profile (name, cuisine, address, image, hours).
- FR-18: CRUD menu categories and items (name, price, description, image, veg flag, availability).
- FR-18a: Upload restaurant and menu item images to Supabase Storage (JPG/PNG/WebP, max 5 MB). Replacing or deleting an item or restaurant also deletes the old Storage object.
- FR-19: View incoming orders and update their status.

### 4.6 Admin
- FR-20: Disable or re-enable a restaurant. Restaurants self-onboard and go live immediately (no approval step).
- FR-21: View a list of all users and orders (read-only).

### 4.7 Ratings
- FR-22: Customer can rate (1–5) and review a restaurant after a delivered order.

### 4.8 Email Notifications
- FR-23: Customer receives an email on order placed (confirmation with items and total).
- FR-24: Customer receives an email when the order status changes to Accepted, Out for Delivery, Delivered, or Rejected/Cancelled.
- FR-25: Restaurant owner receives an email when a new order arrives.
- FR-26: Emails are sent from a service (`emailService`) using a transactional provider (Resend free tier suggested). A failed send must never block or fail the order.

## 5. Non-Functional Requirements
| Area | Requirement |
|---|---|
| Performance | Pages load in under 3s on a typical connection; API p95 under 500ms; images served via Supabase Storage CDN |
| Security | Supabase access tokens (JWT) verified server-side; input validation (Zod); secrets only in env vars; HTTPS; rate limiting on auth/order APIs |
| Scalability | Stateless API routes; PostgreSQL indexes on search/filter fields |
| Reliability | Consistent error handling and logging; graceful failure states |
| Usability | Responsive design (desktop and mobile browsers); accessible UI (WCAG AA basics) |
| Maintainability | Strict TypeScript, ESLint/Prettier, MVC layering, unit tests for services |
| Compatibility | Latest Chrome, Edge, Firefox, Safari |

## 6. Technical Approach
- **Stack:** TypeScript, Next.js (App Router), Tailwind CSS, shadcn/ui, Supabase (Auth, PostgreSQL, Storage; API keys), Resend (email). DB access via the `pg` driver with parameterised SQL (no ORM); the Supabase client is for auth and storage only.
- **Images:** All images (restaurant and menu item photos) are stored in **Supabase Storage** (bucket `images`), never in the database. PostgreSQL stores only the object path and public URL. Uploads go through an API route (server validates type and size, uses the service role key); the browser reads images via the public URL.
- **MVC:**
  - Models/Repositories: entity types in `src/models`; all SQL (via `pg`) in `src/repositories`
  - Services layer: all business logic (`src/services`); services call repositories and never write SQL
  - Controllers: Next.js route handlers in `src/app/api`
  - View: all UI logic in components (`src/components`, `src/app`)
- **Data entities:** User, Address, Restaurant, MenuCategory, MenuItem, Order (with embedded items), Review.

## 7. Architectural Gaps Flagged (things you may have missed)
1. **Authorization / role model:** Supabase Auth handles identity. Roles live in a PostgreSQL `users` table, linked by the Supabase user id.
2. **Image storage:** Decided: Supabase Storage (bucket `images`). The database stores only the object path and public URL, never image binaries.
3. **Order status updates:** Polling for MVP. WebSockets or SSE later.
4. **Payments:** COD only for the MVP (decided). A gateway can be added post-MVP.
5. **Validation and error handling:** Shared Zod schemas and a standard error response format.
6. **Rate limiting and security headers.**
7. **Logging and monitoring:** Basic structured logging, with Sentry as an option.
8. **Environment config and secrets management.**
9. **Testing and CI:** Vitest/Jest, Playwright, GitHub Actions.
10. **Deployment:** Vercel for Next.js, Supabase for Auth, DB and Storage.
11. **Geolocation and delivery radius:** Deferred. MVP uses a city or area filter.
12. **Email notifications:** In scope (section 4.8). SMS deferred.
13. **Seed data:** A script to populate demo restaurants and menus.

## 8. Project Scaffolding and Build Roadmap (from a clean slate)
1. Create accounts and keys per `auth-setup.md` (Supabase project: Auth, PostgreSQL, Storage).
2. Scaffold: `npx create-next-app@latest` (TypeScript, Tailwind, ESLint, App Router, `src/` dir).
3. Init shadcn/ui: `npx shadcn@latest init`.
4. Install dependencies: `pg`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `resend`.
5. Create the folder structure:
   ```
   src/
     app/            # pages + api routes (controllers)
     components/     # UI components
     models/         # entity types
     repositories/   # all SQL (pg)
     services/       # business logic
     lib/            # db connection, supabase clients, utils
     types/          # shared types
     validators/     # Zod schemas
   ```
6. Configure `.env.local`, PostgreSQL (`pg`) pool helper, Supabase browser and server client helpers.
7. Build in order: Auth → Restaurants and menus → Discovery → Cart and checkout → Orders → Owner dashboard → Admin → Ratings → Polish, testing, deploy.

## 9. Success Metrics
- A new user can sign up and place an order in under 3 minutes.
- Owner can add a menu item and accept an order end to end.
- All MVP functional requirements pass acceptance testing.
- No critical security issues at launch.

## 10. Assumptions and Risks
- Single city or region, single currency.
- COD only for the MVP.
- Risk: scope creep (mitigated by the strict MVP list above).
- Risk: free-tier limits on Supabase (Auth, DB, Storage).

## 11. Next Step
On approval of this PRD, I will create `project-docs/user-stories.md` (epics, with project scaffolding as the first story), then the architecture document.

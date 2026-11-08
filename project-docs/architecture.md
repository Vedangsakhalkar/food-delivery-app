# Architecture — Food Delivery App (MVP)

| Field | Value |
|---|---|
| Version | 0.1 (Draft, awaiting approval) |
| Date | 2026-11-08 |
| Inputs | `prd.md`, `auth-setup.md`, `mockups/`, CLAUDE.md architecture rules (aligned with Shakir's `psf-exchange` CLAUDE.md) |

> Note: per the workflow, user stories (`user-stories.md`) normally precede this document. This draft was requested early; revisit it once the user stories are approved.

## 1. Stack
TypeScript, Next.js (App Router), Tailwind CSS, shadcn/ui, Supabase (Auth, PostgreSQL, Storage), `pg` driver with parameterised SQL (no ORM), Zod, Resend. Hosting: Vercel (app) and Supabase (auth, database, storage).

## 2. Layered architecture (MVC)

```
Browser (View)  ──fetch──▶  /api route handlers (Controller)
                                   │ validate (Zod) · authenticate · authorise
                                   ▼
                            Services (business logic)
                                   │
                                   ▼
                  Repositories (SQL via pg)  ──▶  PostgreSQL (Supabase)
                  Storage / Email adapters   ──▶  Supabase Storage · Resend
```

| Layer | Location | Responsibility | Must not |
|---|---|---|---|
| View | `src/app/**/page.tsx`, `src/components` | Rendering and UI state; calls `/api` | Touch the DB, services or secrets |
| Controller | `src/app/api/**/route.ts` | Parse and validate input, check session and role, call one service, map result to HTTP response | Contain business logic or SQL |
| Service | `src/services` | All business rules (cart rules, pricing, order status transitions, ratings) | Build SQL or HTTP responses |
| Repository | `src/repositories` | All SQL via `pg`, one repository per entity | Contain business rules |
| Model | `src/models` | Entity and DTO types | Contain logic |
| Lib | `src/lib` | `pg` pool, Supabase clients, auth helpers, error classes, logger | |
| Validators | `src/validators` | Zod schemas shared by controllers and the UI | |

**Design patterns:** Repository (data access), Service layer, Adapter (`emailService`, `storageService` wrap Resend and Supabase Storage behind interfaces), Dependency injection by constructor (services receive repositories/adapters, which makes unit testing easy), State pattern for order status transitions, DTO + Zod for validation.

## 3. Folder structure

```
src/
  app/
    (public)/            # home, search, restaurant, login, signup, forgot-password, privacy
    (customer)/          # cart, checkout, orders, order detail, review, profile
    owner/               # welcome, restaurant, menu, menu item, live orders, history
    admin/               # restaurants, users, orders
    api/                 # route handlers (controllers)
  components/
    ui/                  # shadcn/ui generated components (do not hand-edit)
    ...                  # feature components built from shadcn primitives
  models/  repositories/  services/  validators/  lib/  types/
db/migrations/           # SQL migrations (run with DATABASE_URL_MIGRATIONS)
db/seed.ts               # demo restaurants and menus
```

UI rule: every component comes from shadcn/ui wherever possible (`npx shadcn@latest add <component>`); no other UI libraries.

## 4. Data model (PostgreSQL)

| Table | Key columns |
|---|---|
| `users` | `id` (= Supabase auth user id, uuid PK), `email`, `name`, `phone`, `role` (`customer`/`owner`/`admin`), `created_at` |
| `addresses` | `id`, `user_id` FK, `label`, `line1`, `city`, `pincode`, `is_default` |
| `restaurants` | `id`, `owner_id` FK, `name`, `cuisine`, `address`, `opens_at`, `closes_at`, `image_path`, `image_url`, `delivery_time_min`, `is_disabled`, `disabled_reason`, `avg_rating`, `rating_count`, `created_at` |
| `menu_categories` | `id`, `restaurant_id` FK, `name`, `sort_order` |
| `menu_items` | `id`, `category_id` FK, `restaurant_id` FK, `name`, `description`, `price_paise`, `is_veg`, `is_available`, `image_path`, `image_url` |
| `orders` | `id`, `code` (e.g. FD-10234), `customer_id` FK, `restaurant_id` FK, `address_snapshot` (jsonb), `status`, `subtotal_paise`, `tax_paise`, `delivery_fee_paise`, `total_paise`, `payment_method` (`cod`), `notes`, `created_at` |
| `order_items` | `id`, `order_id` FK, `menu_item_id`, `name_snapshot`, `price_paise`, `quantity` |
| `reviews` | `id`, `order_id` UNIQUE FK, `restaurant_id` FK, `customer_id` FK, `rating` (1–5), `comment`, `created_at` |

Notes:
- Money is stored as integer paise. Order items and the address are snapshots so later menu or address edits don't change history.
- Cart is client-side (local storage) and validated on the server at checkout. It holds items from one restaurant only.
- Indexes: `restaurants(cuisine)`, `restaurants(lower(name))`, `menu_items(restaurant_id)`, `orders(customer_id, created_at desc)`, `orders(restaurant_id, status)`; trigram or full-text index for name/dish search.
- Row Level Security is not used for app data because access goes through the server with `pg`. Authorisation is enforced in controllers and services.

## 5. Authentication and authorisation
1. The browser signs up/in with `@supabase/supabase-js` using the publishable key (email/password, optional Google). Email confirmation is on.
2. The browser sends `Authorization: Bearer <access_token>` to `/api` routes.
3. A shared `requireUser(roles)` helper in `src/lib` verifies the token with `supabase.auth.getUser(token)`, loads the `users` row (creating it on first login), and checks `role`.
4. Services receive the authenticated user and check ownership (for example, an owner may only change their own restaurant).
5. The Supabase secret key, database URLs and Resend key exist only in server code and `.env.local`.

## 6. API surface (controllers)

| Area | Routes |
|---|---|
| Auth/profile | `GET/PATCH /api/me`, `GET/POST /api/me/addresses`, `PATCH/DELETE /api/me/addresses/[id]` |
| Discovery | `GET /api/restaurants` (search, cuisine, sort), `GET /api/restaurants/[id]` (with menu), `GET /api/search` |
| Orders (customer) | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/[id]`, `POST /api/orders/[id]/cancel` |
| Reviews | `POST /api/orders/[id]/review`, `GET /api/restaurants/[id]/reviews` (public) |
| Owner | `GET/POST/PATCH /api/owner/restaurant`, `CRUD /api/owner/categories`, `CRUD /api/owner/items`, `GET /api/owner/orders`, `PATCH /api/owner/orders/[id]/status`, `POST /api/owner/uploads` |
| Admin | `GET /api/admin/restaurants`, `PATCH /api/admin/restaurants/[id]` (disable/enable), `GET /api/admin/users`, `GET /api/admin/orders` |

Conventions: JSON only; Zod validation; standard error body `{ "error": { "code", "message", "details?" } }`; correct HTTP status codes (400, 401, 403, 404, 409, 422, 500); pagination via `limit` and `cursor`.

## 7. Key flows

**Place order:** validate cart server-side (items exist, available, same restaurant, restaurant open and not disabled) → recompute prices and totals from the database (never trust client totals) → insert `orders` and `order_items` in one transaction → send emails (best effort) → return order code.

**Order status (State pattern):** `placed → accepted → preparing → out_for_delivery → delivered`; `placed → rejected` (owner); `placed → cancelled` (customer, only before acceptance). The service rejects invalid transitions with 409. Customers see updates by polling `GET /api/orders/[id]` every 10–15 s.

**Ratings:** allowed only for the customer's own delivered order, once per order. The service updates `restaurants.avg_rating` and `rating_count` in the same transaction.

**Image upload:** the owner UI posts the file to `/api/owner/uploads`; the controller validates type (JPG/PNG/WebP) and size (≤ 5 MB), `storageService` uploads to bucket `images` with the secret key and returns `{ path, url }`; the service stores both and deletes the old object on replace or delete.

**Email:** `emailService` (Resend) sends order placed (customer and owner) and status-change emails. Sends are wrapped in try/catch and logged; a failure never fails the order.

## 8. Cross-cutting concerns
- **Validation:** Zod schemas in `src/validators`, reused by forms and controllers.
- **Errors:** domain errors (`NotFoundError`, `ForbiddenError`, `ConflictError`, `ValidationError`) thrown by services and mapped to HTTP in one `handleError` wrapper for controllers.
- **Security:** parameterised SQL only; rate limiting on auth and order routes; security headers; secrets only in env vars; `.env*` git-ignored.
- **Logging:** structured logger in `src/lib` (Sentry optional later).
- **Config:** one typed `env.ts` that validates required env vars at startup.
- **Accessibility and responsiveness:** shadcn/ui components, WCAG AA basics, mobile-first layouts.

## 9. Testing and CI
- Unit tests (Vitest) for services with mocked repositories; repository tests against a test database; Playwright for key flows (sign up → order → owner accepts).
- GitHub Actions on pull requests into `release/dev`: install, lint, typecheck, test, build.

## 10. Deployment and environments
- Vercel for the Next.js app; separate Supabase projects for dev and production.
- Migrations run from `db/migrations` using `DATABASE_URL_MIGRATIONS`; the app uses the pooled `DATABASE_URL` at runtime.
- Branches: `release/dev` (integration), `main` (release), feature branches per CLAUDE.md.

## 11. Screen-to-API map (from `mockups/`)

Public = no login needed (guests can browse; adding to cart or checkout prompts login). Routes below are the App Router pages; each calls the listed APIs.

| Mock | Page route | Role | APIs used |
|---|---|---|---|
| C1/C1b Home | `/` | Public | `GET /api/restaurants` |
| C2 Search | `/search` | Public | `GET /api/search` |
| C3/C4 Restaurant (open/closed) | `/restaurants/[id]` | Public | `GET /api/restaurants/[id]`, `GET /api/restaurants/[id]/reviews`. Closed state is derived from `opens_at`/`closes_at`; ordering is blocked server-side too |
| C5 Cart | `/cart` | Customer | none (client state) |
| C6 Checkout | `/checkout` | Customer | `GET/POST /api/me/addresses`, `POST /api/orders` |
| C7 Order confirmation | `/orders/[id]/placed` | Customer | `GET /api/orders/[id]` |
| C8 My orders | `/orders` | Customer | `GET /api/orders` |
| C9 Order detail | `/orders/[id]` | Customer | `GET /api/orders/[id]` (polling), `POST /api/orders/[id]/cancel` |
| C10 Review | `/orders/[id]/review` | Customer | `POST /api/orders/[id]/review` |
| A1/A2/A3 Login, sign up, forgot password | `/login`, `/signup`, `/forgot-password` | Public | Supabase Auth client directly; role (customer/owner) chosen at sign-up is saved on first `GET /api/me` |
| A4 Profile | `/profile` | Any | `GET/PATCH /api/me`, `/api/me/addresses` |
| O1 Owner welcome | `/owner` | Owner | `GET /api/owner/restaurant` (404 shows welcome) |
| O2 Restaurant profile | `/owner/restaurant` | Owner | `GET/POST/PATCH /api/owner/restaurant`, `POST /api/owner/uploads` |
| O3 Live orders | `/owner/orders` | Owner | `GET /api/owner/orders` (polling), `PATCH /api/owner/orders/[id]/status` |
| O4/O5 Menu, item | `/owner/menu`, `/owner/menu/items/[id]` | Owner | `/api/owner/categories`, `/api/owner/items`, `POST /api/owner/uploads` |
| O6 History | `/owner/history` | Owner | `GET /api/owner/orders?status=delivered,rejected,cancelled` |
| M1 Restaurants | `/admin/restaurants` | Admin | `GET /api/admin/restaurants`, `PATCH /api/admin/restaurants/[id]` (disable with reason / enable) |
| M2/M3 Orders, users | `/admin/orders`, `/admin/users` | Admin | `GET /api/admin/orders`, `GET /api/admin/users` |
| S1–S4 States, dialogs, privacy, errors | shared components, `/privacy`, `not-found`, `error` | Public | none |

Access control: a Next.js middleware redirects unauthenticated users away from customer/owner/admin pages and wrong-role users to an access-denied page; the API controllers enforce the same roles.

## 12. Open questions
1. Delivery fee and tax values: fixed constants or per restaurant? (Assumed fixed for MVP.)
2. Delivery time on cards is a static `delivery_time_min` field set by the owner (decided for MVP).
3. Should the owner dashboard push new orders (SSE) later instead of polling?

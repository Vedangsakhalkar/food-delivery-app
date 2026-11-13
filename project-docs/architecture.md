# Architecture — Tadka (MVP)

| Field | Value |
|---|---|
| Version | 0.3 (Draft, awaiting approval) |
| Date | 2026-11-13 |
| Inputs | `prd.md`, `user-stories.md`, `auth-setup.md`, `mockups/`, `CLAUDE.md` architecture rules |

## 1. Summary (read this first)

The app is a Next.js website with four strict layers. Each layer does one job and only talks to the layer directly below it.

| Layer | One-line job | Lives in |
|---|---|---|
| View | Shows screens, calls the API | `src/app`, `src/components` |
| Controller | Checks who is calling and what they sent, then hands off | `src/app/api/**/route.ts` |
| Service | Decides what is allowed (all business rules) | `src/services` |
| Repository | Runs SQL, nothing else | `src/repositories` |

Key decisions at a glance:
- **Database:** PostgreSQL on Supabase, accessed with the `pg` driver and parameterised SQL. No ORM.
- **Supabase client:** used only for sign-in and file storage, never for data queries.
- **Payment:** Cash on Delivery only.
- **Images:** stored in Supabase Storage (bucket `images`); the database keeps only the path and URL.
- **Order updates:** the browser polls the API. No websockets in the MVP.
- **Cart:** lives in the browser until checkout; the server re-checks everything when the order is placed.

## 2. Stack

TypeScript, Next.js (App Router), Tailwind CSS, shadcn/ui, Supabase (Auth, PostgreSQL, Storage), `pg`, Zod, Resend. Hosting: Vercel (app), Supabase (auth, database, storage).

## 3. Layers in detail

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
| Controller | `src/app/api/**/route.ts` | Parse and validate input, check session and role, call one service, map the result to HTTP | Contain business logic or SQL |
| Service | `src/services` | Business rules: cart validation, pricing, order status transitions, ratings | Build SQL or HTTP responses |
| Repository | `src/repositories` | All SQL via `pg`, one repository per entity | Contain business rules |
| Model | `src/models` | Entity and DTO types | Contain logic |
| Validators | `src/validators` | Zod schemas shared by controllers and forms | |
| Lib | `src/lib` | `pg` pool, Supabase clients, auth helpers, error classes, logger, typed `env.ts` | |

**Patterns used:** Repository, Service layer, Adapter (`emailService`, `storageService` hide Resend and Supabase Storage behind interfaces), constructor dependency injection (easy to unit test), State pattern for order status, DTO + Zod for validation.

### Worked example: customer places an order

1. **View** (`/checkout`) sends `POST /api/orders` with the cart and chosen address.
2. **Controller** verifies the token, confirms role = customer, validates the body with Zod, calls `orderService.placeOrder(user, input)`.
3. **Service** checks the restaurant is open and not disabled, items exist and are available, then recomputes prices and totals from the database.
4. **Repository** inserts `orders` and `order_items` in one transaction.
5. **Service** asks `emailService` to send confirmations (failures are logged, never block the order).
6. **Controller** returns `201 { code: "TDK-10234" }`; the View shows the confirmation page.

## 4. Folder structure

```
src/
  app/
    (public)/      home, search, restaurant, login, signup, forgot-password, privacy
    (customer)/    cart, checkout, orders, order detail, review, profile
    owner/         welcome, restaurant, menu, menu item, live orders, history
    admin/         restaurants, users, orders
    api/           route handlers (controllers)
  components/
    ui/            shadcn/ui generated components (do not hand-edit)
    ...            feature components built from shadcn primitives
  models/  repositories/  services/  validators/  lib/  types/
db/migrations/     SQL migrations (run with DATABASE_URL_MIGRATIONS)
db/seed.ts         demo restaurants and menus
```

UI rule: every component comes from shadcn/ui wherever possible (`npx shadcn@latest add <component>`). No other UI libraries.

## 5. Data model (PostgreSQL)

| Table | Key columns |
|---|---|
| `users` | `id` (= Supabase auth user id, uuid PK), `email`, `name`, `phone`, `role` (`customer`/`owner`/`admin`), `created_at` |
| `addresses` | `id`, `user_id` FK, `label`, `line1`, `city`, `pincode`, `is_default` |
| `restaurants` | `id`, `owner_id` FK, `name`, `cuisine`, `address`, `opens_at`, `closes_at`, `image_path`, `image_url`, `delivery_time_min`, `is_disabled`, `disabled_reason`, `avg_rating`, `rating_count`, `created_at` |
| `menu_categories` | `id`, `restaurant_id` FK, `name`, `sort_order` |
| `menu_items` | `id`, `category_id` FK, `restaurant_id` FK, `name`, `description`, `price_paise`, `is_veg`, `is_available`, `image_path`, `image_url` |
| `orders` | `id`, `code` (e.g. TDK-10234), `customer_id` FK, `restaurant_id` FK, `address_snapshot` (jsonb), `status`, `rejection_reason`, `subtotal_paise`, `tax_paise`, `delivery_fee_paise`, `total_paise`, `payment_method` (`cod`), `notes`, `created_at` |
| `order_items` | `id`, `order_id` FK, `menu_item_id`, `name_snapshot`, `price_paise`, `quantity` |
| `reviews` | `id`, `order_id` UNIQUE FK, `restaurant_id` FK, `customer_id` FK, `rating` (1–5), `comment`, `created_at` |

Relationships: a user (owner) has one restaurant; a restaurant has many categories and items; a customer has many addresses and orders; an order has many order items and at most one review.

Rules:
- Money is stored as integer paise.
- Order items and the address are **snapshots**, so later edits never change order history.
- The cart is client-side (local storage), holds one restaurant only, and is validated on the server at checkout.
- Indexes: `restaurants(cuisine)`, `restaurants(lower(name))`, `menu_items(restaurant_id)`, `orders(customer_id, created_at desc)`, `orders(restaurant_id, status)`, plus a trigram or full-text index for name/dish search.
- Row Level Security is **enabled with no policies** on every table. This blocks any direct access through Supabase's public Data API (the browser never queries data). The server connects with `pg` using a privileged database role, which is not affected by RLS. Authorisation is enforced in controllers and services.

## 6. Authentication and authorisation

1. The browser signs up or in with `@supabase/supabase-js` using the publishable key (email/password, optional Google). Email confirmation is on.
2. The session is stored in cookies by `@supabase/ssr`, so the browser sends it automatically to pages, middleware and `/api` routes.
3. `requireUser(roles)` in `src/lib` reads the cookie session, verifies it with `supabase.auth.getUser()`, loads the `users` row, and checks `role`. On first login the row is created from the role stored in Supabase user metadata at sign-up (`options.data.role`). Only `customer` and `owner` are accepted from metadata; any other value becomes `customer`. Admins are set directly in the database.
4. Services receive the authenticated user and check ownership (e.g. an owner can only change their own restaurant).
5. The Supabase secret key, database URLs and Resend key exist only in server code and `.env.local`.

| Role | Can do |
|---|---|
| Customer | Browse, order, cancel before acceptance, review delivered orders, edit profile and addresses |
| Owner | Manage own restaurant, menu and incoming orders |
| Admin | Disable or enable restaurants; read-only view of all users and orders |

## 7. API surface (controllers)

| Area | Routes |
|---|---|
| Auth/profile | `GET/PATCH /api/me`, `GET/POST /api/me/addresses`, `PATCH/DELETE /api/me/addresses/[id]` |
| Discovery | `GET /api/restaurants` (cuisine, sort, pagination), `GET /api/restaurants/cuisines`, `GET /api/restaurants/[id]` (with menu), `GET /api/search` |
| Cart pricing | `POST /api/quote` (server-computed subtotal, tax, delivery fee, total for a cart) |
| Orders (customer) | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/[id]`, `POST /api/orders/[id]/cancel` |
| Reviews | `POST /api/orders/[id]/review`, `GET /api/restaurants/[id]/reviews` (public) |
| Owner | `GET/POST/PATCH /api/owner/restaurant`, `CRUD /api/owner/categories`, `CRUD /api/owner/items`, `GET /api/owner/orders`, `PATCH /api/owner/orders/[id]/status`, `POST /api/owner/uploads` |
| Admin | `GET /api/admin/restaurants`, `PATCH /api/admin/restaurants/[id]`, `GET /api/admin/users`, `GET /api/admin/orders` |

Conventions: JSON only; Zod validation; error body `{ "error": { "code", "message", "details?" } }`; status codes 400, 401, 403, 404, 409, 422, 500; pagination via `limit` and `cursor`.

## 8. Key flows

**Place order:** validate cart server-side (items exist and are available, same restaurant, restaurant open and not disabled) → recompute prices from the database (never trust client totals) → insert order and items in one transaction → send emails (best effort) → return order code.

**Order status (State pattern):**

```
placed ─▶ accepted ─▶ preparing ─▶ out_for_delivery ─▶ delivered
  ├─▶ rejected   (by owner)
  └─▶ cancelled  (by customer, only before acceptance)
```

Invalid transitions return 409. Customers see updates by polling `GET /api/orders/[id]` every 10–15 s.

**Ratings:** only for the customer's own delivered order, once per order. The service updates `avg_rating` and `rating_count` in the same transaction.

**Image upload:** the owner UI posts the file to `/api/owner/uploads`. The controller validates type (JPG/PNG/WebP) and size (≤ 5 MB); `storageService` uploads to bucket `images` with the secret key and returns `{ path, url }`. The service stores both and deletes the old object on replace or delete.

**Email:** `emailService` (Resend) sends order-placed (customer and owner) and status-change emails. Sends are wrapped in try/catch and logged; a failure never fails the order.

## 9. Cross-cutting concerns

- **Validation:** Zod schemas in `src/validators`, reused by forms and controllers.
- **Errors:** services throw `NotFoundError`, `ForbiddenError`, `ConflictError`, `ValidationError`; one `handleError` wrapper maps them to HTTP.
- **Security:** parameterised SQL only; rate limiting on auth and order routes; security headers; secrets only in env vars; `.env*` git-ignored.
- **Logging:** structured logger in `src/lib` (Sentry optional later).
- **Config:** one typed `env.ts` validates required env vars at startup.
- **Accessibility and responsiveness:** shadcn/ui components, WCAG AA basics, mobile-first layouts.

## 10. Environment variables

Names match `auth-setup.md`. Server-only values must never be imported by components.

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (holds the publishable key; the name is kept from `auth-setup.md`) | Browser + server |
| `SUPABASE_SERVICE_ROLE_KEY` (secret key) | Server only |
| `DATABASE_URL` (pooled, runtime), `DATABASE_URL_MIGRATIONS` (direct) | Server only |
| `SUPABASE_STORAGE_BUCKET` (`images`) | Server only |
| `RESEND_API_KEY`, `EMAIL_FROM` | Server only |

## 11. Testing, CI and deployment

- **Tests:** Vitest for services with mocked repositories; repository tests against a test database; Playwright for key flows (sign up → order → owner accepts).
- **CI:** GitHub Actions on pull requests into `release/dev`: install, lint, typecheck, test, build.
- **Deploy:** Vercel for the app; separate Supabase projects for dev and production. Migrations run from `db/migrations`; the app uses the pooled `DATABASE_URL` at runtime.
- **Branches:** `release/dev` (integration), `main` (release), one feature branch per story per `CLAUDE.md`.

## 12. Screen-to-API map (from `mockups/`)

Public = no login needed. Guests can browse; adding to cart or checkout prompts login.

| Mock | Page route | Role | APIs used |
|---|---|---|---|
| C1/C1b Home | `/` | Public | `GET /api/restaurants` |
| C2 Search | `/search` | Public | `GET /api/search` |
| C3/C4 Restaurant (open/closed) | `/restaurants/[id]` | Public | `GET /api/restaurants/[id]`, `GET /api/restaurants/[id]/reviews`. Closed state comes from `opens_at`/`closes_at`; the server also blocks ordering |
| C5 Cart | `/cart` | Customer | none (client state) |
| C6 Checkout | `/checkout` | Customer | `GET/POST /api/me/addresses`, `POST /api/orders` |
| C7 Order confirmation | `/orders/[id]/placed` | Customer | `GET /api/orders/[id]` |
| C8 My orders | `/orders` | Customer | `GET /api/orders` |
| C9 Order detail | `/orders/[id]` | Customer | `GET /api/orders/[id]` (polling), `POST /api/orders/[id]/cancel` |
| C10 Review | `/orders/[id]/review` | Customer | `POST /api/orders/[id]/review` |
| A1–A3 Login, sign up, forgot password | `/login`, `/signup`, `/forgot-password` | Public | Supabase Auth client directly; role chosen at sign-up is sent as user metadata and the `users` row is created on first `GET /api/me` |
| A4 Profile | `/profile` | Any | `GET/PATCH /api/me`, `/api/me/addresses` |
| O1 Owner welcome | `/owner` | Owner | `GET /api/owner/restaurant` (404 shows welcome) |
| O2 Restaurant profile | `/owner/restaurant` | Owner | `GET/POST/PATCH /api/owner/restaurant`, `POST /api/owner/uploads` |
| O3 Live orders | `/owner/orders` | Owner | `GET /api/owner/orders` (polling), `PATCH /api/owner/orders/[id]/status` |
| O4/O5 Menu, item | `/owner/menu`, `/owner/menu/items/[id]` | Owner | `/api/owner/categories`, `/api/owner/items`, `POST /api/owner/uploads` |
| O6 History | `/owner/history` | Owner | `GET /api/owner/orders?status=delivered,rejected,cancelled` |
| M1 Restaurants | `/admin/restaurants` | Admin | `GET /api/admin/restaurants`, `PATCH /api/admin/restaurants/[id]` (disable with reason / enable) |
| M2/M3 Orders, users | `/admin/orders`, `/admin/users` | Admin | `GET /api/admin/orders`, `GET /api/admin/users` |
| S1–S4 States, dialogs, privacy, errors | shared components, `/privacy`, `not-found`, `error` | Public | none |

Access control: Next.js middleware redirects unauthenticated users away from customer/owner/admin pages and wrong-role users to an access-denied page. API controllers enforce the same roles.

## 13. Build order (from `user-stories.md`)

| Epic | What it adds to the architecture |
|---|---|
| 0 Foundation | Scaffold, tooling, `env.ts`, `pg` pool, migrations, error handling, logger, health check, `requireUser`, base UI, CI |
| 1 Auth and profile | Sign up/in/out, route and API protection, password reset, profile |
| 2 Owner menu | Restaurant, categories and items; `storageService` and uploads |
| 3 Discovery | Home, search, filters and sort, restaurant page, closed state |
| 4 Cart and checkout | Client cart, addresses, `pricingService` and `POST /api/quote`, `POST /api/orders` |
| 5 Orders | History, detail with polling, cancel, owner live orders |
| 6 Admin | Disable/enable restaurants, read-only users and orders |
| 7 Ratings | Review flow and rating aggregates |
| 8 Email | `emailService` and templates |
| 9 Launch | Seed data, empty/error states and accessibility pass, deploy, rate limiting and security headers, Playwright e2e |

## 14. Decisions and open questions

1. Delivery fee and tax: **decided for the MVP** as fixed constants in one config file. Per-restaurant fees can come later.
2. Delivery time on cards is a static `delivery_time_min` set by the owner (decided).
3. Owner order updates: **decided for the MVP** to use polling. Revisit SSE after launch.

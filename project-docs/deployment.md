# Deployment runbook — Dabba (Vercel + Supabase)

Production uses its **own** Supabase project (never the dev one) and a Vercel project for the Next.js app.
Nothing here should be done with the dev keys. Never commit or paste secret values anywhere public.

## 0. Before you start

- [ ] `release/dev` is green (CI and E2E) and contains everything you want to ship.
- [ ] You have a Vercel account connected to the GitHub repo, and a Resend account.
- [ ] Decide the production domain (for example `https://dabba.example`). Below it is written `<APP_URL>`.

## 1. Create the production Supabase project

1. Follow `auth-setup.md` parts 1, 2, 3 and 6 for a **new** project named `dabba-prod` (email sign-ups on, **Confirm email on**, bucket `images` set to **Public**).
2. **Authentication → URL Configuration:** set **Site URL** to `<APP_URL>` and add `<APP_URL>/**` to **Redirect URLs** (confirmation, password reset, Google). Remove the `http://localhost:3000` entries from production.
3. Collect the values for step 3: Project URL, **Publishable key**, **Secret key**, the pooled connection string (Transaction mode, port 6543) and the direct/session connection string.
   - URL-encode special characters in the database password (`@` becomes `%40`) and do not leave the `[` `]` from the Supabase placeholder.
4. Run the migrations against production from your machine (the app never runs migrations itself):

   ```bash
   DATABASE_URL_MIGRATIONS="<direct connection string>" npm run db:migrate
   ```

   Expect `applied 0001_users.sql` … `0008_reviews.sql`.
5. Create the first admin: sign up normally as a customer, then in the Supabase SQL editor run
   `update users set role = 'admin' where email = '<your email>';`
   (there is deliberately no sign-up path for admins).

## 2. Resend (email)

1. Verify your sending domain in Resend (**Domains**). Until then Resend only delivers to your own account address and order emails fail (the app logs this and carries on).
2. Create an API key and choose `EMAIL_FROM`, for example `Dabba <orders@dabba.example>`.

## 3. Vercel project

1. **Add New → Project**, import the repo, framework preset **Next.js**, Node **22.x**. Production branch: `main`.
2. Environment variables (Production):

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | prod project URL (`https://<ref>.supabase.co`) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod **publishable** key (`sb_publishable_…`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | prod **secret** key (`sb_secret_…`), server only |
   | `SUPABASE_STORAGE_BUCKET` | `images` |
   | `DATABASE_URL` | pooled connection string (Transaction mode) |
   | `RESEND_API_KEY`, `EMAIL_FROM` | from step 2 |
   | `NEXT_PUBLIC_APP_URL` | `<APP_URL>` |

   `DATABASE_URL_MIGRATIONS` is **not** set on Vercel (migrations run from your machine).
3. Add the domain under **Settings → Domains**, deploy, and confirm `<APP_URL>/api/health` returns `{"status":"ok","db":"up"}`.

## 4. Release `release/dev` to `main`

Open a pull request `release/dev` → `main`, let CI and E2E pass, merge. Vercel deploys `main` to production.

## 5. Smoke test on production

Run the same journey the E2E suite uses against the live site. It creates throwaway users through the admin API and **deletes them afterwards** (orders included):

```bash
E2E_BASE_URL="<APP_URL>" \
NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… \
DATABASE_URL_MIGRATIONS="<direct connection string>" npm run e2e
```

Then check by hand once: sign up with a real email → confirmation email arrives → log in → place an order → the owner receives the new-order email.

## 6. After launch

- Rotate any key that was ever pasted into a chat, ticket or screenshot (Supabase **Project Settings → API Keys**, Resend, database password).
- Turn on the E2E journey in CI by adding the `E2E_*` repository secrets for the **dev** project (see `.github/workflows/e2e.yml`).
- Known MVP limits to revisit: the rate limiter is per server instance (move to a shared store), CSP still allows inline scripts (nonce-based CSP later), order-status updates use polling.

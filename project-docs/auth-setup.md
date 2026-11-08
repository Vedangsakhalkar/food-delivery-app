# Supabase Setup Guide (Auth, PostgreSQL, Storage, API keys)

**Decision:** One Supabase project provides authentication, the PostgreSQL database and file storage. The app talks to Postgres with the `pg` driver (parameterised SQL, no ORM). The Supabase client is used for auth and storage only. Supabase is accessed with its **API keys**.

## Part 1 — Create a Supabase account
1. Go to https://supabase.com and click **Start your project**.
2. Sign in with GitHub or email.

## Part 2 — Create the project
1. Click **New project** and choose an organization.
2. Name it `food-delivery-app`, set a strong database password (**save it**; it goes into `DATABASE_URL`), pick the nearest region, and click **Create new project**.
3. Wait for provisioning to finish (about 2 minutes).

## Part 3 — Configure sign-in (Authentication → Sign In / Providers)
1. **User Signups:** turn **Allow new users to sign up** ON.
2. Leave **Allow manual linking** and **Allow anonymous sign-ins** OFF.
3. Turn **Confirm email** ON (users confirm their email before first sign-in). Click **Save changes**.
4. Under **Auth Providers**, **Email** is enabled by default. (Optional) enable **Google** with OAuth credentials from Google Cloud Console.
5. Open **Authentication → URL Configuration**. Set **Site URL** to `http://localhost:3000` and add `http://localhost:3000/**` to **Redirect URLs** (used by confirmation, password reset and OAuth).

## Part 4 — Get the API keys
1. Open **Project Settings → API Keys**.
2. Copy the **Project URL**.
3. Copy the **Publishable key** (`sb_publishable_...`, formerly anon). Safe in the browser.
4. Copy the **Secret key** (`sb_secret_...`, formerly service_role). It bypasses all restrictions. **Server-side only. Never expose it in client code, screenshots, chats or commits.**

## Part 5 — Database connection strings
1. Click **Connect** at the top of the dashboard.
2. Copy the **Connection pooler** string (Transaction mode) for `DATABASE_URL` (app runtime).
3. Copy the **Session/Direct** string for `DATABASE_URL_MIGRATIONS` (schema migrations).
4. Replace `[YOUR-PASSWORD]` with the database password from Part 2.

## Part 6 — Storage bucket
1. Open **Storage → New bucket**.
2. Name it `images` and mark it **Public** (images are served via public URL).
3. Uploads happen server-side through an API route using the secret key. Allowed types: JPG/PNG/WebP, max 5 MB.

## Part 7 — Environment variables
Create `.env.local` in the project root (it must be in `.gitignore`; never commit it):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # the publishable key
SUPABASE_SERVICE_ROLE_KEY=            # the secret key, server-side only
DATABASE_URL=
DATABASE_URL_MIGRATIONS=
SUPABASE_STORAGE_BUCKET=images

RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev
```

## Part 8 — Resend (email notifications)
1. Sign up free at https://resend.com.
2. Open **API Keys → Create API Key** and copy it into `RESEND_API_KEY`.
3. `onboarding@resend.dev` works for testing, but only delivers to your own account email. Verify a domain later for real use.

## Part 9 — Share with me
Put the values in `.env.local` on your machine. Do **not** paste secret keys or the database password into commits, screenshots or public places.

## Notes
- The browser signs users in with `@supabase/supabase-js` (publishable key) and holds a session (access token, JWT).
- The browser sends the access token to `/api` routes as `Authorization: Bearer <token>`.
- API routes verify it on the server with `supabase.auth.getUser(token)`, then load the user's role from the PostgreSQL `users` table by Supabase user id.
- The secret key and database URLs are used only in server code (`src/lib`, `src/repositories`), never in components.

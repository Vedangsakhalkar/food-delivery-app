# Authentication Setup Guide (Supabase Auth + API keys)

**Decision:** Supabase Auth replaces Firebase. We use only its authentication; all app data stays in MongoDB Atlas. Supabase is accessed with its **API keys**: a publishable (anon) key in the browser and a secret (service role) key on the server only.

## Part 1 — Create a Supabase account
1. Go to https://supabase.com and click **Start your project**.
2. Sign in with GitHub or email.

## Part 2 — Create the project
1. Click **New project** and choose an organization.
2. Name it `food-delivery-app`, set a strong database password (save it; we won't use the database), pick the nearest region, and click **Create new project**.
3. Wait for provisioning to finish (about 2 minutes).

## Part 3 — Enable sign-in methods
1. Open **Authentication → Providers**.
2. **Email** is on by default. For development, you may turn off **Confirm email** (**Authentication → Sign In / Providers → Email**) so sign-ups work immediately. Turn it back on before launch.
3. (Optional) Enable **Google**: create OAuth credentials in Google Cloud Console and paste the client ID and secret.
4. Open **Authentication → URL Configuration**. Set **Site URL** to `http://localhost:3000` and add `http://localhost:3000/**` to **Redirect URLs** (used by password reset and OAuth).

## Part 4 — Get the API keys
1. Open **Project Settings → API** (or **API Keys**).
2. Copy the **Project URL**.
3. Copy the **Publishable / anon key**. It is safe in the browser (it is restricted by Supabase Auth rules).
4. Copy the **Secret / service_role key**. It bypasses all restrictions. **Server-side only. Never expose it in client code or commit it.**

## Part 5 — Environment variables
Create `.env.local` in the project root (it must be in `.gitignore`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

MONGODB_URI=
```

## Part 6 — MongoDB Atlas (for reference)
1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. **Database Access:** create a database user with a password.
3. **Network Access:** allow your IP (use `0.0.0.0/0` for development only).
4. Click **Connect → Drivers** and copy the connection string into `MONGODB_URI`.

## Part 7 — Cloudinary (image storage)
1. Sign up free at https://cloudinary.com.
2. Open **Dashboard** and copy the **Cloud name**, **API Key** and **API Secret**.
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```
4. Keep the API secret server-side only.

## Part 8 — Resend (email notifications)
1. Sign up free at https://resend.com.
2. Open **API Keys → Create API Key** and copy it.
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=
   EMAIL_FROM=onboarding@resend.dev
   ```
   (`onboarding@resend.dev` works for testing, but only delivers to your own account email. Verify a domain later for real use.)

## Part 9 — Share with me
Share the values via `.env.local`. Do **not** paste the secret/service role key or DB password into commits or public places.

## Notes
- The browser signs users in with `@supabase/supabase-js` (anon key) and holds a session (access token, JWT).
- The browser sends the access token to `/api` routes as `Authorization: Bearer <token>`.
- API routes verify it on the server with `supabase.auth.getUser(token)` using the server client, then look up the user's role in MongoDB by the Supabase user id.
- The service role key is used only in server code (`src/lib`), never in components.

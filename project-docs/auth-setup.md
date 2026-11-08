# Authentication Setup Guide (Firebase Authentication)

**Recommendation:** Firebase Authentication. It is free (Spark plan), takes about 10 minutes to set up, supports email/password and Google sign-in, and works as a standalone auth layer alongside MongoDB. Supabase would bring its own Postgres database, which we don't need.

## Part 1 — Create a Firebase account
1. Go to https://console.firebase.google.com.
2. Sign in with a Google account.
3. Accept the terms if prompted.

## Part 2 — Create the project
1. Click **Create a project** (or **Add project**).
2. Name it `food-delivery-app` and click **Continue**.
3. Turn Google Analytics **off** (not needed) and click **Create project**.
4. Click **Continue** when it finishes.

## Part 3 — Enable sign-in methods
1. In the left menu, open **Build → Authentication** and click **Get started**.
2. On the **Sign-in method** tab, click **Email/Password**, switch **Enable** on, and click **Save**.
3. (Optional) Click **Google**, enable it, choose a support email, and click **Save**.

## Part 4 — Web app keys (client-side)
1. Click the gear icon, then **Project settings**.
2. Under **Your apps**, click the web icon `</>`.
3. Enter the nickname `food-delivery-web`. Leave Firebase Hosting unchecked. Click **Register app**.
4. Copy the `firebaseConfig` values shown. You need: `apiKey`, `authDomain`, `projectId`, `appId`.

## Part 5 — Service account key (server-side)
1. In **Project settings**, open the **Service accounts** tab.
2. Click **Generate new private key**, then **Generate key**. A JSON file downloads.
3. From that file, note `project_id`, `client_email` and `private_key`.
4. **Never commit this file.** Store it only in `.env.local`.

## Part 6 — Environment variables
Create `.env.local` in the project root (it must be in `.gitignore`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

MONGODB_URI=
```

## Part 7 — MongoDB Atlas (for reference)
1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. **Database Access:** create a database user with a password.
3. **Network Access:** allow your IP (use `0.0.0.0/0` for development only).
4. Click **Connect → Drivers** and copy the connection string into `MONGODB_URI`.

## Part 7b — Cloudinary (image storage)
1. Sign up free at https://cloudinary.com.
2. Open **Dashboard** and copy the **Cloud name**, **API Key** and **API Secret**.
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```
4. Keep the API secret server-side only.

## Part 7c — Resend (email notifications)
1. Sign up free at https://resend.com.
2. Open **API Keys → Create API Key** and copy it.
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=
   EMAIL_FROM=onboarding@resend.dev
   ```
   (`onboarding@resend.dev` works for testing, but only delivers to your own account email. Verify a domain later for real use.)

## Part 8 — Share with me
Share the values via `.env.local`. Do **not** paste the private key or DB password into commits or public places.

## Notes
- The browser signs users in with the Firebase client SDK and receives an ID token.
- API routes verify that token with the Firebase Admin SDK, then look up the user's role in MongoDB.

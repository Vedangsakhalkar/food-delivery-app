import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BrowserContext } from "@playwright/test";
import pg from "pg";

/** True when the environment has what the journey needs (otherwise the journey is skipped). */
export const e2eReady = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  (process.env.DATABASE_URL_MIGRATIONS || process.env.DATABASE_URL),
);

export interface TestUser {
  id: string;
  email: string;
  password: string;
}

const PASSWORD = "E2e-Passw0rd!";

export function adminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
    },
  );
}

/** Creates a confirmed throwaway user with the given role and name. */
export async function createUser(role: "owner" | "customer", name: string): Promise<TestUser> {
  const email = `e2e-${role}-${crypto.randomUUID()}@example.test`;
  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name, phone: "9876543210", role },
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  return { id: data.user.id, email, password: PASSWORD };
}

/**
 * Signs the user in server-side and puts the real Supabase session cookies into the browser
 * context, exactly as the app's own login would. (Driving the login form needs the project's
 * publishable key in a browser, which CI/dev may not have.)
 */
export async function signInContext(context: BrowserContext, user: TestUser, baseURL: string) {
  const jar: { name: string; value: string }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => jar,
        setAll: (list) => {
          for (const c of list) {
            const i = jar.findIndex((j) => j.name === c.name);
            if (i >= 0) jar[i] = { name: c.name, value: c.value };
            else jar.push({ name: c.name, value: c.value });
          }
        },
      },
    },
  );
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  if (error) throw new Error(`sign in failed: ${error.message}`);
  const url = new URL(baseURL);
  await context.addCookies(
    jar.map((c) => ({ name: c.name, value: c.value, domain: url.hostname, path: "/" })),
  );
}

/** Removes everything the journey created (orders block user deletion, so they go first). */
export async function cleanup(users: TestUser[]) {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL_MIGRATIONS || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  try {
    const ids = users.map((u) => u.id);
    await pool.query(
      `delete from orders where customer_id = any($1)
         or restaurant_id in (select id from restaurants where owner_id = any($1))`,
      [ids],
    );
    for (const u of users) await adminClient().auth.admin.deleteUser(u.id);
  } finally {
    await pool.end();
  }
}

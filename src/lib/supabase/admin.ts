import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

/** Privileged client (secret key). Server code only: storage uploads and admin tasks. */
export function createSupabaseAdminClient() {
  const env = getEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

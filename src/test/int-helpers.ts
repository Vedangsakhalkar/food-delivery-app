import { createClient } from "@supabase/supabase-js";
import { query } from "@/lib/db";

/** Creates a throwaway confirmed Supabase Auth user (cascades to our tables when deleted). */
export async function createTestUser(role: "customer" | "owner") {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const email = `it-${crypto.randomUUID()}@example.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "Passw0rd!test",
    email_confirm: true,
    user_metadata: { name: "Test User", phone: "9876543210", role },
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  const id = data.user.id;
  return {
    id,
    email,
    metadata: { name: "Test User", phone: "9876543210", role } as Record<string, unknown>,
    cleanup: async () => {
      // Orders reference users and restaurants without cascade (history must survive in the app),
      // so remove this test user's orders first, otherwise the user (and restaurant) delete fails.
      await query(
        `delete from orders where customer_id = $1
           or restaurant_id in (select id from restaurants where owner_id = $1)`,
        [id],
      );
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw new Error(`deleteUser failed: ${error.message}`);
    },
  };
}

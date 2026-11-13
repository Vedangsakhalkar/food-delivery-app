import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BadRequestError } from "@/lib/errors";
import { createAuthService, type AuthGateway } from "@/services/auth-service";

const supabaseAuthGateway: AuthGateway = {
  async signUp({ email, password, data, redirectTo }) {
    const supabase = await createSupabaseServerClient();
    const { data: result, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data, emailRedirectTo: redirectTo },
    });
    if (error) {
      if (/already registered/i.test(error.message)) return { alreadyRegistered: true };
      throw new BadRequestError(error.message);
    }
    // With email confirmation on, an existing email returns a user with no identities.
    return { alreadyRegistered: (result.user?.identities?.length ?? 0) === 0 };
  },
};

export const authService = createAuthService(supabaseAuthGateway);

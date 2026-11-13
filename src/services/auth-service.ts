import { ConflictError } from "@/lib/errors";
import type { SignUpInput } from "@/validators/auth";

export interface AuthGateway {
  /** Creates the Supabase Auth user. `alreadyRegistered` is true when the email exists. */
  signUp(args: {
    email: string;
    password: string;
    data: { name: string; phone: string; role: string };
    redirectTo: string;
  }): Promise<{ alreadyRegistered: boolean }>;
}

export function createAuthService(gateway: AuthGateway) {
  return {
    async signUp(input: SignUpInput, redirectTo: string): Promise<void> {
      const { alreadyRegistered } = await gateway.signUp({
        email: input.email,
        password: input.password,
        data: { name: input.name, phone: input.phone, role: input.role },
        redirectTo,
      });
      if (alreadyRegistered) {
        throw new ConflictError("An account with this email already exists. Try logging in.");
      }
    },
  };
}

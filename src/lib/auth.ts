import "server-only";
import type { Role, User } from "@/models/user";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { userService, type AuthIdentity } from "@/services/user-service";

export interface AuthDeps {
  getIdentity: () => Promise<AuthIdentity | null>;
  ensureUser: (identity: AuthIdentity) => Promise<User>;
}

/** Builds requireUser from injectable dependencies (unit-testable). */
export function createRequireUser(deps: AuthDeps) {
  return async function requireUser(roles?: readonly Role[]): Promise<User> {
    const identity = await deps.getIdentity();
    if (!identity) throw new UnauthorizedError();
    const user = await deps.ensureUser(identity);
    if (roles && roles.length > 0 && !roles.includes(user.role)) throw new ForbiddenError();
    return user;
  };
}

/** Reads the cookie session and verifies it with Supabase (getUser, not getSession). */
async function getIdentityFromSession(): Promise<AuthIdentity | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email) return null;
  return {
    id: data.user.id,
    email: data.user.email,
    metadata: (data.user.user_metadata ?? {}) as Record<string, unknown>,
  };
}

/** Call at the top of a protected controller, for example requireUser(["owner"]). */
export const requireUser = createRequireUser({
  getIdentity: getIdentityFromSession,
  ensureUser: (identity) => userService.ensureUser(identity),
});

/** Returns the signed-in user, or null for guests (never throws). Used by layouts and pages. */
export async function getCurrentUser(): Promise<User | null> {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}

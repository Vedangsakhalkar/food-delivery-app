import type { Role, User } from "@/models/user";
import { userRepository, type UserRepository } from "@/repositories/user-repository";

/** Identity as reported by Supabase Auth (already verified by the caller). */
export interface AuthIdentity {
  id: string;
  email: string;
  metadata: Record<string, unknown>;
}

const SELF_ASSIGNABLE: readonly Role[] = ["customer", "owner"];

/** Only customer or owner can be chosen at sign-up; anything else becomes customer. */
export function resolveRole(value: unknown): Role {
  return SELF_ASSIGNABLE.includes(value as Role) ? (value as Role) : "customer";
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function createUserService(repo: UserRepository) {
  return {
    /** Returns the users row for an authenticated identity, creating it on first login. */
    async ensureUser(identity: AuthIdentity): Promise<User> {
      const existing = await repo.findById(identity.id);
      if (existing) return existing;
      return repo.insertIfMissing({
        id: identity.id,
        email: identity.email,
        name: str(identity.metadata.name, 100),
        phone: str(identity.metadata.phone, 20) || null,
        role: resolveRole(identity.metadata.role),
      });
    },
  };
}

export const userService = createUserService(userRepository);

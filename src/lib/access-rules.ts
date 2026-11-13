import type { Role } from "@/models/user";

/**
 * One source of truth for who may open what. Used by the proxy (login check), page layouts
 * (role check) and API controllers (requireUser(ROLES_FOR.x)).
 */
export const ROLES_FOR = {
  customer: ["customer"] as Role[],
  owner: ["owner"] as Role[],
  admin: ["admin"] as Role[],
} as const;

interface Rule {
  prefix: string;
  /** undefined = any signed-in user */
  roles?: readonly Role[];
}

/** Page routes that need a login. Everything else (home, search, restaurant, auth, privacy) is public. */
export const PROTECTED_PAGES: Rule[] = [
  { prefix: "/owner", roles: ROLES_FOR.owner },
  { prefix: "/admin", roles: ROLES_FOR.admin },
  { prefix: "/cart", roles: ROLES_FOR.customer },
  { prefix: "/checkout", roles: ROLES_FOR.customer },
  { prefix: "/orders", roles: ROLES_FOR.customer },
  { prefix: "/profile" },
];

export function ruleForPath(pathname: string): Rule | undefined {
  return PROTECTED_PAGES.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));
}

export function isAllowed(rule: Rule, role: Role): boolean {
  return !rule.roles || rule.roles.includes(role);
}

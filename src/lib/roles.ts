import type { Role } from "@/models/user";

/** Where each role lands after logging in. */
export const HOME_BY_ROLE: Record<Role, string> = {
  customer: "/",
  owner: "/owner",
  admin: "/admin",
};

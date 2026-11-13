import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import type { Role, User } from "@/models/user";

/** For server layouts/pages: redirect guests to /login and wrong roles to /access-denied. */
export async function requirePageUser(roles?: readonly Role[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/access-denied");
  return user;
}

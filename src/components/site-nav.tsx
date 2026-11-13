import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

/** Header navigation: guests see Log in / Sign up, signed-in users see their menu. */
export async function SiteNav() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <>
        <Link href="/login" className="rounded-full px-3 py-2 hover:bg-muted hover:text-primary">
          Log in
        </Link>
        <Link href="/signup" className={buttonVariants({ size: "sm" })}>
          Sign up
        </Link>
      </>
    );
  }
  return (
    <>
      {user.role === "customer" && (
        <Link href="/orders" className="rounded-full px-3 py-2 hover:bg-muted hover:text-primary">
          Orders
        </Link>
      )}
      {user.role === "owner" && (
        <Link href="/owner" className="rounded-full px-3 py-2 hover:bg-muted hover:text-primary">
          Dashboard
        </Link>
      )}
      {user.role === "admin" && (
        <Link href="/admin" className="rounded-full px-3 py-2 hover:bg-muted hover:text-primary">
          Admin
        </Link>
      )}
      <UserMenu name={user.name || user.email} />
    </>
  );
}

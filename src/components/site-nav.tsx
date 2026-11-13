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
        <Link href="/login" className="hover:text-primary">
          Log in
        </Link>
        <Link href="/signup" className={buttonVariants({ size: "sm" })}>
          Sign up
        </Link>
      </>
    );
  }
  return <UserMenu name={user.name || user.email} />;
}

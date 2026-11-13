import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Owner | Tadka" };

/** Mock O1. Owners with a restaurant are one click from their profile. */
export default function OwnerWelcomePage() {
  return (
    <div className="mx-auto max-w-[640px]">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-semibold">Welcome!</h1>
          <p className="text-muted-foreground">
            Create your restaurant profile, add a menu, and go live.
          </p>
          <ol className="list-decimal self-start pl-6 text-left">
            <li>Create restaurant profile</li>
            <li>Add menu categories and items</li>
            <li>Your restaurant goes live immediately</li>
            <li>Start receiving orders</li>
          </ol>
          <Link href="/owner/restaurant" className={buttonVariants()}>
            Create / manage your restaurant
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

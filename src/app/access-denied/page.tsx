import Link from "next/link";
import { MessageCard } from "@/components/message-card";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Access denied | Dabba" };

export default function AccessDeniedPage() {
  return (
    <MessageCard
      title="Access denied"
      message="You don't have permission to view this page (wrong role)."
    >
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Go home
      </Link>
    </MessageCard>
  );
}

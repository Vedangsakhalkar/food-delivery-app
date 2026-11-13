import Link from "next/link";
import { MessageCard } from "@/components/message-card";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <MessageCard title="404" message="We couldn't find that page.">
      <Link href="/" className={buttonVariants()}>
        Go home
      </Link>
    </MessageCard>
  );
}

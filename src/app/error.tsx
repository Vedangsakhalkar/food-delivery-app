"use client";

import { MessageCard } from "@/components/message-card";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MessageCard title="Something went wrong" message="Please try again in a moment.">
      <Button onClick={() => reset()}>Retry</Button>
    </MessageCard>
  );
}

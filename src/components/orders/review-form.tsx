"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { Order } from "@/models/order";
import { cn } from "@/lib/utils";

/** Rate (1-5) and review a delivered order (mock C10). */
export function ReviewForm({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, loading } = useApi<{ order: Order }>(`/api/orders/${id}`);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [problem, setProblem] = useState<string>();
  const [busy, setBusy] = useState(false);

  if (loading) return <Skeleton className="mx-auto h-64 max-w-[440px]" />;
  if (error || !data) {
    return <EmptyState tone="error">We couldn&apos;t find that order.</EmptyState>;
  }
  const order = data.order;
  if (order.status !== "delivered" || order.reviewed) {
    return (
      <div className="mx-auto max-w-[440px]">
        <EmptyState>
          {order.reviewed
            ? "You have already reviewed this order."
            : "You can review an order after it has been delivered."}
          <div className="mt-3">
            <Link href={`/orders/${id}`} className="text-primary underline">
              Back to the order
            </Link>
          </div>
        </EmptyState>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return setProblem("Choose 1 to 5 stars");
    setProblem(undefined);
    setBusy(true);
    try {
      await apiFetch(`/api/orders/${id}/review`, {
        method: "POST",
        body: { rating, comment: comment || undefined },
      });
      toast.success("Thanks for your review!");
      router.push("/orders");
    } catch (err) {
      setProblem(err instanceof ApiError ? err.message : "Could not save your review");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[440px]">
      <Card>
        <CardContent>
          <form onSubmit={submit} noValidate className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold">Rate {order.restaurantName}</h1>
            <div className="text-sm text-muted-foreground">
              Order #{order.code} · {formatDate(order.createdAt)}
            </div>
            <div role="radiogroup" aria-label="Rating" className="flex gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(n)}
                  className={cn(n <= rating ? "text-amber-500" : "text-muted-foreground/40")}
                >
                  ★
                </button>
              ))}
            </div>
            <label htmlFor="comment" className="text-sm font-medium">
              Your review (optional)
            </label>
            <textarea
              id="comment"
              rows={4}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your meal"
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            />
            {problem && <FieldError>{problem}</FieldError>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

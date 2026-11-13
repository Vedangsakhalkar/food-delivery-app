"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { Order } from "@/models/order";

/** Order confirmation (mock C7). */
export function OrderPlaced({ id }: { id: string }) {
  const { data, error, loading } = useApi<{ order: Order }>(`/api/orders/${id}`);
  if (loading) return <Skeleton className="mx-auto h-56 max-w-[440px]" />;
  if (error || !data)
    return <EmptyState tone="error">We couldn&apos;t find that order.</EmptyState>;
  const o = data.order;
  return (
    <div className="mx-auto max-w-[440px]">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <div
            className="grid size-20 animate-in place-items-center rounded-full bg-green-100 text-5xl text-green-700 zoom-in-50 duration-500"
            aria-hidden
          >
            ✔
          </div>
          <h1 className="text-2xl font-bold">Order placed!</h1>
          <p className="text-muted-foreground">
            Order #{o.code} · Pay {formatMoney(o.totalPaise)} on delivery.
          </p>
          <Link href={`/orders/${o.id}`} className={buttonVariants() + " w-full"}>
            Track order
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" }) + " w-full"}>
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

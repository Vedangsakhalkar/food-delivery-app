"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import type { Order } from "@/models/order";

type Page = { orders: Order[]; nextCursor: string | null };

/** "My orders" (mock C8): newest first, paginated. */
export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [more, setMore] = useState(false);

  async function load(next?: string | null) {
    try {
      const page = await apiFetch<Page>(
        `/api/orders${next ? `?cursor=${encodeURIComponent(next)}` : ""}`,
      );
      setOrders((prev) => (next ? [...prev, ...page.orders] : page.orders));
      setCursor(page.nextCursor);
      setState("ready");
    } catch {
      setState("error");
    } finally {
      setMore(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load();
  }, []);

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-4">
      <h1 className="text-2xl font-semibold">My orders</h1>
      {state === "loading" && <Skeleton className="h-40 w-full" />}
      {state === "error" && <EmptyState tone="error">Couldn&apos;t load your orders.</EmptyState>}
      {state === "ready" && orders.length === 0 && (
        <EmptyState>
          No orders yet.
          <div className="mt-3">
            <Link href="/" className={buttonVariants({ size: "sm" })}>
              Browse restaurants
            </Link>
          </div>
        </EmptyState>
      )}
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/orders/${o.id}`}
          className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4 hover:shadow-sm"
        >
          <div>
            <h3 className="flex flex-wrap items-center gap-2 font-semibold">
              {o.restaurantName} <StatusBadge status={o.status} />
            </h3>
            <div className="text-sm text-muted-foreground">
              #{o.code} · {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)}{" "}
              items
            </div>
          </div>
          <b>{formatMoney(o.totalPaise)}</b>
        </Link>
      ))}
      {cursor && (
        <Button
          variant="outline"
          className="self-center"
          disabled={more}
          onClick={() => {
            setMore(true);
            void load(cursor);
          }}
        >
          {more ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}

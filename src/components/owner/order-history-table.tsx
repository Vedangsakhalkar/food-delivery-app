"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";
import type { Order } from "@/models/order";

type Page = { orders: Order[]; nextCursor: string | null };
const FINISHED = "delivered,rejected,cancelled";

/** Finished orders of the owner's restaurant (mock O6). */
export function OwnerOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [more, setMore] = useState(false);

  async function load(next?: string | null) {
    try {
      const qs = new URLSearchParams({ status: FINISHED });
      if (next) qs.set("cursor", next);
      const page = await apiFetch<Page>(`/api/owner/orders?${qs}`);
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
    <div className="flex max-w-[900px] flex-col gap-4">
      <h1 className="text-2xl font-semibold">Order history</h1>
      {state === "loading" && <Skeleton className="h-40 w-full" />}
      {state === "error" && <EmptyState tone="error">Couldn&apos;t load order history.</EmptyState>}
      {state === "ready" && orders.length === 0 && <EmptyState>No finished orders yet.</EmptyState>}
      {orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>#{o.code}</TableCell>
                  <TableCell>{formatDate(o.createdAt)}</TableCell>
                  <TableCell>{o.items.reduce((n, i) => n + i.quantity, 0)}</TableCell>
                  <TableCell>{formatMoney(o.totalPaise)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
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

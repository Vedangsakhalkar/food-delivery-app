"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusTracker } from "@/components/orders/status-tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatMoney } from "@/lib/format";
import { isFinalStatus } from "@/lib/order-status";
import { useApi } from "@/lib/use-api";
import type { Order } from "@/models/order";

const POLL_MS = 12_000;

/** Order detail with live status (mock C9). Polls until the order reaches a final status. */
export function OrderDetail({ id }: { id: string }) {
  const [done, setDone] = useState(false);
  // Polls until the order is delivered, rejected or cancelled, then stops.
  const first = useApi<{ order: Order }>(`/api/orders/${id}`, { pollMs: done ? 0 : POLL_MS });
  const order = first.data?.order;
  if (order && isFinalStatus(order.status) && !done) setDone(true);

  if (first.loading) return <Skeleton className="mx-auto h-72 max-w-[760px]" />;
  if (!order) {
    return (
      <div className="mx-auto max-w-[760px]">
        <EmptyState tone="error">We couldn&apos;t find that order.</EmptyState>
      </div>
    );
  }

  const rejectedOrCancelled = order.status === "rejected" || order.status === "cancelled";
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Order #{order.code}</h1>
        <div className="text-sm text-muted-foreground">
          {order.restaurantName} · placed {formatDateTime(order.createdAt)}
          {!isFinalStatus(order.status) && " · status refreshes automatically"}
        </div>
      </div>

      {rejectedOrCancelled ? (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">
          <b>{order.status === "rejected" ? "Rejected by the restaurant" : "Cancelled"}</b>
          {order.rejectionReason && <div className="text-sm">Reason: {order.rejectionReason}</div>}
        </div>
      ) : (
        <StatusTracker status={order.status} />
      )}

      <Card>
        <CardContent className="flex flex-col gap-2">
          <h2 className="font-semibold">Items</h2>
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span>
                {i.quantity} × {i.name}
              </span>
              <span>{formatMoney(i.pricePaise * i.quantity)}</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotalPaise)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxes</span>
            <span>{formatMoney(order.taxPaise)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery</span>
            <span>{formatMoney(order.deliveryFeePaise)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total (cash on delivery)</span>
            <span>{formatMoney(order.totalPaise)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="font-semibold">Delivering to</h2>
          <div>
            {order.address.label} — {order.address.line1}, {order.address.city}{" "}
            {order.address.pincode}
          </div>
          {order.notes && <div className="text-sm text-muted-foreground">Note: {order.notes}</div>}
        </CardContent>
      </Card>
    </div>
  );
}

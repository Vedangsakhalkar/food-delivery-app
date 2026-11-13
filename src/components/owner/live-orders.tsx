"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, STATUS_LABEL } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiFetch } from "@/lib/api-client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { Order, OrderStatus } from "@/models/order";
import { nextStatuses } from "@/services/order-state";

const POLL_MS = 12_000;

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  accepted: "Accept",
  rejected: "Reject",
  preparing: "Start preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Mark delivered",
};

/** Dialog asking for a short reason (rejecting an order, disabling a restaurant). */
export function RejectDialog({
  onClose,
  onSubmit,
  title = "Reject this order?",
  submitLabel = "Reject order",
  placeholder = "Reason, e.g. Out of stock",
}: {
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  title?: string;
  submitLabel?: string;
  placeholder?: string;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await onSubmit(reason.trim());
              onClose();
            } finally {
              setBusy(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={reason}
            maxLength={200}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            aria-label="Reason for rejecting"
          />
          <DialogFooter>
            <Button type="submit" disabled={busy || !reason.trim()}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OrderCard({
  order,
  onChange,
}: {
  order: Order;
  onChange: (id: string, status: OrderStatus, reason?: string) => Promise<void>;
}) {
  const [rejecting, setRejecting] = useState(false);
  const actions = nextStatuses(order.status, "owner");
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex flex-wrap items-center gap-2 font-semibold">
            #{order.code} <StatusBadge status={order.status} />
          </h3>
          <b>{formatMoney(order.totalPaise)} · COD</b>
        </div>
        <div className="text-sm text-muted-foreground">
          {order.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}
        </div>
        <div className="text-sm">
          {order.customerName}
          {order.customerPhone ? ` · ${order.customerPhone}` : ""} · {order.address.line1},{" "}
          {order.address.city} {order.address.pincode}
        </div>
        {order.notes && <div className="text-sm text-muted-foreground">Note: {order.notes}</div>}
        <div className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</div>
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {actions.map((to) =>
              to === "rejected" ? (
                <Button key={to} size="sm" variant="outline" onClick={() => setRejecting(true)}>
                  {ACTION_LABEL[to] ?? STATUS_LABEL[to]}
                </Button>
              ) : (
                <Button key={to} size="sm" onClick={() => void onChange(order.id, to)}>
                  {ACTION_LABEL[to] ?? STATUS_LABEL[to]}
                </Button>
              ),
            )}
          </div>
        )}
        {rejecting && (
          <RejectDialog
            onClose={() => setRejecting(false)}
            onSubmit={(reason) => onChange(order.id, "rejected", reason)}
          />
        )}
      </CardContent>
    </Card>
  );
}

/** Incoming and in-progress orders, refreshed every 12 s (mock O3). */
export function LiveOrders() {
  const { data, error, loading, reload } = useApi<{ orders: Order[] }>("/api/owner/orders", {
    pollMs: POLL_MS,
  });

  async function change(id: string, status: OrderStatus, reason?: string) {
    try {
      await apiFetch(`/api/owner/orders/${id}/status`, {
        method: "PATCH",
        body: { status, reason },
      });
      toast.success(`Order marked ${STATUS_LABEL[status].toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update the order");
      await reload();
      throw err;
    }
    await reload();
  }

  return (
    <div className="flex max-w-[760px] flex-col gap-4">
      <h1 className="text-2xl font-semibold">Live orders</h1>
      {loading && <Skeleton className="h-40 w-full" />}
      {error?.status === 404 && (
        <EmptyState>Create your restaurant first to receive orders.</EmptyState>
      )}
      {error && error.status !== 404 && !data && (
        <EmptyState tone="error">Couldn&apos;t load orders.</EmptyState>
      )}
      {data?.orders.length === 0 && <EmptyState>No active orders right now.</EmptyState>}
      {data?.orders.map((o) => (
        <OrderCard
          key={o.id}
          order={o}
          onChange={(id, s, r) => change(id, s, r).catch(() => undefined)}
        />
      ))}
    </div>
  );
}

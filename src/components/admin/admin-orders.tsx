"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge, STATUS_LABEL } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ORDER_STATUSES, type Order } from "@/models/order";

type Page = { orders: Order[]; nextCursor: string | null };

/** Admin: every order, read-only, with status filter and code search (mock M2). */
export function AdminOrders() {
  const [status, setStatus] = useState("");
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [rows, setRows] = useState<Order[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  async function load(next?: string | null) {
    try {
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
      if (appliedCode) qs.set("code", appliedCode);
      if (next) qs.set("cursor", next);
      const page = await apiFetch<Page>(`/api/admin/orders?${qs}`);
      setRows((prev) => (next ? [...prev, ...page.orders] : page.orders));
      setCursor(page.nextCursor);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reload when filters change
    setState("loading");
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, appliedCode]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">All orders (read-only)</h1>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedCode(code.trim());
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Search order code"
            aria-label="Search order code"
            className="w-48"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {state === "loading" && <Skeleton className="h-40 w-full" />}
      {state === "error" && <EmptyState tone="error">Couldn&apos;t load orders.</EmptyState>}
      {state === "ready" && rows.length === 0 && <EmptyState>No orders found.</EmptyState>}
      {state === "ready" && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>#{o.code}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>{o.restaurantName}</TableCell>
                  <TableCell>{formatMoney(o.totalPaise)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>{formatDate(o.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {cursor && (
        <Button variant="outline" className="self-center" onClick={() => void load(cursor)}>
          Load more
        </Button>
      )}
    </div>
  );
}

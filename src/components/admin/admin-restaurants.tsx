"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { RejectDialog } from "@/components/owner/live-orders";
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
import { ApiError, apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminRestaurant } from "@/repositories/restaurant-repository";

type Page = { restaurants: AdminRestaurant[]; nextCursor: string | null };
type Filter = "active" | "disabled";

/** Admin: all restaurants, disable (with reason) or re-enable (mock M1). */
export function AdminRestaurants() {
  const [filter, setFilter] = useState<Filter>("active");
  const [rows, setRows] = useState<AdminRestaurant[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [disabling, setDisabling] = useState<AdminRestaurant | null>(null);

  async function load(f: Filter, next?: string | null) {
    try {
      const qs = new URLSearchParams({ status: f });
      if (next) qs.set("cursor", next);
      const page = await apiFetch<Page>(`/api/admin/restaurants?${qs}`);
      setRows((prev) => (next ? [...prev, ...page.restaurants] : page.restaurants));
      setCursor(page.nextCursor);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reload when the filter changes
    setState("loading");
    void load(filter);
  }, [filter]);

  async function setDisabled(r: AdminRestaurant, disabled: boolean, reason?: string) {
    try {
      await apiFetch(`/api/admin/restaurants/${r.id}`, {
        method: "PATCH",
        body: { disabled, reason },
      });
      toast.success(disabled ? `${r.name} disabled` : `${r.name} enabled`);
      await load(filter);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update the restaurant");
      throw err;
    }
  }

  const chip = (on: boolean) =>
    cn(
      "rounded-full border bg-white px-3.5 py-1.5 text-sm",
      on && "border-primary bg-primary text-primary-foreground",
    );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Restaurants</h1>
      <div className="flex gap-2" role="group" aria-label="Filter restaurants">
        <button className={chip(filter === "active")} onClick={() => setFilter("active")}>
          Active
        </button>
        <button className={chip(filter === "disabled")} onClick={() => setFilter("disabled")}>
          Disabled
        </button>
      </div>

      {state === "loading" && <Skeleton className="h-40 w-full" />}
      {state === "error" && <EmptyState tone="error">Couldn&apos;t load restaurants.</EmptyState>}
      {state === "ready" && rows.length === 0 && <EmptyState>No {filter} restaurants.</EmptyState>}
      {state === "ready" && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    {r.isDisabled && r.disabledReason && (
                      <div className="text-xs text-destructive">Reason: {r.disabledReason}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.ownerName}
                    <div className="text-xs text-muted-foreground">{r.ownerEmail}</div>
                  </TableCell>
                  <TableCell>{r.cuisine}</TableCell>
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                  <TableCell>
                    {r.isDisabled ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void setDisabled(r, false).catch(() => undefined)}
                      >
                        Enable
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setDisabling(r)}>
                        Disable
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {cursor && (
        <Button variant="outline" className="self-center" onClick={() => void load(filter, cursor)}>
          Load more
        </Button>
      )}
      {disabling && (
        <RejectDialog
          title={`Disable ${disabling.name}?`}
          submitLabel="Disable restaurant"
          placeholder="Reason, e.g. Violates policy"
          onClose={() => setDisabling(null)}
          onSubmit={(reason) => setDisabled(disabling, true, reason)}
        />
      )}
    </div>
  );
}

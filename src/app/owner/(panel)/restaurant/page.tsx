"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantForm } from "@/components/owner/restaurant-form";
import type { Restaurant } from "@/models/restaurant";
import { useApi } from "@/lib/use-api";

export default function OwnerRestaurantPage() {
  const { data, error, loading, reload } = useApi<{ restaurant: Restaurant }>(
    "/api/owner/restaurant",
  );
  const missing = error?.status === 404;

  return (
    <div className="flex max-w-[760px] flex-col gap-4">
      <h1 className="text-2xl font-semibold">Restaurant profile</h1>
      {loading && <Skeleton className="h-64 w-full" />}
      {error && !missing && <p className="text-destructive">Couldn&apos;t load your restaurant.</p>}
      {data?.restaurant.isDisabled && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Disabled by admin
          {data.restaurant.disabledReason ? `: ${data.restaurant.disabledReason}` : ""}
        </div>
      )}
      {data && !data.restaurant.isDisabled && (
        <div className="rounded-lg border bg-amber-50 p-3 text-sm">
          Status: <b>Live</b> — visible to customers.
        </div>
      )}
      {(data || missing) && (
        <RestaurantForm
          key={data?.restaurant.id ?? "new"}
          restaurant={data?.restaurant}
          onSaved={() => void reload()}
        />
      )}
    </div>
  );
}

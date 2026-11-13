"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import type { PublicRestaurant } from "@/models/public-restaurant";
import type { DishHit } from "@/repositories/search-repository";
import { useApi } from "@/lib/use-api";

export function SearchResults() {
  const q = (useSearchParams().get("q") ?? "").trim();
  const { data, error, loading } = useApi<{ restaurants: PublicRestaurant[]; dishes: DishHit[] }>(
    q.length >= 2 ? `/api/search?q=${encodeURIComponent(q)}` : null,
  );

  if (q.length < 2) return <EmptyState>Type at least 2 characters to search.</EmptyState>;
  if (loading) return <Skeleton className="h-40 w-full" />;
  if (error) return <EmptyState tone="error">Search failed. Please try again.</EmptyState>;
  if (!data || (data.restaurants.length === 0 && data.dishes.length === 0)) {
    return <EmptyState>No results for &quot;{q}&quot;. Try another dish or restaurant.</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-6">
      {data.restaurants.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Restaurants ({data.restaurants.length})</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {data.restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>
      )}
      {data.dishes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Dishes ({data.dishes.length})</h2>
          {data.dishes.map((d) => (
            <Link
              key={d.id}
              href={`/restaurants/${d.restaurantId}`}
              className="flex items-center justify-between rounded-xl border bg-white p-4 hover:shadow-sm"
            >
              <div>
                <h3 className="font-semibold">
                  <span
                    className={`mr-2 inline-block size-3 border-[1.5px] align-middle ${d.isVeg ? "border-green-600" : "border-red-700"}`}
                  />
                  {d.name}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {d.restaurantName} · {formatMoney(d.pricePaise)}
                </div>
              </div>
              <span className="text-sm font-medium text-primary">View</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

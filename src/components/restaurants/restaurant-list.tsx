"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import type { PublicRestaurant } from "@/models/public-restaurant";

type Page = { restaurants: PublicRestaurant[]; nextCursor: string | null };

export function RestaurantList() {
  const [items, setItems] = useState<PublicRestaurant[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (next?: string | null) => {
    try {
      const qs = next ? `?cursor=${encodeURIComponent(next)}` : "";
      const page = await apiFetch<Page>(`/api/restaurants${qs}`);
      setItems((prev) => (next ? [...prev, ...page.restaurants] : page.restaurants));
      setCursor(page.nextCursor);
      setState("ready");
    } catch {
      setState("error");
    } finally {
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load();
  }, [load]);

  if (state === "loading") {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-60 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  if (state === "error") {
    return (
      <EmptyState tone="error">
        Couldn&apos;t load restaurants.
        <div className="mt-3">
          <Button
            size="sm"
            onClick={() => {
              setState("loading");
              void load();
            }}
          >
            Retry
          </Button>
        </div>
      </EmptyState>
    );
  }
  if (items.length === 0) return <EmptyState>No restaurants in your area yet.</EmptyState>;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {items.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
      {cursor && (
        <Button
          variant="outline"
          className="self-center"
          disabled={loadingMore}
          onClick={() => {
            setLoadingMore(true);
            void load(cursor);
          }}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { RestaurantCard, RestaurantCardSkeleton } from "@/components/restaurants/restaurant-card";
import { cuisineEmoji } from "@/lib/cuisine-emoji";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";
import type { PublicRestaurant } from "@/models/public-restaurant";
import { cn } from "@/lib/utils";

type Page = { restaurants: PublicRestaurant[]; nextCursor: string | null };
const SORTS = [
  { value: "newest", label: "Sort: Newest" },
  { value: "rating", label: "Sort: Rating" },
  { value: "delivery", label: "Sort: Delivery time" },
];

export function RestaurantList() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const cuisineParam = params.get("cuisine") ?? "";
  const sort = params.get("sort") ?? "newest";
  const selected = cuisineParam ? cuisineParam.split(",").filter(Boolean) : [];

  const [cuisines, setCuisines] = useState<string[]>([]);
  const [items, setItems] = useState<PublicRestaurant[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    apiFetch<{ cuisines: string[] }>("/api/restaurants/cuisines")
      .then((r) => setCuisines(r.cuisines))
      .catch(() => undefined);
  }, []);

  async function load(next?: string | null) {
    const qs = new URLSearchParams();
    if (cuisineParam) qs.set("cuisine", cuisineParam);
    if (sort !== "newest") qs.set("sort", sort);
    if (next) qs.set("cursor", next);
    try {
      const page = await apiFetch<Page>(`/api/restaurants?${qs.toString()}`);
      setItems((prev) => (next ? [...prev, ...page.restaurants] : page.restaurants));
      setCursor(page.nextCursor);
      setState("ready");
    } catch {
      setState("error");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reload when filters change
    setState("loading");
    void load();
    // load() only reads cuisineParam and sort, which are the effect's dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisineParam, sort]);

  function setQuery(next: { cuisine?: string[]; sort?: string }) {
    const qs = new URLSearchParams(params.toString());
    const c = next.cuisine ?? selected;
    const s = next.sort ?? sort;
    if (c.length) qs.set("cuisine", c.join(","));
    else qs.delete("cuisine");
    if (s !== "newest") qs.set("sort", s);
    else qs.delete("sort");
    router.replace(qs.size ? `${pathname}?${qs}` : pathname);
  }

  const toggle = (name: string) =>
    setQuery({
      cuisine: selected.includes(name.toLowerCase())
        ? selected.filter((c) => c !== name.toLowerCase())
        : [...selected, name.toLowerCase()],
    });

  const chip = (on: boolean) =>
    cn(
      "flex flex-none items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary/60 hover:shadow",
      on && "border-primary bg-primary text-primary-foreground hover:border-primary",
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div
          className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0"
          role="group"
          aria-label="Filter by cuisine"
        >
          <button className={chip(selected.length === 0)} onClick={() => setQuery({ cuisine: [] })}>
            <span aria-hidden>🍴</span> All
          </button>
          {cuisines.map((c) => (
            <button
              key={c}
              className={chip(selected.includes(c.toLowerCase()))}
              aria-pressed={selected.includes(c.toLowerCase())}
              onClick={() => toggle(c)}
            >
              <span aria-hidden>{cuisineEmoji(c)}</span> {c}
            </button>
          ))}
        </div>
        <Select value={sort} onValueChange={(v) => setQuery({ sort: String(v) })}>
          <SelectTrigger className="w-[190px] self-end" aria-label="Sort restaurants">
            <SelectValue>{SORTS.find((s) => s.value === sort)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state === "loading" && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      )}
      {state === "error" && (
        <EmptyState tone="error">
          Couldn&apos;t load restaurants.
          <div className="mt-3">
            <Button size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        </EmptyState>
      )}
      {state === "ready" && items.length === 0 && (
        <EmptyState>
          {selected.length
            ? "No restaurants match these filters."
            : "No restaurants in your area yet."}
        </EmptyState>
      )}
      {state === "ready" && items.length > 0 && (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            {items.map((r, i) => (
              <div
                key={r.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}
              >
                <RestaurantCard restaurant={r} />
              </div>
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
        </>
      )}
    </div>
  );
}

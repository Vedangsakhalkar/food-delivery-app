"use client";

import { Clock, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddToCart } from "@/components/cart/add-to-cart";
import { EmptyState } from "@/components/empty-state";
import { RatingBadge } from "@/components/restaurants/rating-badge";
import { ReviewsSection } from "@/components/restaurants/reviews-section";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { formatHHMM } from "@/lib/opening-hours";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";
import type { PublicMenuItem, RestaurantWithMenu } from "@/models/public-restaurant";

function VegMark({ veg }: { veg: boolean }) {
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "mr-2 inline-grid size-4 place-items-center rounded-[3px] border-[1.5px] align-middle",
        veg ? "border-green-600" : "border-red-700",
      )}
    >
      <span className={cn("size-2 rounded-full", veg ? "bg-green-600" : "bg-red-700")} />
    </span>
  );
}

function MenuItemRow({
  item,
  open,
  restaurantId,
}: {
  item: PublicMenuItem;
  open: boolean;
  restaurantId: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md",
        !item.isAvailable && "opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">
          <VegMark veg={item.isVeg} />
          {item.name}
        </h3>
        <div className="mt-0.5 font-medium">{formatMoney(item.pricePaise)}</div>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        )}
        {!item.isAvailable && (
          <span className="mt-2 inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
            Unavailable
          </span>
        )}
      </div>
      <div className="relative flex w-28 flex-none flex-col items-center sm:w-32">
        <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-xs text-muted-foreground">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span aria-hidden className="text-4xl">
              🍽️
            </span>
          )}
        </div>
        <div className="-mt-4 shadow-sm">
          <AddToCart
            restaurantId={restaurantId}
            itemId={item.id}
            disabled={!item.isAvailable || !open}
            label={open ? "ADD" : "Closed"}
          />
        </div>
      </div>
    </div>
  );
}

export function RestaurantView({ id }: { id: string }) {
  const { data, error, loading } = useApi<RestaurantWithMenu>(`/api/restaurants/${id}`);
  const [vegOnly, setVegOnly] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string>();

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data?.categories ?? [])
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) =>
            (!vegOnly || i.isVeg) &&
            (!term ||
              i.name.toLowerCase().includes(term) ||
              i.description.toLowerCase().includes(term)),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [data, vegOnly, q]);

  // Highlight the category pill for the section currently under the sticky bar.
  useEffect(() => {
    const sections = visible
      .map((c) => document.getElementById(`cat-${c.id}`))
      .filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id.replace("cat-", ""));
      },
      { rootMargin: "-140px 0px -65% 0px" },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [visible]);

  if (loading)
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  if (error?.status === 404)
    return <EmptyState icon="🔍">This restaurant isn&apos;t available.</EmptyState>;
  if (error || !data)
    return <EmptyState tone="error">Couldn&apos;t load this restaurant.</EmptyState>;

  const r = data.restaurant;
  const pill = (on: boolean) =>
    cn(
      "flex-none rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition",
      on ? "border-primary bg-primary text-primary-foreground" : "bg-white hover:border-primary/60",
    );

  return (
    <div className="flex animate-in flex-col gap-5 fade-in duration-300">
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div
          className={`aspect-[3/2] w-full flex-none overflow-hidden rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 sm:w-72 ${r.isOpen ? "" : "grayscale"}`}
        >
          {r.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
            <img src={r.imageUrl} alt={r.name} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-6xl" aria-hidden>
              🍽️
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {r.name}
            {!r.isOpen && (
              <span className="ml-2 rounded-md bg-red-100 px-2 py-0.5 align-middle text-xs font-semibold text-red-800">
                Closed now
              </span>
            )}
          </h1>
          <div className="text-muted-foreground">{r.cuisine}</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden /> {r.address}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" aria-hidden /> Open {r.opensAt}–{r.closesAt}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RatingBadge rating={r.avgRating} count={r.ratingCount} />
            {r.ratingCount > 0 && (
              <span className="text-sm text-muted-foreground">({r.ratingCount} reviews)</span>
            )}
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              🛵 {r.deliveryTimeMin}–{r.deliveryTimeMin + 5} min
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              💵 Cash on delivery
            </span>
          </div>
        </div>
      </div>

      {!r.isOpen && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
          This restaurant is closed (opens today at {formatHHMM(r.opensAt)}). You can browse the
          menu, but ordering is disabled until it opens.
        </div>
      )}

      {data.categories.length > 0 && (
        <div className="sticky top-[116px] z-10 -mx-4 flex flex-col gap-2 border-y bg-white/95 px-4 py-2.5 backdrop-blur md:top-[68px]">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-0 flex-1 basis-48">
              <span className="sr-only">Search this menu</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search this menu"
                className="h-9 w-full rounded-full border bg-white pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={vegOnly}
              onClick={() => setVegOnly((v) => !v)}
              className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm font-medium"
            >
              <span
                className={cn(
                  "relative h-5 w-9 rounded-full transition",
                  vegOnly ? "bg-green-600" : "bg-muted-foreground/40",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-4 rounded-full bg-white shadow transition-all",
                    vegOnly ? "left-[18px]" : "left-0.5",
                  )}
                />
              </span>
              Veg only
            </button>
          </div>
          <nav
            aria-label="Menu categories"
            className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1"
          >
            {visible.map((c) => (
              <a key={c.id} href={`#cat-${c.id}`} className={pill(active === c.id)}>
                {c.name}
              </a>
            ))}
          </nav>
        </div>
      )}

      {data.categories.length === 0 && <EmptyState icon="🧑‍🍳">No menu items yet.</EmptyState>}
      {data.categories.length > 0 && visible.length === 0 && (
        <EmptyState icon="🔍">
          No dishes match your search{vegOnly ? " in the vegetarian menu" : ""}.
        </EmptyState>
      )}
      {visible.map((c) => (
        <section key={c.id} id={`cat-${c.id}`} className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">
            {c.name}{" "}
            <span className="text-sm font-normal text-muted-foreground">({c.items.length})</span>
          </h2>
          {c.items.map((item) => (
            <MenuItemRow key={item.id} item={item} open={r.isOpen} restaurantId={r.id} />
          ))}
        </section>
      ))}
      <ReviewsSection restaurantId={r.id} />
    </div>
  );
}

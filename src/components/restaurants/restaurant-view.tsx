"use client";

import { AddToCart } from "@/components/cart/add-to-cart";
import { EmptyState } from "@/components/empty-state";
import { ReviewsSection } from "@/components/restaurants/reviews-section";
import { RatingBadge } from "@/components/restaurants/rating-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { formatHHMM } from "@/lib/opening-hours";
import { useApi } from "@/lib/use-api";
import type { PublicMenuItem, RestaurantWithMenu } from "@/models/public-restaurant";

function VegMark({ veg }: { veg: boolean }) {
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={`mr-2 inline-block size-3 border-[1.5px] align-middle ${veg ? "border-green-600" : "border-red-700"}`}
    />
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
      className={`flex justify-between gap-4 border-b py-4 ${item.isAvailable ? "" : "opacity-50"}`}
    >
      <div className="min-w-0">
        <h3 className="font-semibold">
          <VegMark veg={item.isVeg} />
          {item.name}
        </h3>
        <div>{formatMoney(item.pricePaise)}</div>
        {item.description && (
          <div className="text-sm text-muted-foreground">{item.description}</div>
        )}
        {!item.isAvailable && (
          <span className="mt-1 inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            Unavailable
          </span>
        )}
      </div>
      <div className="flex flex-none flex-col items-center gap-2">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-rose-100 to-amber-100 text-xs text-muted-foreground">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            "photo"
          )}
        </div>
        <AddToCart
          restaurantId={restaurantId}
          itemId={item.id}
          disabled={!item.isAvailable || !open}
          label={open ? "ADD" : "Closed"}
        />
      </div>
    </div>
  );
}

export function RestaurantView({ id }: { id: string }) {
  const { data, error, loading } = useApi<RestaurantWithMenu>(`/api/restaurants/${id}`);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error?.status === 404) return <EmptyState>This restaurant isn&apos;t available.</EmptyState>;
  if (error || !data)
    return <EmptyState tone="error">Couldn&apos;t load this restaurant.</EmptyState>;

  const r = data.restaurant;
  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-sm text-muted-foreground ${r.isOpen ? "" : "grayscale"}`}
      >
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
          <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover" />
        ) : (
          "Cover image"
        )}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">
            {r.name}
            {!r.isOpen && (
              <span className="ml-2 rounded-md bg-red-100 px-2 py-0.5 align-middle text-xs font-semibold text-red-700">
                Closed now
              </span>
            )}
          </h1>
          <div className="text-sm text-muted-foreground">
            {r.cuisine} · {r.address} · Open {r.opensAt}–{r.closesAt}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RatingBadge rating={r.avgRating} count={r.ratingCount} />
          {r.ratingCount > 0 && (
            <span className="text-sm text-muted-foreground">({r.ratingCount} reviews)</span>
          )}
        </div>
      </div>

      {!r.isOpen && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          This restaurant is closed (opens today at {formatHHMM(r.opensAt)}). You can browse the
          menu, but ordering is disabled until it opens.
        </div>
      )}
      {data.categories.length === 0 && <EmptyState>No menu items yet.</EmptyState>}
      {data.categories.map((c) => (
        <section key={c.id}>
          <h2 className="mt-2 text-lg font-semibold">{c.name}</h2>
          {c.items.map((item) => (
            <MenuItemRow key={item.id} item={item} open={r.isOpen} restaurantId={r.id} />
          ))}
        </section>
      ))}
      <ReviewsSection restaurantId={r.id} />
    </div>
  );
}

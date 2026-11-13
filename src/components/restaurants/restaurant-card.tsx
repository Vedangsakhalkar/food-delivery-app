import { Clock } from "lucide-react";
import Link from "next/link";
import { RatingBadge } from "@/components/restaurants/rating-badge";
import { formatHHMM } from "@/lib/opening-hours";
import type { PublicRestaurant } from "@/models/public-restaurant";

export function deliveryRange(min: number) {
  return `${min}–${min + 5} min`;
}

/** Restaurant tile: big image with delivery-time pill, name, rating, cuisine (mock C1, refreshed). */
export function RestaurantCard({ restaurant: r }: { restaurant: PublicRestaurant }) {
  return (
    <Link
      href={`/restaurants/${r.id}`}
      className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:outline-none"
    >
      <div
        className={`relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-rose-100 to-amber-100 ${r.isOpen ? "" : "grayscale"}`}
      >
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
          <img
            src={r.imageUrl}
            alt={r.name}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-5xl" aria-hidden>
            🍽️
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 text-xs font-semibold text-white">
          <Clock className="size-3.5" aria-hidden />
          {r.isOpen ? deliveryRange(r.deliveryTimeMin) : `Opens ${formatHHMM(r.opensAt)}`}
        </span>
        {!r.isOpen && (
          <span className="absolute top-2 right-2 rounded-md bg-red-700 px-2 py-0.5 text-xs font-semibold text-white">
            Closed
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="leading-tight font-semibold">{r.name}</h3>
          <RatingBadge rating={r.avgRating} count={r.ratingCount} />
        </div>
        <div className="line-clamp-1 text-sm text-muted-foreground">{r.cuisine}</div>
      </div>
    </Link>
  );
}

/** Loading placeholder with the same shape as a card. */
export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="aspect-[3/2] animate-pulse bg-muted" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

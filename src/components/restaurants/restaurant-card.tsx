import Link from "next/link";
import { formatHHMM } from "@/lib/opening-hours";
import { RatingBadge } from "@/components/restaurants/rating-badge";
import type { PublicRestaurant } from "@/models/public-restaurant";

export function deliveryRange(min: number) {
  return `${min}–${min + 5} min`;
}

/** Restaurant tile on the home page (mock C1). */
export function RestaurantCard({ restaurant: r }: { restaurant: PublicRestaurant }) {
  return (
    <Link
      href={`/restaurants/${r.id}`}
      className="block overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
    >
      <div
        className={`flex h-36 items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100 text-xs text-muted-foreground ${r.isOpen ? "" : "grayscale"}`}
      >
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
          <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover" />
        ) : (
          "Restaurant photo"
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold">{r.name}</h3>
          {r.isOpen ? (
            <RatingBadge rating={r.avgRating} count={r.ratingCount} />
          ) : (
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              Closed
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{r.cuisine}</div>
        <div className="text-sm text-muted-foreground">
          {r.isOpen ? deliveryRange(r.deliveryTimeMin) : `Opens ${formatHHMM(r.opensAt)}`}
        </div>
      </div>
    </Link>
  );
}

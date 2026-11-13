import Link from "next/link";
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
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100 text-xs text-muted-foreground">
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
          <RatingBadge rating={r.avgRating} count={r.ratingCount} />
        </div>
        <div className="text-sm text-muted-foreground">{r.cuisine}</div>
        <div className="text-sm text-muted-foreground">{deliveryRange(r.deliveryTimeMin)}</div>
      </div>
    </Link>
  );
}

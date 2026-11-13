import { Star } from "lucide-react";

/** Green rating pill, or a "New" pill until a restaurant has reviews. */
export function RatingBadge({ rating, count }: { rating: number; count: number }) {
  if (count === 0) {
    return (
      <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-900">
        NEW
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-green-700 px-1.5 py-0.5 text-xs font-bold text-white">
      {rating.toFixed(1)} <Star className="size-3 fill-current" aria-label="stars" />
    </span>
  );
}

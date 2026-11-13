/** Green rating pill, or "New" until a restaurant has reviews. */
export function RatingBadge({ rating, count }: { rating: number; count: number }) {
  if (count === 0) {
    return <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-bold">New</span>;
  }
  return (
    <span className="rounded-md bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">
      {rating.toFixed(1)} ★
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Review } from "@/models/review";

type Page = { reviews: Review[]; nextCursor: string | null };

export const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

/** Reviews list on the restaurant page (mock C3). */
export function ReviewsSection({ restaurantId }: { restaurantId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load(next?: string | null) {
    try {
      const page = await apiFetch<Page>(
        `/api/restaurants/${restaurantId}/reviews${next ? `?cursor=${encodeURIComponent(next)}` : ""}`,
      );
      setReviews((prev) => (next ? [...prev, ...page.reviews] : page.reviews));
      setCursor(page.nextCursor);
    } catch {
      /* the section simply stays empty */
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  if (!loaded || reviews.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="mt-2 text-lg font-semibold">Reviews</h2>
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border bg-white p-4">
          <div
            className="text-xl tracking-wider text-amber-500"
            aria-label={`${r.rating} out of 5`}
          >
            {stars(r.rating)}
          </div>
          {r.comment && <div>&ldquo;{r.comment}&rdquo;</div>}
          <div className="text-sm text-muted-foreground">
            — {r.reviewerName} · {formatDate(r.createdAt)}
          </div>
        </div>
      ))}
      {cursor && (
        <Button variant="outline" className="self-center" onClick={() => void load(cursor)}>
          Load more reviews
        </Button>
      )}
    </section>
  );
}

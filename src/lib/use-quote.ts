"use client";

import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api-client";
import type { CartState } from "@/lib/cart";
import type { Quote } from "@/services/quote-service";

/** Asks the server to price the cart whenever it changes. */
export function useQuote(cart: CartState) {
  const [quote, setQuote] = useState<Quote>();
  const [error, setError] = useState<ApiError>();
  const [loading, setLoading] = useState(false);
  const key = JSON.stringify(cart);

  useEffect(() => {
    if (!cart.restaurantId || cart.lines.length === 0) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start of an async fetch
    setLoading(true);
    apiFetch<Quote>("/api/quote", {
      method: "POST",
      body: { restaurantId: cart.restaurantId, lines: cart.lines },
    })
      .then((q) => {
        if (cancelled) return;
        setQuote(q);
        setError(undefined);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof ApiError ? e : new ApiError(0, "network", "Network error"));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quote, error, loading };
}

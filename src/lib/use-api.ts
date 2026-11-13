"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api-client";

export interface UseApiResult<T> {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  reload: () => Promise<void>;
}

/** Loads JSON from one of our /api routes; optional polling for live screens. */
export function useApi<T>(path: string | null, options: { pollMs?: number } = {}): UseApiResult<T> {
  const { pollMs } = options;
  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError>();
  const [loading, setLoading] = useState(!!path);
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!path) return;
    try {
      const result = await apiFetch<T>(path);
      if (!alive.current) return;
      setData(result);
      setError(undefined);
    } catch (e) {
      if (alive.current)
        setError(e instanceof ApiError ? e : new ApiError(0, "network", "Network error"));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    alive.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount/path change
    void load();
    if (!pollMs) return () => void (alive.current = false);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, pollMs);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load, pollMs]);

  return { data, error, loading, reload: load };
}

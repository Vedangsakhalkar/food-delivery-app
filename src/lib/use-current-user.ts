"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Role } from "@/models/user";

export type SessionUser = { id: string; name: string; email: string; role: Role };

/** Client view of the session: undefined while loading, null for guests. */
export function useCurrentUser(): SessionUser | null | undefined {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  useEffect(() => {
    apiFetch<{ user: SessionUser }>("/api/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null));
  }, []);
  return user;
}

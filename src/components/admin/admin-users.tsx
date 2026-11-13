"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { User } from "@/models/user";

type Page = { users: User[]; nextCursor: string | null };

const ROLE_TONE: Record<User["role"], string> = {
  customer: "bg-muted",
  owner: "bg-amber-100 text-amber-800",
  admin: "bg-red-100 text-red-700",
};

/** Admin: every user, read-only, filter by role and search by email or name (mock M3). */
export function AdminUsers() {
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [rows, setRows] = useState<User[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  async function load(next?: string | null) {
    try {
      const qs = new URLSearchParams();
      if (role) qs.set("role", role);
      if (appliedQ) qs.set("q", appliedQ);
      if (next) qs.set("cursor", next);
      const page = await apiFetch<Page>(`/api/admin/users?${qs}`);
      setRows((prev) => (next ? [...prev, ...page.users] : page.users));
      setCursor(page.nextCursor);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reload when filters change
    setState("loading");
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, appliedQ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">All users (read-only)</h1>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Filter by role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="owner">Owners</option>
          <option value="admin">Admins</option>
        </select>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedQ(q.trim());
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or name"
            aria-label="Search email or name"
            className="w-56"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {state === "loading" && <Skeleton className="h-40 w-full" />}
      {state === "error" && <EmptyState tone="error">Couldn&apos;t load users.</EmptyState>}
      {state === "ready" && rows.length === 0 && <EmptyState>No users found.</EmptyState>}
      {state === "ready" && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name || "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
                        ROLE_TONE[u.role],
                      )}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {cursor && (
        <Button variant="outline" className="self-center" onClick={() => void load(cursor)}>
          Load more
        </Button>
      )}
    </div>
  );
}

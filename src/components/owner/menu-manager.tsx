"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { NameDialog } from "@/components/owner/name-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiFetch } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import type { MenuCategory } from "@/models/menu";

type Dialogs =
  | { type: "add" }
  | { type: "rename"; category: MenuCategory }
  | { type: "delete"; category: MenuCategory }
  | null;

const url = (id: string) => `/api/owner/categories/${id}`;

export function MenuManager() {
  const { data, error, loading, reload } = useApi<{ categories: MenuCategory[] }>(
    "/api/owner/categories",
  );
  const [dialog, setDialog] = useState<Dialogs>(null);

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      toast.success(success);
      await reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
      throw err;
    }
  }
  const move = (id: string, dir: "up" | "down") =>
    run(() => apiFetch(url(id), { method: "PATCH", body: { move: dir } }), "Order updated").catch(
      () => undefined,
    );

  const categories = data?.categories ?? [];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Menu</h1>
        <Button size="sm" variant="outline" onClick={() => setDialog({ type: "add" })}>
          + Category
        </Button>
      </div>

      {loading && <Skeleton className="h-32 w-full" />}
      {error?.status === 404 && (
        <p className="text-muted-foreground">Create your restaurant first to build a menu.</p>
      )}
      {data && categories.length === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-white p-8 text-center text-muted-foreground">
          No categories yet. Add your first category to start building the menu.
        </div>
      )}

      {categories.map((c, i) => (
        <Card key={c.id}>
          <CardContent className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{c.name}</h3>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="ghost"
                disabled={i === 0}
                aria-label={`Move ${c.name} up`}
                onClick={() => void move(c.id, "up")}
              >
                ↑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={i === categories.length - 1}
                aria-label={`Move ${c.name} down`}
                onClick={() => void move(c.id, "down")}
              >
                ↓
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDialog({ type: "rename", category: c })}
              >
                Rename
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDialog({ type: "delete", category: c })}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {dialog?.type === "add" && (
        <NameDialog
          open
          onOpenChange={() => setDialog(null)}
          title="Add category"
          submitLabel="Add"
          onSubmit={(name) =>
            run(
              () => apiFetch("/api/owner/categories", { method: "POST", body: { name } }),
              "Category added",
            )
          }
        />
      )}
      {dialog?.type === "rename" && (
        <NameDialog
          open
          onOpenChange={() => setDialog(null)}
          title="Rename category"
          submitLabel="Save"
          initial={dialog.category.name}
          onSubmit={(name) =>
            run(
              () => apiFetch(url(dialog.category.id), { method: "PATCH", body: { name } }),
              "Category renamed",
            )
          }
        />
      )}
      {dialog?.type === "delete" && (
        <ConfirmDialog
          open
          onOpenChange={() => setDialog(null)}
          title={`Delete ${dialog.category.name}?`}
          description="All items in this category will be deleted too. This cannot be undone."
          confirmLabel="Delete"
          onConfirm={() =>
            run(
              () => apiFetch(url(dialog.category.id), { method: "DELETE" }),
              "Category deleted",
            ).catch(() => undefined)
          }
        />
      )}
    </div>
  );
}

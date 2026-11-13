"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/owner/image-upload";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiFetch } from "@/lib/api-client";
import { validateForm } from "@/lib/form-errors";
import { useApi } from "@/lib/use-api";
import type { MenuCategory, MenuItem } from "@/models/menu";
import { itemSchema } from "@/validators/menu";

type Image = { path: string | null; url: string | null };

function Inner({ item, categories }: { item?: MenuItem; categories: MenuCategory[] }) {
  const router = useRouter();
  const [v, setV] = useState({
    name: item?.name ?? "",
    description: item?.description ?? "",
    categoryId: item?.categoryId ?? categories[0]?.id ?? "",
    price: item ? String(item.pricePaise / 100) : "",
    isVeg: item?.isVeg ?? false,
    isAvailable: item?.isAvailable ?? true,
  });
  const [image, setImage] = useState<Image>();
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);
  const shown = image ? image.url : (item?.imageUrl ?? null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateForm(itemSchema, v);
    if (parsed.errors) return setErrors(parsed.errors as Record<string, string>);
    setErrors({});
    setBusy(true);
    try {
      const body = image ? { ...v, imagePath: image.path } : v;
      await apiFetch(item ? `/api/owner/items/${item.id}` : "/api/owner/items", {
        method: item ? "PATCH" : "POST",
        body,
      });
      toast.success(item ? "Item updated" : "Item added");
      router.push("/owner/menu");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save the item");
      setBusy(false);
    }
  }

  const err = (k: string) => errors[k] && <FieldError>{errors[k]}</FieldError>;
  return (
    <Card>
      <CardContent>
        <form onSubmit={submit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                value={v.name}
                onChange={(e) => setV({ ...v, name: e.target.value })}
              />
              {err("name")}
            </Field>
            <Field data-invalid={!!errors.categoryId}>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <select
                id="category"
                value={v.categoryId}
                onChange={(e) => setV({ ...v, categoryId: e.target.value })}
                className="h-9 rounded-lg border bg-background px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {err("categoryId")}
            </Field>
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="price">Price (₹)</FieldLabel>
              <Input
                id="price"
                inputMode="decimal"
                value={v.price}
                onChange={(e) => setV({ ...v, price: e.target.value })}
              />
              {err("price")}
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <textarea
                id="description"
                rows={3}
                value={v.description}
                onChange={(e) => setV({ ...v, description: e.target.value })}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
              {err("description")}
            </Field>
            <ImageUpload
              kind="items"
              url={shown}
              onChange={(x) => setImage(x ?? { path: null, url: null })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={v.isVeg}
                onChange={(e) => setV({ ...v, isVeg: e.target.checked })}
              />{" "}
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={v.isAvailable}
                onChange={(e) => setV({ ...v, isAvailable: e.target.checked })}
              />{" "}
              Available
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save item"}
              </Button>
              <Link href="/owner/menu" className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export function ItemForm({ id }: { id: string }) {
  const isNew = id === "new";
  const cats = useApi<{ categories: MenuCategory[] }>("/api/owner/categories");
  const one = useApi<{ item: MenuItem }>(isNew ? null : `/api/owner/items/${id}`);
  const loading = cats.loading || one.loading;
  return (
    <div className="flex max-w-[640px] flex-col gap-4">
      <h1 className="text-2xl font-semibold">{isNew ? "Add item" : "Edit item"}</h1>
      {loading && <Skeleton className="h-96 w-full" />}
      {one.error && <p className="text-destructive">Item not found.</p>}
      {!loading && cats.data && !one.error && (
        <Inner item={one.data?.item} categories={cats.data.categories} />
      )}
    </div>
  );
}

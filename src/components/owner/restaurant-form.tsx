"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError, apiFetch } from "@/lib/api-client";
import { validateForm, type FieldErrors } from "@/lib/form-errors";
import type { Restaurant } from "@/models/restaurant";
import { ImageUpload } from "@/components/owner/image-upload";
import { restaurantSchema, type RestaurantInput } from "@/validators/restaurant";

type Values = {
  name: string;
  cuisine: string;
  address: string;
  opensAt: string;
  closesAt: string;
  deliveryTimeMin: string;
};

export function RestaurantForm({
  restaurant,
  onSaved,
}: {
  restaurant?: Restaurant;
  onSaved: (r: Restaurant) => void;
}) {
  const [values, setValues] = useState<Values>({
    name: restaurant?.name ?? "",
    cuisine: restaurant?.cuisine ?? "",
    address: restaurant?.address ?? "",
    opensAt: restaurant?.opensAt ?? "11:00",
    closesAt: restaurant?.closesAt ?? "23:00",
    deliveryTimeMin: String(restaurant?.deliveryTimeMin ?? 30),
  });
  const [image, setImage] = useState<{ path: string | null; url: string | null } | undefined>();
  const shownUrl = image ? image.url : (restaurant?.imageUrl ?? null);
  const [errors, setErrors] = useState<FieldErrors<RestaurantInput>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateForm(restaurantSchema, values);
    if (parsed.errors) return setErrors(parsed.errors);
    setErrors({});
    setLoading(true);
    try {
      const res = await apiFetch<{ restaurant: Restaurant }>("/api/owner/restaurant", {
        method: restaurant ? "PATCH" : "POST",
        body: image ? { ...parsed.data, imagePath: image.path } : parsed.data,
      });
      toast.success(restaurant ? "Restaurant updated" : "Your restaurant is live!");
      onSaved(res.restaurant);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save the restaurant");
    } finally {
      setLoading(false);
    }
  }

  const text = (k: keyof Values, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <Field data-invalid={!!errors[k as keyof RestaurantInput]}>
      <FieldLabel htmlFor={k}>{label}</FieldLabel>
      <Input id={k} value={values[k]} onChange={set(k)} {...props} />
      {errors[k as keyof RestaurantInput] && (
        <FieldError>{errors[k as keyof RestaurantInput]}</FieldError>
      )}
    </Field>
  );

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <ImageUpload
              kind="restaurants"
              url={shownUrl}
              onChange={(v) => setImage(v ?? { path: null, url: null })}
              label="Cover image (JPG/PNG/WebP, max 5 MB)"
            />
            {text("name", "Name")}
            {text("cuisine", "Cuisine", { placeholder: "North Indian, Biryani" })}
            {text("address", "Address", { placeholder: "MG Road, Pune" })}
            <div className="grid grid-cols-2 gap-3">
              {text("opensAt", "Opens at", { type: "time" })}
              {text("closesAt", "Closes at", { type: "time" })}
            </div>
            {text("deliveryTimeMin", "Delivery time (minutes)", { type: "number", min: 5 })}
            <Button type="submit" disabled={loading} className="self-start">
              {loading ? "Saving…" : restaurant ? "Save" : "Create restaurant"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

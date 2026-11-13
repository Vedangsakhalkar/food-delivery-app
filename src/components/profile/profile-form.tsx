"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError, apiFetch } from "@/lib/api-client";
import { validateForm, type FieldErrors } from "@/lib/form-errors";
import { updateProfileSchema, type UpdateProfileInput } from "@/validators/auth";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; phone: string; email: string };
}) {
  const router = useRouter();
  const [values, setValues] = useState({ name: initial.name, phone: initial.phone });
  const [errors, setErrors] = useState<FieldErrors<UpdateProfileInput>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateForm(updateProfileSchema, values);
    if (parsed.errors) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await apiFetch("/api/me", { method: "PATCH", body: parsed.data });
      toast.success("Profile updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save your profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                type="tel"
                value={values.phone}
                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <FieldError>{errors.phone}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" value={initial.email} disabled readOnly />
            </Field>
            <Button type="submit" disabled={loading} className="self-start">
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

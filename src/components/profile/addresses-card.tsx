"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiFetch } from "@/lib/api-client";
import { validateForm } from "@/lib/form-errors";
import { useApi } from "@/lib/use-api";
import type { Address } from "@/models/address";
import { addressSchema } from "@/validators/address";

const FIELDS = [
  { key: "label", label: "Label", placeholder: "Home" },
  { key: "line1", label: "Street address", placeholder: "12 Baner Road" },
  { key: "city", label: "City", placeholder: "Pune" },
  { key: "pincode", label: "Pincode", placeholder: "411045" },
] as const;

export function AddressDialog({
  address,
  onClose,
  onSaved,
}: {
  address: Address | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [v, setV] = useState({
    label: address?.label ?? "",
    line1: address?.line1 ?? "",
    city: address?.city ?? "",
    pincode: address?.pincode ?? "",
    isDefault: address?.isDefault ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = validateForm(addressSchema, v);
    if (parsed.errors) return setErrors(parsed.errors as Record<string, string>);
    setErrors({});
    setBusy(true);
    try {
      await apiFetch(address ? `/api/me/addresses/${address.id}` : "/api/me/addresses", {
        method: address ? "PATCH" : "POST",
        body: parsed.data,
      });
      toast.success(address ? "Address updated" : "Address added");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save the address");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{address ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            {FIELDS.map((f) => (
              <Field key={f.key} data-invalid={!!errors[f.key]}>
                <FieldLabel htmlFor={`addr-${f.key}`}>{f.label}</FieldLabel>
                <Input
                  id={`addr-${f.key}`}
                  placeholder={f.placeholder}
                  value={v[f.key]}
                  inputMode={f.key === "pincode" ? "numeric" : undefined}
                  onChange={(e) => setV({ ...v, [f.key]: e.target.value })}
                  aria-invalid={!!errors[f.key]}
                />
                {errors[f.key] && <FieldError>{errors[f.key]}</FieldError>}
              </Field>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={v.isDefault}
                disabled={address?.isDefault}
                onChange={(e) => setV({ ...v, isDefault: e.target.checked })}
              />{" "}
              Use as my default address
            </label>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type Dialogs =
  { type: "form"; address: Address | null } | { type: "delete"; address: Address } | null;

/** Saved delivery addresses on the profile page (mock A4). */
export function AddressesCard() {
  const { data, error, loading, reload } = useApi<{ addresses: Address[] }>("/api/me/addresses");
  const [dialog, setDialog] = useState<Dialogs>(null);

  async function remove(a: Address) {
    try {
      await apiFetch(`/api/me/addresses/${a.id}`, { method: "DELETE" });
      toast.success("Address deleted");
      await reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete the address");
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Saved addresses</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDialog({ type: "form", address: null })}
        >
          + Add address
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col">
        {loading && <Skeleton className="h-16 w-full" />}
        {error && <p className="text-destructive">Couldn&apos;t load your addresses.</p>}
        {data?.addresses.length === 0 && (
          <p className="text-muted-foreground">No saved addresses yet.</p>
        )}
        {data?.addresses.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 border-t py-3">
            <div>
              <b>{a.label}</b>
              {a.isDefault && (
                <span className="ml-2 rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  Default
                </span>
              )}
              <div className="text-sm text-muted-foreground">
                {a.line1}, {a.city} {a.pincode}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDialog({ type: "form", address: a })}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDialog({ type: "delete", address: a })}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      {dialog?.type === "form" && (
        <AddressDialog
          address={dialog.address}
          onClose={() => setDialog(null)}
          onSaved={() => void reload()}
        />
      )}
      {dialog?.type === "delete" && (
        <ConfirmDialog
          open
          onOpenChange={() => setDialog(null)}
          title={`Delete ${dialog.address.label}?`}
          description="Past orders are not affected; they keep their own copy of the address."
          confirmLabel="Delete"
          onConfirm={() => remove(dialog.address)}
        />
      )}
    </Card>
  );
}

"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api-client";

/** Uploads to /api/owner/uploads and reports the stored { path, url }. null = removed. */
export function ImageUpload({
  kind,
  url,
  onChange,
  label = "Image (JPG/PNG/WebP, max 5 MB)",
}: {
  kind: "restaurants" | "items";
  url: string | null;
  onChange: (value: { path: string; url: string } | null) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return void toast.error("Image must be 5 MB or smaller");
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    setBusy(true);
    try {
      onChange(
        await apiFetch<{ path: string; url: string }>("/api/owner/uploads", {
          method: "POST",
          body: form,
        }),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-rose-100 to-amber-100 text-xs text-muted-foreground">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          "No image"
        )}
      </div>
      <div className="flex gap-2">
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={pick}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
        </Button>
        {url && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

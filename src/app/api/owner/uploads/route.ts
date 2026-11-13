import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { storageService } from "@/lib/supabase/storage-adapter";
import { IMAGE_MAX_BYTES, ImageRejectedError } from "@/services/storage-service";

export const POST = withErrorHandling(async (req) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind") === "items" ? "items" : "restaurants";
  if (!(file instanceof File)) throw new ValidationError("Choose an image file to upload");
  if (file.size > IMAGE_MAX_BYTES) throw new ValidationError("Image must be 5 MB or smaller");
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await storageService.uploadImage(kind, owner.id, bytes, file.type);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ImageRejectedError) throw new ValidationError(err.message);
    throw err;
  }
});

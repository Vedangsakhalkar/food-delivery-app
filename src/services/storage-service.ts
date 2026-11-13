/** Adapter over the object store (Supabase Storage). Services depend on this interface only. */
export interface StorageAdapter {
  upload(path: string, bytes: Uint8Array, contentType: string): Promise<void>;
  remove(path: string): Promise<void>;
  publicUrl(path: string): string;
}

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const TYPES: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": {
    ext: "png",
    magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  "image/webp": {
    ext: "webp",
    magic: (b) =>
      String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  },
};

export type ImageKind = "restaurants" | "items";

export class ImageRejectedError extends Error {}

/** Checks declared type, real file signature and size (JPG/PNG/WebP, max 5 MB). */
export function validateImage(bytes: Uint8Array, contentType: string): { ext: string } {
  const t = TYPES[contentType];
  if (!t) throw new ImageRejectedError("Only JPG, PNG or WebP images are allowed");
  if (bytes.byteLength === 0) throw new ImageRejectedError("The file is empty");
  if (bytes.byteLength > IMAGE_MAX_BYTES)
    throw new ImageRejectedError("Image must be 5 MB or smaller");
  if (!t.magic(bytes)) throw new ImageRejectedError("The file is not a valid image");
  return { ext: t.ext };
}

export function ownerImagePrefix(kind: ImageKind, ownerId: string) {
  return `${kind}/${ownerId}/`;
}

export function createStorageService(
  adapter: StorageAdapter,
  uuid: () => string = () => crypto.randomUUID(),
) {
  return {
    async uploadImage(kind: ImageKind, ownerId: string, bytes: Uint8Array, contentType: string) {
      const { ext } = validateImage(bytes, contentType);
      const path = `${ownerImagePrefix(kind, ownerId)}${uuid()}.${ext}`;
      await adapter.upload(path, bytes, contentType);
      return { path, url: adapter.publicUrl(path) };
    },
    publicUrl: (path: string) => adapter.publicUrl(path),
    /** Best effort: callers must not fail because cleanup failed. */
    async removeQuietly(path: string | null | undefined) {
      if (!path) return;
      try {
        await adapter.remove(path);
      } catch {
        /* logged by the adapter */
      }
    },
    /** True if the path lives in this owner's folder for the given kind. */
    ownsPath(kind: ImageKind, ownerId: string, path: string) {
      return path.startsWith(ownerImagePrefix(kind, ownerId)) && !path.includes("..");
    },
  };
}

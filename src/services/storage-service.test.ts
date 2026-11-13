import { describe, expect, it, vi } from "vitest";
import {
  IMAGE_MAX_BYTES,
  ImageRejectedError,
  createStorageService,
  validateImage,
  type StorageAdapter,
} from "@/services/storage-service";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1]);
const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);

describe("validateImage", () => {
  it("accepts JPG, PNG and WebP with matching signatures", () => {
    expect(validateImage(png, "image/png").ext).toBe("png");
    expect(validateImage(jpg, "image/jpeg").ext).toBe("jpg");
    expect(validateImage(webp, "image/webp").ext).toBe("webp");
  });
  it("rejects other types, spoofed content and oversize files", () => {
    expect(() => validateImage(png, "image/gif")).toThrow(ImageRejectedError);
    expect(() => validateImage(jpg, "image/png")).toThrow("not a valid image");
    expect(() => validateImage(new Uint8Array(IMAGE_MAX_BYTES + 1), "image/png")).toThrow("5 MB");
    expect(() => validateImage(new Uint8Array(), "image/png")).toThrow("empty");
  });
});

describe("storageService", () => {
  const adapter = (): StorageAdapter => ({
    upload: vi.fn(async () => {}),
    remove: vi.fn(async () => {}),
    publicUrl: (p) => `https://cdn/${p}`,
  });

  it("uploads under the owner's folder and returns path and url", async () => {
    const a = adapter();
    const svc = createStorageService(a, () => "uuid1");
    const res = await svc.uploadImage("restaurants", "o1", png, "image/png");
    expect(res).toEqual({
      path: "restaurants/o1/uuid1.png",
      url: "https://cdn/restaurants/o1/uuid1.png",
    });
    expect(a.upload).toHaveBeenCalledWith("restaurants/o1/uuid1.png", png, "image/png");
  });

  it("only owns paths in its own folder and never swallow-fails removal", async () => {
    const a = adapter();
    (a.remove as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("x"));
    const svc = createStorageService(a);
    expect(svc.ownsPath("items", "o1", "items/o1/a.png")).toBe(true);
    expect(svc.ownsPath("items", "o1", "items/o2/a.png")).toBe(false);
    expect(svc.ownsPath("items", "o1", "items/o1/../o2/a.png")).toBe(false);
    await expect(svc.removeQuietly("items/o1/a.png")).resolves.toBeUndefined();
  });
});

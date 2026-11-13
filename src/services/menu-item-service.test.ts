import { describe, expect, it, vi } from "vitest";
import { createMenuItemService } from "@/services/menu-item-service";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { itemSchema } from "@/validators/menu";
import type { MenuItem } from "@/models/menu";
import type { User } from "@/models/user";
import type { MenuItemRepository } from "@/repositories/menu-item-repository";

const CAT = "11111111-1111-4111-8111-111111111111";
const owner = { id: "o1" } as User;
const input = itemSchema.parse({ name: "Biryani", categoryId: CAT, price: "320.50", isVeg: false });
const existing = { id: "i1", categoryId: CAT, imagePath: "items/o1/old.png" } as MenuItem;

function setup(found: MenuItem | null = existing) {
  const items: MenuItemRepository = {
    listByRestaurant: vi.fn(async () => []),
    find: vi.fn(async () => found),
    insert: vi.fn(async () => existing),
    update: vi.fn(async () => existing),
    remove: vi.fn(async () => true),
  };
  const storage = {
    ownsPath: (_k: string, o: string, p: string) => p.startsWith(`items/${o}/`),
    publicUrl: (p: string) => `https://cdn/${p}`,
    removeQuietly: vi.fn(async () => {}),
  };
  const svc = createMenuItemService(
    items,
    { list: async () => [{ id: CAT, restaurantId: "r1", name: "c", sortOrder: 0 }] },
    { findByOwner: async () => ({ id: "r1" }) as never },
    storage,
  );
  return { items, storage, svc };
}

describe("itemSchema", () => {
  it("converts rupees to integer paise", () => {
    expect(input.price).toBe(32050);
    expect(itemSchema.parse({ ...input, price: "0.1", categoryId: CAT }).price).toBe(10);
  });
  it.each([{ price: "0" }, { price: "-5" }, { price: "abc" }, { name: " " }, { categoryId: "x" }])(
    "rejects %j",
    (bad) => expect(itemSchema.safeParse({ ...input, price: "10", ...bad }).success).toBe(false),
  );
});

describe("menuItemService", () => {
  it("rejects a category from another restaurant", async () => {
    const { svc } = setup();
    const other = { ...input, categoryId: "22222222-2222-4222-8222-222222222222" };
    await expect(svc.create(owner, other)).rejects.toBeInstanceOf(ValidationError);
  });

  it("stores integer paise on create", async () => {
    const { svc, items } = setup();
    await svc.create(owner, input);
    expect(items.insert).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ pricePaise: 32050 }),
      undefined,
    );
  });

  it("replaces an image and deletes the old object", async () => {
    const { svc, storage } = setup();
    await svc.update(owner, "i1", { ...input, imagePath: "items/o1/new.png" });
    expect(storage.removeQuietly).toHaveBeenCalledWith("items/o1/old.png");
  });

  it("rejects image paths from other owners", async () => {
    const { svc } = setup();
    await expect(
      svc.update(owner, "i1", { ...input, imagePath: "items/o2/x.png" }),
    ).rejects.toThrow("Invalid image");
  });

  it("deleting an item deletes its image; unknown ids 404", async () => {
    const a = setup();
    await a.svc.remove(owner, "i1");
    expect(a.storage.removeQuietly).toHaveBeenCalledWith("items/o1/old.png");
    await expect(setup(null).svc.remove(owner, "zzz")).rejects.toBeInstanceOf(NotFoundError);
    await expect(setup(null).svc.get(owner, "zzz")).rejects.toBeInstanceOf(NotFoundError);
  });
});

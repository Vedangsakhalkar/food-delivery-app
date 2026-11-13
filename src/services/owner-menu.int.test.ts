import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestUser } from "@/test/int-helpers";
import { userService } from "@/services/user-service";
import { restaurantService } from "@/services/restaurant-service";
import { menuCategoryService } from "@/services/menu-category-service";
import { menuItemService } from "@/services/menu-item-service";
import { itemSchema } from "@/validators/menu";
import { getPool } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import type { User } from "@/models/user";

let t: Awaited<ReturnType<typeof createTestUser>>;
let owner: User;

beforeAll(async () => {
  t = await createTestUser("owner");
  owner = await userService.ensureUser({ id: t.id, email: t.email, metadata: t.metadata });
});
afterAll(async () => {
  await t?.cleanup();
  await getPool().end();
});

describe("owner restaurant + categories against the real database", () => {
  it("creates the users row with the whitelisted role", () => {
    expect(owner.role).toBe("owner");
    expect(owner.phone).toBe("9876543210");
  });

  it("creates one restaurant, rejects a second", async () => {
    const r = await restaurantService.create(owner, {
      name: "Int Test Kitchen",
      cuisine: "Test",
      address: "1 Test Rd",
      opensAt: "11:00",
      closesAt: "23:00",
      deliveryTimeMin: 30,
    });
    expect(r.opensAt).toBe("11:00");
    expect(r.isDisabled).toBe(false);
    await expect(
      restaurantService.create(owner, {
        name: "x",
        cuisine: "x",
        address: "x",
        opensAt: "10:00",
        closesAt: "11:00",
        deliveryTimeMin: 20,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("manages categories: add, order, rename, duplicate, delete", async () => {
    const a = await menuCategoryService.create(owner, "Starters");
    const b = await menuCategoryService.create(owner, "Mains");
    expect((await menuCategoryService.list(owner)).map((c) => c.name)).toEqual([
      "Starters",
      "Mains",
    ]);
    const moved = await menuCategoryService.update(owner, b.id, { move: "up" });
    expect(moved.map((c) => c.name)).toEqual(["Mains", "Starters"]);
    await menuCategoryService.update(owner, a.id, { name: "Snacks" });
    await expect(menuCategoryService.create(owner, "snacks")).rejects.toBeInstanceOf(ConflictError);
    await menuCategoryService.remove(owner, a.id);
    expect((await menuCategoryService.list(owner)).map((c) => c.name)).toEqual(["Mains"]);
  });

  it("manages items with integer paise, availability and cascade on category delete", async () => {
    const cat = await menuCategoryService.create(owner, "Biryani");
    const item = await menuItemService.create(
      owner,
      itemSchema.parse({ name: "Dum Biryani", categoryId: cat.id, price: "320.5", isVeg: false }),
    );
    expect(item.pricePaise).toBe(32050);
    const edited = await menuItemService.update(
      owner,
      item.id,
      itemSchema.parse({
        name: "Dum Biryani",
        categoryId: cat.id,
        price: "330",
        isAvailable: false,
      }),
    );
    expect(edited.pricePaise).toBe(33000);
    expect(edited.isAvailable).toBe(false);
    expect(await menuItemService.list(owner)).toHaveLength(1);
    await menuCategoryService.remove(owner, cat.id);
    expect(await menuItemService.list(owner)).toHaveLength(0);
  });
});

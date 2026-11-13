import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestUser } from "@/test/int-helpers";
import { userService } from "@/services/user-service";
import { restaurantService } from "@/services/restaurant-service";
import { menuCategoryService } from "@/services/menu-category-service";
import { menuItemService } from "@/services/menu-item-service";
import { searchService } from "@/services/search-service";
import { discoveryService } from "@/services/discovery-service";
import { itemSchema } from "@/validators/menu";
import { getPool, query } from "@/lib/db";
import type { User } from "@/models/user";

let t: Awaited<ReturnType<typeof createTestUser>>;
let owner: User;
let restaurantId: string;
const TAG = `Zq${Date.now()}`;

beforeAll(async () => {
  t = await createTestUser("owner");
  owner = await userService.ensureUser({ id: t.id, email: t.email, metadata: t.metadata });
  const r = await restaurantService.create(owner, {
    name: `${TAG} Kitchen`,
    cuisine: "Fusion",
    address: "1 Rd",
    opensAt: "00:00",
    closesAt: "23:59",
    deliveryTimeMin: 25,
  });
  restaurantId = r.id;
  const cat = await menuCategoryService.create(owner, "Mains");
  await menuItemService.create(
    owner,
    itemSchema.parse({ name: `${TAG} Biryani`, categoryId: cat.id, price: "100", isVeg: true }),
  );
});
afterAll(async () => {
  await t?.cleanup();
  await getPool().end();
});

describe("discovery against the real database", () => {
  it("finds restaurants by name and dishes by name (case-insensitive, partial)", async () => {
    const res = await searchService.search(TAG.toLowerCase());
    expect(res.restaurants.map((r) => r.id)).toContain(restaurantId);
    expect(res.dishes.map((d) => d.name)).toContain(`${TAG} Biryani`);
    expect(
      (await searchService.search("fusio")).restaurants.some((r) => r.id === restaurantId),
    ).toBe(true);
  });

  it("treats LIKE wildcards literally", async () => {
    const res = await searchService.search("%%");
    expect(res.restaurants).toHaveLength(0);
  });

  it("lists the restaurant, and hides it once disabled", async () => {
    const all = await discoveryService.list({ limit: 50 });
    expect(all.restaurants.some((r) => r.id === restaurantId)).toBe(true);
    await query("update restaurants set is_disabled = true where id = $1", [restaurantId]);
    const after = await discoveryService.list({ limit: 50 });
    expect(after.restaurants.some((r) => r.id === restaurantId)).toBe(false);
    const found = await searchService.search(TAG);
    expect(found.restaurants).toHaveLength(0);
    expect(found.dishes).toHaveLength(0);
  });
});

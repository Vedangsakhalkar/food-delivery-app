import { describe, expect, it, vi } from "vitest";
import { createRestaurantService } from "@/services/restaurant-service";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { restaurantSchema } from "@/validators/restaurant";
import type { Restaurant } from "@/models/restaurant";
import type { User } from "@/models/user";
import type { RestaurantRepository } from "@/repositories/restaurant-repository";

const owner = { id: "o1", role: "owner" } as User;
const input = restaurantSchema.parse({
  name: "Spice Route",
  cuisine: "North Indian",
  address: "MG Road",
  opensAt: "11:00",
  closesAt: "23:00",
  deliveryTimeMin: "30",
});
const restaurant = { id: "r1", ownerId: "o1" } as Restaurant;

const storage = {
  ownsPath: (_k: string, o: string, p: string) => p.startsWith(`restaurants/${o}/`),
  publicUrl: (p: string) => `https://cdn/${p}`,
  removeQuietly: vi.fn(async () => {}),
};

const repo = (over: Partial<RestaurantRepository> = {}): RestaurantRepository => ({
  findByOwner: async () => null,
  insert: async () => restaurant,
  update: async () => restaurant,
  ...over,
});

describe("restaurantSchema", () => {
  it("coerces delivery time and accepts valid input", () => {
    expect(input.deliveryTimeMin).toBe(30);
  });
  it.each([
    { name: "" },
    { opensAt: "25:00" },
    { closesAt: "11:00" },
    { deliveryTimeMin: "0" },
    { deliveryTimeMin: "abc" },
  ])("rejects %j", (bad) => {
    expect(restaurantSchema.safeParse({ ...input, ...bad }).success).toBe(false);
  });
  it("allows overnight hours", () => {
    expect(
      restaurantSchema.safeParse({ ...input, opensAt: "18:00", closesAt: "02:00" }).success,
    ).toBe(true);
  });
});

describe("restaurantService", () => {
  it("creates a restaurant for an owner without one", async () => {
    const insert = vi.fn(async () => restaurant);
    expect(await createRestaurantService(repo({ insert }), storage).create(owner, input)).toBe(
      restaurant,
    );
    expect(insert).toHaveBeenCalledWith("o1", input);
  });
  it("returns 409 when the owner already has one", async () => {
    const svc = createRestaurantService(repo({ findByOwner: async () => restaurant }), storage);
    await expect(svc.create(owner, input)).rejects.toBeInstanceOf(ConflictError);
  });
  it("maps a unique-constraint race to 409", async () => {
    const insert = async () => {
      throw Object.assign(new Error("dup"), { code: "23505" });
    };
    await expect(
      createRestaurantService(repo({ insert }), storage).create(owner, input),
    ).rejects.toBeInstanceOf(ConflictError);
  });
  it("404s when updating or reading without a restaurant", async () => {
    const svc = createRestaurantService(repo({ update: async () => null }), storage);
    await expect(svc.update(owner, input)).rejects.toBeInstanceOf(NotFoundError);
    await expect(svc.getMine(owner)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("restaurant images", () => {
  const current = { id: "r1", ownerId: "o1", imagePath: "restaurants/o1/old.png" } as Restaurant;

  it("stores path and server-built url, then deletes the old object", async () => {
    storage.removeQuietly.mockClear();
    const update = vi.fn(async () => restaurant);
    const svc = createRestaurantService(
      repo({ findByOwner: async () => current, update }),
      storage,
    );
    await svc.update(owner, { ...input, imagePath: "restaurants/o1/new.png" });
    expect(update).toHaveBeenCalledWith("o1", expect.anything(), {
      path: "restaurants/o1/new.png",
      url: "https://cdn/restaurants/o1/new.png",
    });
    expect(storage.removeQuietly).toHaveBeenCalledWith("restaurants/o1/old.png");
  });

  it("rejects another owner's path", async () => {
    const svc = createRestaurantService(repo({ findByOwner: async () => current }), storage);
    await expect(
      svc.update(owner, { ...input, imagePath: "restaurants/o2/x.png" }),
    ).rejects.toThrow("Invalid image");
  });

  it("removes the image when imagePath is null, and leaves it when undefined", async () => {
    const update = vi.fn(async () => restaurant);
    const svc = createRestaurantService(
      repo({ findByOwner: async () => current, update }),
      storage,
    );
    await svc.update(owner, { ...input, imagePath: null });
    expect(update).toHaveBeenLastCalledWith("o1", expect.anything(), { path: null, url: null });
    await svc.update(owner, input);
    expect(update).toHaveBeenLastCalledWith("o1", expect.anything(), undefined);
  });
});

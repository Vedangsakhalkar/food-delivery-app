import { ConflictError, NotFoundError } from "@/lib/errors";
import type { MenuCategory } from "@/models/menu";
import type { User } from "@/models/user";
import {
  menuCategoryRepository,
  type MenuCategoryRepository,
} from "@/repositories/menu-category-repository";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";

const isUniqueViolation = (e: unknown) => (e as { code?: string }).code === "23505";

export function createMenuCategoryService(
  categories: MenuCategoryRepository,
  restaurants: Pick<RestaurantRepository, "findByOwner">,
) {
  async function restaurantIdOf(owner: User) {
    const r = await restaurants.findByOwner(owner.id);
    if (!r) throw new NotFoundError("Create your restaurant first");
    return r.id;
  }

  return {
    async list(owner: User): Promise<MenuCategory[]> {
      return categories.list(await restaurantIdOf(owner));
    },

    async create(owner: User, name: string): Promise<MenuCategory> {
      const restaurantId = await restaurantIdOf(owner);
      try {
        return await categories.insert(restaurantId, name);
      } catch (err) {
        if (isUniqueViolation(err))
          throw new ConflictError("You already have a category with that name");
        throw err;
      }
    },

    async update(
      owner: User,
      id: string,
      change: { name?: string; move?: "up" | "down" },
    ): Promise<MenuCategory[]> {
      const restaurantId = await restaurantIdOf(owner);
      const list = await categories.list(restaurantId);
      const index = list.findIndex((c) => c.id === id);
      if (index === -1) throw new NotFoundError("Category not found");

      if (change.name !== undefined) {
        try {
          await categories.rename(id, restaurantId, change.name);
        } catch (err) {
          if (isUniqueViolation(err))
            throw new ConflictError("You already have a category with that name");
          throw err;
        }
      }
      if (change.move) {
        const target = change.move === "up" ? index - 1 : index + 1;
        if (target >= 0 && target < list.length) {
          const reordered = [...list];
          [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
          await categories.setOrder(
            restaurantId,
            reordered.map((c, i) => ({ id: c.id, sortOrder: i })),
          );
        }
      }
      return categories.list(restaurantId);
    },

    /** Deleting a category also deletes its items (database cascade); the UI confirms first. */
    async remove(owner: User, id: string): Promise<void> {
      const restaurantId = await restaurantIdOf(owner);
      if (!(await categories.remove(id, restaurantId)))
        throw new NotFoundError("Category not found");
    },
  };
}

export const menuCategoryService = createMenuCategoryService(
  menuCategoryRepository,
  restaurantRepository,
);

import { NotFoundError, ValidationError } from "@/lib/errors";
import { storageService } from "@/lib/supabase/storage-adapter";
import type { MenuItem } from "@/models/menu";
import type { User } from "@/models/user";
import {
  menuCategoryRepository,
  type MenuCategoryRepository,
} from "@/repositories/menu-category-repository";
import {
  menuItemRepository,
  type ImageFields,
  type MenuItemRepository,
} from "@/repositories/menu-item-repository";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";
import type { createStorageService } from "@/services/storage-service";
import type { ItemInput } from "@/validators/menu";

type Storage = Pick<
  ReturnType<typeof createStorageService>,
  "ownsPath" | "publicUrl" | "removeQuietly"
>;

export function createMenuItemService(
  items: MenuItemRepository,
  categories: Pick<MenuCategoryRepository, "list">,
  restaurants: Pick<RestaurantRepository, "findByOwner">,
  storage: Storage,
) {
  async function restaurantIdOf(owner: User) {
    const r = await restaurants.findByOwner(owner.id);
    if (!r) throw new NotFoundError("Create your restaurant first");
    return r.id;
  }

  async function checkCategory(restaurantId: string, categoryId: string) {
    const list = await categories.list(restaurantId);
    if (!list.some((c) => c.id === categoryId)) throw new ValidationError("Choose a category");
  }

  function imageFields(owner: User, input: ItemInput): ImageFields | undefined {
    if (input.imagePath === null) return { path: null, url: null };
    if (typeof input.imagePath === "string") {
      if (!storage.ownsPath("items", owner.id, input.imagePath)) {
        throw new ValidationError("Invalid image");
      }
      return { path: input.imagePath, url: storage.publicUrl(input.imagePath) };
    }
    return undefined;
  }

  const fields = (i: ItemInput) => ({
    categoryId: i.categoryId,
    name: i.name,
    description: i.description,
    pricePaise: i.price,
    isVeg: i.isVeg,
    isAvailable: i.isAvailable,
  });

  return {
    async list(owner: User): Promise<MenuItem[]> {
      return items.listByRestaurant(await restaurantIdOf(owner));
    },

    async get(owner: User, id: string): Promise<MenuItem> {
      const item = await items.find(id, await restaurantIdOf(owner));
      if (!item) throw new NotFoundError("Item not found");
      return item;
    },

    async create(owner: User, input: ItemInput): Promise<MenuItem> {
      const restaurantId = await restaurantIdOf(owner);
      await checkCategory(restaurantId, input.categoryId);
      return items.insert(restaurantId, fields(input), imageFields(owner, input));
    },

    async update(owner: User, id: string, input: ItemInput): Promise<MenuItem> {
      const restaurantId = await restaurantIdOf(owner);
      const current = await items.find(id, restaurantId);
      if (!current) throw new NotFoundError("Item not found");
      await checkCategory(restaurantId, input.categoryId);
      const image = imageFields(owner, input);
      const updated = await items.update(id, restaurantId, fields(input), image);
      if (!updated) throw new NotFoundError("Item not found");
      if (image && current.imagePath && current.imagePath !== image.path) {
        await storage.removeQuietly(current.imagePath);
      }
      return updated;
    },

    /** Deleting an item also deletes its Storage image. */
    async remove(owner: User, id: string): Promise<void> {
      const restaurantId = await restaurantIdOf(owner);
      const current = await items.find(id, restaurantId);
      if (!current || !(await items.remove(id, restaurantId))) {
        throw new NotFoundError("Item not found");
      }
      await storage.removeQuietly(current.imagePath);
    },
  };
}

export const menuItemService = createMenuItemService(
  menuItemRepository,
  menuCategoryRepository,
  restaurantRepository,
  storageService,
);

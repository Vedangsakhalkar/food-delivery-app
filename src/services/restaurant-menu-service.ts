import { NotFoundError } from "@/lib/errors";
import {
  toPublic,
  type PublicMenuCategory,
  type RestaurantWithMenu,
} from "@/models/public-restaurant";
import {
  menuCategoryRepository,
  type MenuCategoryRepository,
} from "@/repositories/menu-category-repository";
import { menuItemRepository, type MenuItemRepository } from "@/repositories/menu-item-repository";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";

export function createRestaurantMenuService(
  restaurants: Pick<RestaurantRepository, "findActiveById">,
  categories: Pick<MenuCategoryRepository, "list">,
  items: Pick<MenuItemRepository, "listByRestaurant">,
) {
  return {
    /** Public restaurant page data. Unknown or disabled restaurants are a plain 404. */
    async getWithMenu(id: string): Promise<RestaurantWithMenu> {
      const restaurant = await restaurants.findActiveById(id);
      if (!restaurant) throw new NotFoundError("Restaurant not found");
      const [cats, allItems] = await Promise.all([
        categories.list(restaurant.id),
        items.listByRestaurant(restaurant.id),
      ]);
      const grouped: PublicMenuCategory[] = cats
        .map((c) => ({
          id: c.id,
          name: c.name,
          items: allItems
            .filter((i) => i.categoryId === c.id)
            .map((i) => ({
              id: i.id,
              name: i.name,
              description: i.description,
              pricePaise: i.pricePaise,
              isVeg: i.isVeg,
              isAvailable: i.isAvailable,
              imageUrl: i.imageUrl,
            })),
        }))
        .filter((c) => c.items.length > 0);
      return { restaurant: toPublic(restaurant), categories: grouped };
    },
  };
}

export const restaurantMenuService = createRestaurantMenuService(
  restaurantRepository,
  menuCategoryRepository,
  menuItemRepository,
);

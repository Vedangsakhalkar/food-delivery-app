import { NotFoundError } from "@/lib/errors";
import { decodeCursor, encodeCursor } from "@/lib/pagination";
import type { Restaurant } from "@/models/restaurant";
import {
  restaurantRepository,
  type AdminRestaurant,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";

export function createAdminService(restaurants: RestaurantRepository) {
  return {
    async listRestaurants(q: {
      disabled?: boolean;
      limit: number;
      cursor?: string;
    }): Promise<{ restaurants: AdminRestaurant[]; nextCursor: string | null }> {
      const offset = decodeCursor(q.cursor);
      const rows = await restaurants.listForAdmin({
        disabled: q.disabled,
        limit: q.limit + 1,
        offset,
      });
      return {
        restaurants: rows.slice(0, q.limit),
        nextCursor: rows.length > q.limit ? encodeCursor(offset + q.limit) : null,
      };
    },

    /** Disabled restaurants disappear from discovery and refuse orders; data is kept. */
    async setRestaurantDisabled(
      id: string,
      disabled: boolean,
      reason?: string,
    ): Promise<Restaurant> {
      const updated = await restaurants.setDisabled(
        id,
        disabled,
        disabled ? (reason ?? null) : null,
      );
      if (!updated) throw new NotFoundError("Restaurant not found");
      return updated;
    },
  };
}

export const adminService = createAdminService(restaurantRepository);

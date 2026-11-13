import { NotFoundError } from "@/lib/errors";
import { decodeCursor, encodeCursor } from "@/lib/pagination";
import type { Order, OrderStatus } from "@/models/order";
import type { Restaurant } from "@/models/restaurant";
import { orderRepository, type OrderRepository } from "@/repositories/order-repository";
import {
  restaurantRepository,
  type AdminRestaurant,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";

export function createAdminService(
  restaurants: RestaurantRepository,
  orders?: Pick<OrderRepository, "listAll">,
) {
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

    /** Read-only list of every order, newest first. */
    async listOrders(q: {
      status?: OrderStatus;
      code?: string;
      limit: number;
      cursor?: string;
    }): Promise<{ orders: Order[]; nextCursor: string | null }> {
      const offset = decodeCursor(q.cursor);
      const rows = await orders!.listAll({
        status: q.status,
        code: q.code || undefined,
        limit: q.limit + 1,
        offset,
      });
      return {
        orders: rows.slice(0, q.limit),
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

export const adminService = createAdminService(restaurantRepository, orderRepository);

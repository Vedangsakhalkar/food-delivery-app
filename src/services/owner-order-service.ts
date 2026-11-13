import { ConflictError, NotFoundError } from "@/lib/errors";
import { decodeCursor, encodeCursor } from "@/lib/pagination";
import type { Order, OrderStatus } from "@/models/order";
import type { User } from "@/models/user";
import { orderRepository, type OrderRepository } from "@/repositories/order-repository";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";
import { assertTransition } from "@/services/order-state";

export function createOwnerOrderService(
  orders: OrderRepository,
  restaurants: Pick<RestaurantRepository, "findByOwner">,
) {
  async function restaurantIdOf(owner: User) {
    const r = await restaurants.findByOwner(owner.id);
    if (!r) throw new NotFoundError("Create your restaurant first");
    return r.id;
  }

  return {
    /** Orders of the owner's own restaurant only. */
    async list(
      owner: User,
      q: { statuses: OrderStatus[]; limit: number; cursor?: string },
    ): Promise<{ orders: Order[]; nextCursor: string | null }> {
      const restaurantId = await restaurantIdOf(owner);
      const offset = decodeCursor(q.cursor);
      const rows = await orders.listByRestaurant(restaurantId, {
        statuses: q.statuses,
        limit: q.limit + 1,
        offset,
      });
      return {
        orders: rows.slice(0, q.limit),
        nextCursor: rows.length > q.limit ? encodeCursor(offset + q.limit) : null,
      };
    },

    /** Moves an order along the state machine. Other restaurants' orders are a plain 404. */
    async updateStatus(owner: User, id: string, to: OrderStatus, reason?: string): Promise<Order> {
      const restaurantId = await restaurantIdOf(owner);
      const order = await orders.findForRestaurant(id, restaurantId);
      if (!order) throw new NotFoundError("Order not found");
      assertTransition(order.status, to, "owner");
      const ok = await orders.transition(id, order.status, to, to === "rejected" ? reason : null);
      if (!ok) throw new ConflictError("This order was just updated. Refresh and try again.");
      return (await orders.findForRestaurant(id, restaurantId))!;
    },
  };
}

export const ownerOrderService = createOwnerOrderService(orderRepository, restaurantRepository);

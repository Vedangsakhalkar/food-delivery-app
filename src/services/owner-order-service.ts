import { ConflictError, NotFoundError } from "@/lib/errors";
import { decodeCursor, encodeCursor } from "@/lib/pagination";
import type { Order, OrderStatus } from "@/models/order";
import type { User } from "@/models/user";
import { orderRepository, type OrderRepository } from "@/repositories/order-repository";
import {
  restaurantRepository,
  type RestaurantRepository,
} from "@/repositories/restaurant-repository";
import { logger, serializeError } from "@/lib/logger";
import { notificationService } from "@/lib/notifications";
import { assertTransition } from "@/services/order-state";

export function createOwnerOrderService(
  orders: OrderRepository,
  restaurants: Pick<RestaurantRepository, "findByOwner">,
  onStatusChanged: Array<(order: Order) => Promise<void> | void> = [],
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
      const updated = (await orders.findForRestaurant(id, restaurantId))!;
      // Notify after the change is committed; a failing notification never affects the update.
      for (const hook of onStatusChanged) {
        try {
          await hook(updated);
        } catch (err) {
          logger.error("status change hook failed", { orderId: id, ...serializeError(err) });
        }
      }
      return updated;
    },
  };
}

export const ownerOrderService = createOwnerOrderService(orderRepository, restaurantRepository, [
  (order) => notificationService.statusChanged(order),
]);

import { logger, serializeError } from "@/lib/logger";
import type { Order } from "@/models/order";
import {
  EMAILED_STATUSES,
  newOrderOwner,
  orderPlacedCustomer,
  statusChangeCustomer,
} from "@/services/email-templates";
import type { createEmailService } from "@/services/email-service";
import type { RestaurantRepository } from "@/repositories/restaurant-repository";
import type { UserRepository } from "@/repositories/user-repository";

type Email = Pick<ReturnType<typeof createEmailService>, "send">;

/**
 * Turns order events into emails (FR-23 to FR-26). Every method swallows its own errors:
 * notifications must never fail or block an order or a status change.
 */
export function createNotificationService(deps: {
  users: Pick<UserRepository, "findById">;
  restaurants: Pick<RestaurantRepository, "findById">;
  email: Email;
  appUrl: string;
}) {
  const { users, restaurants, email, appUrl } = deps;

  return {
    /** Order placed: confirmation to the customer and a new-order alert to the restaurant owner. */
    async orderPlaced(order: Order): Promise<void> {
      try {
        const [customer, restaurant] = await Promise.all([
          users.findById(order.customerId),
          restaurants.findById(order.restaurantId),
        ]);
        const owner = restaurant ? await users.findById(restaurant.ownerId) : null;
        const jobs: Promise<boolean>[] = [];
        if (customer) jobs.push(email.send(orderPlacedCustomer(order, customer.email, appUrl)));
        if (owner) {
          const forOwner = {
            ...order,
            customerName: customer?.name,
            customerPhone: customer?.phone,
          };
          jobs.push(email.send(newOrderOwner(forOwner, owner.email, appUrl)));
        }
        await Promise.all(jobs);
      } catch (err) {
        logger.error("order placed notification failed", {
          orderId: order.id,
          ...serializeError(err),
        });
      }
    },

    /** Status changed: email the customer for Accepted, Out for delivery, Delivered, Rejected, Cancelled. */
    async statusChanged(order: Order): Promise<void> {
      if (!EMAILED_STATUSES.includes(order.status)) return;
      try {
        const customer = await users.findById(order.customerId);
        if (customer) await email.send(statusChangeCustomer(order, customer.email, appUrl));
      } catch (err) {
        logger.error("status notification failed", { orderId: order.id, ...serializeError(err) });
      }
    },
  };
}

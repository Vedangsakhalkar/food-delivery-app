import { ConflictError, NotFoundError } from "@/lib/errors";
import { decodeCursor, encodeCursor } from "@/lib/pagination";
import type { Review } from "@/models/review";
import type { User } from "@/models/user";
import { orderRepository, type OrderRepository } from "@/repositories/order-repository";
import { reviewRepository, type ReviewRepository } from "@/repositories/review-repository";

export function createReviewService(
  reviews: ReviewRepository,
  orders: Pick<OrderRepository, "findById">,
) {
  return {
    /** Customers can review their own delivered orders, once each. */
    async create(
      customer: User,
      orderId: string,
      input: { rating: number; comment: string | null },
    ): Promise<Review> {
      const order = await orders.findById(orderId);
      if (!order || order.customerId !== customer.id) throw new NotFoundError("Order not found");
      if (order.status !== "delivered") {
        throw new ConflictError("You can review an order after it has been delivered");
      }
      try {
        return await reviews.create({
          orderId,
          restaurantId: order.restaurantId,
          customerId: customer.id,
          rating: input.rating,
          comment: input.comment,
        });
      } catch (err) {
        if ((err as { code?: string }).code === "23505") {
          throw new ConflictError("You have already reviewed this order");
        }
        throw err;
      }
    },

    /** Public list for a restaurant page, newest first. */
    async listForRestaurant(
      restaurantId: string,
      q: { limit: number; cursor?: string },
    ): Promise<{ reviews: Review[]; nextCursor: string | null }> {
      const offset = decodeCursor(q.cursor);
      const rows = await reviews.listByRestaurant(restaurantId, { limit: q.limit + 1, offset });
      return {
        reviews: rows.slice(0, q.limit),
        nextCursor: rows.length > q.limit ? encodeCursor(offset + q.limit) : null,
      };
    },
  };
}

export const reviewService = createReviewService(reviewRepository, orderRepository);

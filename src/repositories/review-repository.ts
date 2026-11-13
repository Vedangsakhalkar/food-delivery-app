import { query, withTransaction } from "@/lib/db";
import type { Review } from "@/models/review";

interface Row {
  id: string;
  order_id: string;
  restaurant_id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: Date;
}

const toReview = (r: Row): Review => ({
  id: r.id,
  orderId: r.order_id,
  restaurantId: r.restaurant_id,
  rating: r.rating,
  comment: r.comment,
  reviewerName: (r.reviewer_name ?? "").trim().split(/\s+/)[0] || "Customer",
  createdAt: r.created_at,
});

export interface ReviewRepository {
  /**
   * Saves the review and recalculates the restaurant's average rating and count in one
   * transaction. The restaurant row is locked first so concurrent reviews cannot lose updates.
   * A second review for the same order violates the unique constraint (code 23505).
   */
  create(input: {
    orderId: string;
    restaurantId: string;
    customerId: string;
    rating: number;
    comment: string | null;
  }): Promise<Review>;
  listByRestaurant(
    restaurantId: string,
    opts: { limit: number; offset: number },
  ): Promise<Review[]>;
}

const SELECT = `select rv.id, rv.order_id, rv.restaurant_id, rv.rating, rv.comment, rv.created_at, u.name as reviewer_name
  from reviews rv join users u on u.id = rv.customer_id`;

export const reviewRepository: ReviewRepository = {
  async create(i) {
    return withTransaction(async (c) => {
      await c.query("select id from restaurants where id = $1 for update", [i.restaurantId]);
      const ins = await c.query<{ id: string }>(
        `insert into reviews (order_id, restaurant_id, customer_id, rating, comment)
         values ($1, $2, $3, $4, $5) returning id`,
        [i.orderId, i.restaurantId, i.customerId, i.rating, i.comment],
      );
      await c.query(
        `update restaurants set
           rating_count = (select count(*) from reviews where restaurant_id = $1),
           avg_rating = (select round(avg(rating)::numeric, 1) from reviews where restaurant_id = $1)
         where id = $1`,
        [i.restaurantId],
      );
      const res = await c.query<Row>(`${SELECT} where rv.id = $1`, [ins.rows[0].id]);
      return toReview(res.rows[0]);
    });
  },

  async listByRestaurant(restaurantId, { limit, offset }) {
    const res = await query<Row>(
      `${SELECT} where rv.restaurant_id = $1 order by rv.created_at desc, rv.id limit $2 offset $3`,
      [restaurantId, limit, offset],
    );
    return res.rows.map(toReview);
  },
};

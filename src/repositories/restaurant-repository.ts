import { query } from "@/lib/db";
import type { Restaurant } from "@/models/restaurant";
import type { RestaurantInput } from "@/validators/restaurant";

export interface RestaurantRow {
  id: string;
  owner_id: string;
  name: string;
  cuisine: string;
  address: string;
  opens_at: string;
  closes_at: string;
  image_path: string | null;
  image_url: string | null;
  delivery_time_min: number;
  is_disabled: boolean;
  disabled_reason: string | null;
  avg_rating: string;
  rating_count: number;
  created_at: Date;
}

const hhmm = (t: string) => t.slice(0, 5);

export const toRestaurant = (r: RestaurantRow): Restaurant => ({
  id: r.id,
  ownerId: r.owner_id,
  name: r.name,
  cuisine: r.cuisine,
  address: r.address,
  opensAt: hhmm(r.opens_at),
  closesAt: hhmm(r.closes_at),
  imagePath: r.image_path,
  imageUrl: r.image_url,
  deliveryTimeMin: r.delivery_time_min,
  isDisabled: r.is_disabled,
  disabledReason: r.disabled_reason,
  avgRating: Number(r.avg_rating),
  ratingCount: r.rating_count,
  createdAt: r.created_at,
});

export interface RestaurantRepository {
  findByOwner(ownerId: string): Promise<Restaurant | null>;
  /** Active (not disabled) restaurants, newest first. */
  listActive(opts: { limit: number; offset: number }): Promise<Restaurant[]>;
  insert(ownerId: string, input: RestaurantInput): Promise<Restaurant>;
  update(
    ownerId: string,
    input: RestaurantInput,
    image?: { path: string | null; url: string | null },
  ): Promise<Restaurant | null>;
}

export const restaurantRepository: RestaurantRepository = {
  async findByOwner(ownerId) {
    const res = await query<RestaurantRow>("select * from restaurants where owner_id = $1", [
      ownerId,
    ]);
    return res.rows[0] ? toRestaurant(res.rows[0]) : null;
  },

  async listActive({ limit, offset }) {
    const res = await query<RestaurantRow>(
      `select * from restaurants where is_disabled = false
       order by created_at desc, id limit $1 offset $2`,
      [limit, offset],
    );
    return res.rows.map(toRestaurant);
  },

  async insert(ownerId, i) {
    const res = await query<RestaurantRow>(
      `insert into restaurants (owner_id, name, cuisine, address, opens_at, closes_at, delivery_time_min)
       values ($1, $2, $3, $4, $5, $6, $7) returning *`,
      [ownerId, i.name, i.cuisine, i.address, i.opensAt, i.closesAt, i.deliveryTimeMin],
    );
    return toRestaurant(res.rows[0]);
  },

  async update(ownerId, i, image) {
    const res = await query<RestaurantRow>(
      `update restaurants set name = $2, cuisine = $3, address = $4, opens_at = $5,
         closes_at = $6, delivery_time_min = $7,
         image_path = case when $8 then $9 else image_path end,
         image_url = case when $8 then $10 else image_url end
       where owner_id = $1 returning *`,
      [
        ownerId,
        i.name,
        i.cuisine,
        i.address,
        i.opensAt,
        i.closesAt,
        i.deliveryTimeMin,
        image !== undefined,
        image?.path ?? null,
        image?.url ?? null,
      ],
    );
    return res.rows[0] ? toRestaurant(res.rows[0]) : null;
  },
};

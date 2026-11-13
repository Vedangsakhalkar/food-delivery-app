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

export type AdminRestaurant = Restaurant & { ownerName: string; ownerEmail: string };

export interface RestaurantRepository {
  /** All restaurants for the admin, optionally only disabled (true) or only active (false). */
  listForAdmin(opts: {
    disabled?: boolean;
    limit: number;
    offset: number;
  }): Promise<AdminRestaurant[]>;
  /** Disables or re-enables a restaurant. Returns null if it does not exist. */
  setDisabled(id: string, disabled: boolean, reason: string | null): Promise<Restaurant | null>;
  findByOwner(ownerId: string): Promise<Restaurant | null>;
  /** Active (not disabled) restaurants, newest first. */
  listActive(opts: {
    limit: number;
    offset: number;
    cuisines?: string[];
    sort?: "rating" | "delivery";
  }): Promise<Restaurant[]>;
  /** Any restaurant by id (including disabled); for internal use such as notifications. */
  findById(id: string): Promise<Restaurant | null>;
  /** A restaurant visible to the public: unknown ids and disabled restaurants return null. */
  findActiveById(id: string): Promise<Restaurant | null>;
  /** Distinct cuisine names (split on commas) across active restaurants. */
  listCuisines(): Promise<string[]>;
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

  async listForAdmin({ disabled, limit, offset }) {
    const res = await query<RestaurantRow & { owner_name: string; owner_email: string }>(
      `select r.*, u.name as owner_name, u.email as owner_email
       from restaurants r join users u on u.id = r.owner_id
       where ($1::boolean is null or r.is_disabled = $1)
       order by r.created_at desc, r.id limit $2 offset $3`,
      [disabled ?? null, limit, offset],
    );
    return res.rows.map((r) => ({
      ...toRestaurant(r),
      ownerName: r.owner_name,
      ownerEmail: r.owner_email,
    }));
  },

  async setDisabled(id, disabled, reason) {
    const res = await query<RestaurantRow>(
      `update restaurants set is_disabled = $2, disabled_reason = $3 where id = $1 returning *`,
      [id, disabled, disabled ? reason : null],
    );
    return res.rows[0] ? toRestaurant(res.rows[0]) : null;
  },

  async listActive({ limit, offset, cuisines = [], sort }) {
    const order =
      sort === "rating"
        ? "(rating_count = 0), avg_rating desc, created_at desc, id"
        : sort === "delivery"
          ? "delivery_time_min asc, created_at desc, id"
          : "created_at desc, id";
    const res = await query<RestaurantRow>(
      `select * from restaurants
       where is_disabled = false
         and ($3::text[] = '{}' or exists (
           select 1 from unnest(string_to_array(cuisine, ',')) c where lower(trim(c)) = any($3)))
       order by ${order} limit $1 offset $2`,
      [limit, offset, cuisines],
    );
    return res.rows.map(toRestaurant);
  },

  async findById(id) {
    const res = await query<RestaurantRow>("select * from restaurants where id = $1", [id]);
    return res.rows[0] ? toRestaurant(res.rows[0]) : null;
  },

  async findActiveById(id) {
    const res = await query<RestaurantRow>(
      "select * from restaurants where id = $1 and is_disabled = false",
      [id],
    );
    return res.rows[0] ? toRestaurant(res.rows[0]) : null;
  },

  async listCuisines() {
    const res = await query<{ name: string }>(
      `select distinct trim(c) as name
       from restaurants, unnest(string_to_array(cuisine, ',')) c
       where is_disabled = false and trim(c) <> '' order by 1`,
    );
    return res.rows.map((r) => r.name);
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

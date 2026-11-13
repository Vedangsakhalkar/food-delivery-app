import { query } from "@/lib/db";
import type { MenuItem } from "@/models/menu";

interface Row {
  id: string;
  category_id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price_paise: number;
  is_veg: boolean;
  is_available: boolean;
  image_path: string | null;
  image_url: string | null;
}

export const toItem = (r: Row): MenuItem => ({
  id: r.id,
  categoryId: r.category_id,
  restaurantId: r.restaurant_id,
  name: r.name,
  description: r.description,
  pricePaise: r.price_paise,
  isVeg: r.is_veg,
  isAvailable: r.is_available,
  imagePath: r.image_path,
  imageUrl: r.image_url,
});

export interface ItemFields {
  categoryId: string;
  name: string;
  description: string;
  pricePaise: number;
  isVeg: boolean;
  isAvailable: boolean;
}
export type ImageFields = { path: string | null; url: string | null };

export interface MenuItemRepository {
  listByRestaurant(restaurantId: string): Promise<MenuItem[]>;
  find(id: string, restaurantId: string): Promise<MenuItem | null>;
  insert(restaurantId: string, f: ItemFields, image: ImageFields | undefined): Promise<MenuItem>;
  update(
    id: string,
    restaurantId: string,
    f: ItemFields,
    image: ImageFields | undefined,
  ): Promise<MenuItem | null>;
  remove(id: string, restaurantId: string): Promise<boolean>;
}

const COLS =
  "id, category_id, restaurant_id, name, description, price_paise, is_veg, is_available, image_path, image_url";

export const menuItemRepository: MenuItemRepository = {
  async listByRestaurant(restaurantId) {
    const res = await query<Row>(
      `select ${COLS} from menu_items where restaurant_id = $1 order by created_at`,
      [restaurantId],
    );
    return res.rows.map(toItem);
  },

  async find(id, restaurantId) {
    const res = await query<Row>(
      `select ${COLS} from menu_items where id = $1 and restaurant_id = $2`,
      [id, restaurantId],
    );
    return res.rows[0] ? toItem(res.rows[0]) : null;
  },

  async insert(restaurantId, f, image) {
    const res = await query<Row>(
      `insert into menu_items (restaurant_id, category_id, name, description, price_paise, is_veg, is_available, image_path, image_url)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning ${COLS}`,
      [
        restaurantId,
        f.categoryId,
        f.name,
        f.description,
        f.pricePaise,
        f.isVeg,
        f.isAvailable,
        image?.path ?? null,
        image?.url ?? null,
      ],
    );
    return toItem(res.rows[0]);
  },

  async update(id, restaurantId, f, image) {
    const res = await query<Row>(
      `update menu_items set category_id = $3, name = $4, description = $5, price_paise = $6,
         is_veg = $7, is_available = $8,
         image_path = case when $9 then $10 else image_path end,
         image_url = case when $9 then $11 else image_url end
       where id = $1 and restaurant_id = $2 returning ${COLS}`,
      [
        id,
        restaurantId,
        f.categoryId,
        f.name,
        f.description,
        f.pricePaise,
        f.isVeg,
        f.isAvailable,
        image !== undefined,
        image?.path ?? null,
        image?.url ?? null,
      ],
    );
    return res.rows[0] ? toItem(res.rows[0]) : null;
  },

  async remove(id, restaurantId) {
    const res = await query("delete from menu_items where id = $1 and restaurant_id = $2", [
      id,
      restaurantId,
    ]);
    return (res.rowCount ?? 0) > 0;
  },
};

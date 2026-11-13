import { query, withTransaction } from "@/lib/db";
import type { MenuCategory } from "@/models/menu";

interface Row {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}
const toCategory = (r: Row): MenuCategory => ({
  id: r.id,
  restaurantId: r.restaurant_id,
  name: r.name,
  sortOrder: r.sort_order,
});

export interface MenuCategoryRepository {
  list(restaurantId: string): Promise<MenuCategory[]>;
  insert(restaurantId: string, name: string): Promise<MenuCategory>;
  rename(id: string, restaurantId: string, name: string): Promise<MenuCategory | null>;
  remove(id: string, restaurantId: string): Promise<boolean>;
  setOrder(restaurantId: string, order: { id: string; sortOrder: number }[]): Promise<void>;
}

export const menuCategoryRepository: MenuCategoryRepository = {
  async list(restaurantId) {
    const res = await query<Row>(
      "select id, restaurant_id, name, sort_order from menu_categories where restaurant_id = $1 order by sort_order, name",
      [restaurantId],
    );
    return res.rows.map(toCategory);
  },

  async insert(restaurantId, name) {
    const res = await query<Row>(
      `insert into menu_categories (restaurant_id, name, sort_order)
       values ($1, $2, coalesce((select max(sort_order) + 1 from menu_categories where restaurant_id = $1), 0))
       returning id, restaurant_id, name, sort_order`,
      [restaurantId, name],
    );
    return toCategory(res.rows[0]);
  },

  async rename(id, restaurantId, name) {
    const res = await query<Row>(
      `update menu_categories set name = $3 where id = $1 and restaurant_id = $2
       returning id, restaurant_id, name, sort_order`,
      [id, restaurantId, name],
    );
    return res.rows[0] ? toCategory(res.rows[0]) : null;
  },

  async remove(id, restaurantId) {
    const res = await query("delete from menu_categories where id = $1 and restaurant_id = $2", [
      id,
      restaurantId,
    ]);
    return (res.rowCount ?? 0) > 0;
  },

  async setOrder(restaurantId, order) {
    await withTransaction(async (client) => {
      for (const o of order) {
        await client.query(
          "update menu_categories set sort_order = $3 where id = $1 and restaurant_id = $2",
          [o.id, restaurantId, o.sortOrder],
        );
      }
    });
  },
};

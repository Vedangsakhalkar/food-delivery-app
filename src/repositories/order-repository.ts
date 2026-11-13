import { query, withTransaction } from "@/lib/db";
import { likePattern } from "@/lib/like";
import type { AddressSnapshot, Order, OrderItem, OrderStatus } from "@/models/order";

interface OrderRow {
  id: string;
  code: string;
  customer_id: string;
  restaurant_id: string;
  restaurant_name: string;
  customer_name?: string;
  customer_phone?: string | null;
  address_snapshot: AddressSnapshot;
  status: OrderStatus;
  rejection_reason: string | null;
  subtotal_paise: number;
  tax_paise: number;
  delivery_fee_paise: number;
  total_paise: number;
  payment_method: "cod";
  notes: string | null;
  created_at: Date;
}

interface ItemRow {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name_snapshot: string;
  price_paise: number;
  quantity: number;
}

const OWNER_SELECT = `select o.*, r.name as restaurant_name, u.name as customer_name, u.phone as customer_phone
  from orders o join restaurants r on r.id = o.restaurant_id join users u on u.id = o.customer_id`;
const SELECT = `select o.*, r.name as restaurant_name from orders o join restaurants r on r.id = o.restaurant_id`;

export const toOrder = (r: OrderRow, items: OrderItem[]): Order => ({
  id: r.id,
  code: r.code,
  customerId: r.customer_id,
  restaurantId: r.restaurant_id,
  restaurantName: r.restaurant_name,
  customerName: r.customer_name,
  customerPhone: r.customer_phone,
  address: r.address_snapshot,
  status: r.status,
  rejectionReason: r.rejection_reason,
  subtotalPaise: r.subtotal_paise,
  taxPaise: r.tax_paise,
  deliveryFeePaise: r.delivery_fee_paise,
  totalPaise: r.total_paise,
  paymentMethod: r.payment_method,
  notes: r.notes,
  createdAt: r.created_at,
  items,
});

const toItem = (i: ItemRow): OrderItem => ({
  id: i.id,
  menuItemId: i.menu_item_id,
  name: i.name_snapshot,
  pricePaise: i.price_paise,
  quantity: i.quantity,
});

async function loadItems(orderIds: string[]): Promise<Map<string, OrderItem[]>> {
  const map = new Map<string, OrderItem[]>();
  if (orderIds.length === 0) return map;
  const res = await query<ItemRow>(
    "select * from order_items where order_id = any($1) order by name_snapshot",
    [orderIds],
  );
  for (const row of res.rows) {
    const list = map.get(row.order_id) ?? [];
    list.push(toItem(row));
    map.set(row.order_id, list);
  }
  return map;
}

export async function hydrate(rows: OrderRow[]): Promise<Order[]> {
  const items = await loadItems(rows.map((r) => r.id));
  return rows.map((r) => toOrder(r, items.get(r.id) ?? []));
}

export interface NewOrder {
  customerId: string;
  restaurantId: string;
  address: AddressSnapshot;
  subtotalPaise: number;
  taxPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
  notes: string | null;
  items: { menuItemId: string; name: string; pricePaise: number; quantity: number }[];
}

export interface OrderRepository {
  /** Inserts the order and its items in one transaction. */
  create(order: NewOrder): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  /**
   * Moves an order from one status to another only if it is still in `from`
   * (compare-and-set, so a cancel and an accept racing each other cannot both win).
   * Returns false when the order was no longer in `from`.
   */
  transition(
    id: string,
    from: OrderStatus,
    to: OrderStatus,
    reason?: string | null,
  ): Promise<boolean>;
  /** Orders of one restaurant (with customer contact), newest first, optionally filtered by status. */
  listByRestaurant(
    restaurantId: string,
    opts: { statuses: OrderStatus[]; limit: number; offset: number },
  ): Promise<Order[]>;
  /** One order, only if it belongs to the restaurant (with customer contact). */
  findForRestaurant(id: string, restaurantId: string): Promise<Order | null>;
  /** Every order in the system for the admin (read-only), newest first, with optional filters. */
  listAll(opts: {
    status?: OrderStatus;
    code?: string;
    limit: number;
    offset: number;
  }): Promise<Order[]>;
  /** A customer's orders, newest first. */
  listByCustomer(customerId: string, opts: { limit: number; offset: number }): Promise<Order[]>;
}

export const orderRepository: OrderRepository = {
  async create(o) {
    const id = await withTransaction(async (c) => {
      const res = await c.query<{ id: string }>(
        `insert into orders (customer_id, restaurant_id, address_snapshot, subtotal_paise, tax_paise,
           delivery_fee_paise, total_paise, notes)
         values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
        [
          o.customerId,
          o.restaurantId,
          JSON.stringify(o.address),
          o.subtotalPaise,
          o.taxPaise,
          o.deliveryFeePaise,
          o.totalPaise,
          o.notes,
        ],
      );
      const orderId = res.rows[0].id;
      for (const i of o.items) {
        await c.query(
          `insert into order_items (order_id, menu_item_id, name_snapshot, price_paise, quantity)
           values ($1, $2, $3, $4, $5)`,
          [orderId, i.menuItemId, i.name, i.pricePaise, i.quantity],
        );
      }
      return orderId;
    });
    return (await this.findById(id))!;
  },

  async transition(id, from, to, reason = null) {
    const res = await query(
      `update orders set status = $3, rejection_reason = coalesce($4, rejection_reason), updated_at = now()
       where id = $1 and status = $2`,
      [id, from, to, reason],
    );
    return (res.rowCount ?? 0) > 0;
  },

  async listByRestaurant(restaurantId, { statuses, limit, offset }) {
    const res = await query<OrderRow>(
      `${OWNER_SELECT} where o.restaurant_id = $1 and o.status = any($2)
       order by o.created_at desc, o.id limit $3 offset $4`,
      [restaurantId, statuses, limit, offset],
    );
    return hydrate(res.rows);
  },

  async findForRestaurant(id, restaurantId) {
    const res = await query<OrderRow>(`${OWNER_SELECT} where o.id = $1 and o.restaurant_id = $2`, [
      id,
      restaurantId,
    ]);
    return res.rows[0] ? (await hydrate(res.rows))[0] : null;
  },

  async listAll({ status, code, limit, offset }) {
    const res = await query<OrderRow>(
      `${OWNER_SELECT}
       where ($1::text is null or o.status = $1)
         and ($2::text is null or o.code ilike $2)
       order by o.created_at desc, o.id limit $3 offset $4`,
      [status ?? null, code ? likePattern(code) : null, limit, offset],
    );
    return hydrate(res.rows);
  },

  async listByCustomer(customerId, { limit, offset }) {
    const res = await query<OrderRow>(
      `${SELECT} where o.customer_id = $1 order by o.created_at desc, o.id limit $2 offset $3`,
      [customerId, limit, offset],
    );
    return hydrate(res.rows);
  },

  async findById(id) {
    const res = await query<OrderRow>(`${SELECT} where o.id = $1`, [id]);
    return res.rows[0] ? (await hydrate(res.rows))[0] : null;
  },
};

import { query, withTransaction } from "@/lib/db";
import type { AddressSnapshot, Order, OrderItem, OrderStatus } from "@/models/order";

interface OrderRow {
  id: string;
  code: string;
  customer_id: string;
  restaurant_id: string;
  restaurant_name: string;
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

const SELECT = `select o.*, r.name as restaurant_name from orders o join restaurants r on r.id = o.restaurant_id`;

export const toOrder = (r: OrderRow, items: OrderItem[]): Order => ({
  id: r.id,
  code: r.code,
  customerId: r.customer_id,
  restaurantId: r.restaurant_id,
  restaurantName: r.restaurant_name,
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

  async findById(id) {
    const res = await query<OrderRow>(`${SELECT} where o.id = $1`, [id]);
    return res.rows[0] ? (await hydrate(res.rows))[0] : null;
  },
};

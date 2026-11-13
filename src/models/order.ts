export const ORDER_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "rejected",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface AddressSnapshot {
  label: string;
  line1: string;
  city: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string | null;
  name: string;
  pricePaise: number;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  customerId: string;
  restaurantId: string;
  restaurantName?: string;
  address: AddressSnapshot;
  status: OrderStatus;
  rejectionReason: string | null;
  subtotalPaise: number;
  taxPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
  paymentMethod: "cod";
  notes: string | null;
  createdAt: Date;
  items: OrderItem[];
}

import { formatMoney } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/models/order";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

/** Escapes everything that comes from users (names, addresses, notes, reasons). */
export const esc = (value: string | null | undefined): string =>
  (value ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 12px 4px 0">${i.quantity} × ${esc(i.name)}</td><td style="text-align:right">${formatMoney(i.pricePaise * i.quantity)}</td></tr>`,
    )
    .join("");
  return `<table style="border-collapse:collapse;width:100%;max-width:420px">${rows}
    <tr><td style="padding-top:8px;color:#696969">Taxes</td><td style="text-align:right;color:#696969">${formatMoney(order.taxPaise)}</td></tr>
    <tr><td style="color:#696969">Delivery</td><td style="text-align:right;color:#696969">${formatMoney(order.deliveryFeePaise)}</td></tr>
    <tr><td style="padding-top:8px"><b>Total (pay on delivery)</b></td><td style="text-align:right"><b>${formatMoney(order.totalPaise)}</b></td></tr></table>`;
}

function layout(title: string, body: string): string {
  return `<div style="font-family:system-ui,sans-serif;color:#1c1c1c;max-width:560px">
    <h2 style="color:#e23744;margin:0 0 12px">Dabba</h2><h3 style="margin:0 0 8px">${esc(title)}</h3>${body}</div>`;
}

const address = (o: Order) =>
  `${esc(o.address.line1)}, ${esc(o.address.city)} ${esc(o.address.pincode)}`;

export function orderPlacedCustomer(order: Order, to: string, appUrl: string): EmailMessage {
  return {
    to,
    subject: `Order #${order.code} confirmed`,
    html: layout(
      `Thanks! Your order #${order.code} is placed`,
      `<p>${esc(order.restaurantName)} will confirm it shortly.</p>${itemsTable(order)}
       <p>Delivering to: ${address(order)}</p>
       <p><a href="${esc(appUrl)}/orders/${esc(order.id)}">Track your order</a></p>`,
    ),
  };
}

export function newOrderOwner(order: Order, to: string, appUrl: string): EmailMessage {
  return {
    to,
    subject: `New order #${order.code}`,
    html: layout(
      `New order #${order.code}`,
      `<p>${esc(order.customerName)} placed an order${order.customerPhone ? ` (phone ${esc(order.customerPhone)})` : ""}.</p>
       ${itemsTable(order)}<p>Deliver to: ${address(order)}</p>
       ${order.notes ? `<p>Note: ${esc(order.notes)}</p>` : ""}
       <p><a href="${esc(appUrl)}/owner/orders">Open live orders</a></p>`,
    ),
  };
}

/** Statuses the customer is emailed about (not Preparing). */
export const EMAILED_STATUSES: readonly OrderStatus[] = [
  "accepted",
  "out_for_delivery",
  "delivered",
  "rejected",
  "cancelled",
];

export function statusChangeCustomer(order: Order, to: string, appUrl: string): EmailMessage {
  const label = STATUS_LABEL[order.status];
  return {
    to,
    subject: `Order #${order.code}: ${label}`,
    html: layout(
      `Your order #${order.code} is now ${label.toLowerCase()}`,
      `<p>${esc(order.restaurantName)}</p>
       ${order.status === "rejected" && order.rejectionReason ? `<p>Reason: ${esc(order.rejectionReason)}</p>` : ""}
       <p><a href="${esc(appUrl)}/orders/${esc(order.id)}">View your order</a></p>`,
    ),
  };
}

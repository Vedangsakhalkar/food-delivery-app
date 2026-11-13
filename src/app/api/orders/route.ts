import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { orderService } from "@/services/order-service";
import { listOrdersSchema, placeOrderSchema } from "@/validators/order";

export const GET = withErrorHandling(async (req) => {
  const customer = await requireUser(ROLES_FOR.customer);
  const query = listOrdersSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return NextResponse.json(await orderService.listForCustomer(customer, query));
});

export const POST = withErrorHandling(async (req) => {
  const customer = await requireUser(ROLES_FOR.customer);
  const input = placeOrderSchema.parse(await req.json().catch(() => ({})));
  const order = await orderService.placeOrder(customer, input);
  return NextResponse.json(
    {
      order: { id: order.id, code: order.code, status: order.status, totalPaise: order.totalPaise },
    },
    { status: 201 },
  );
});

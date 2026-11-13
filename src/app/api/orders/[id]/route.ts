import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { orderService } from "@/services/order-service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling<Ctx>(async (_req, ctx) => {
  const customer = await requireUser(ROLES_FOR.customer);
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) throw new NotFoundError("Order not found");
  return NextResponse.json({ order: await orderService.getForCustomer(customer, id.data) });
});

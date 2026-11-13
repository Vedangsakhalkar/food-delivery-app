import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { ownerOrderService } from "@/services/owner-order-service";
import { updateStatusSchema } from "@/validators/order";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(async (req, ctx) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) throw new NotFoundError("Order not found");
  const { status, reason } = updateStatusSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json({
    order: await ownerOrderService.updateStatus(owner, id.data, status, reason),
  });
});

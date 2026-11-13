import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { reviewService } from "@/services/review-service";
import { reviewSchema } from "@/validators/order";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(async (req, ctx) => {
  const customer = await requireUser(ROLES_FOR.customer);
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) throw new NotFoundError("Order not found");
  const input = reviewSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json(
    { review: await reviewService.create(customer, id.data, input) },
    { status: 201 },
  );
});

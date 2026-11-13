import { NextResponse } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { reviewService } from "@/services/review-service";
import { listReviewsSchema } from "@/validators/discovery";

type Ctx = { params: Promise<{ id: string }> };

/** Public: reviews of a restaurant, newest first. Only the reviewer's first name is exposed. */
export const GET = withErrorHandling<Ctx>(async (req, ctx) => {
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) throw new NotFoundError("Restaurant not found");
  const q = listReviewsSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return NextResponse.json(await reviewService.listForRestaurant(id.data, q));
});

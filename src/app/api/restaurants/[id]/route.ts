import { NextResponse } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { restaurantMenuService } from "@/services/restaurant-menu-service";

type Ctx = { params: Promise<{ id: string }> };

/** Public: restaurant details plus its menu grouped by category. */
export const GET = withErrorHandling<Ctx>(async (_req, ctx) => {
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) throw new NotFoundError("Restaurant not found");
  return NextResponse.json(await restaurantMenuService.getWithMenu(id.data));
});

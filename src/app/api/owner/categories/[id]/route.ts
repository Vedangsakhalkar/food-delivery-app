import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { menuCategoryService } from "@/services/menu-category-service";
import { categoryUpdateSchema } from "@/validators/menu";

const idSchema = z.uuid();
type Ctx = { params: Promise<{ id: string }> };

async function idOf(ctx: Ctx) {
  const parsed = idSchema.safeParse((await ctx.params).id);
  if (!parsed.success) throw new NotFoundError("Category not found");
  return parsed.data;
}

export const PATCH = withErrorHandling<Ctx>(async (req, ctx) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const change = categoryUpdateSchema.parse(await req.json().catch(() => ({})));
  const categories = await menuCategoryService.update(owner, await idOf(ctx), change);
  return NextResponse.json({ categories });
});

export const DELETE = withErrorHandling<Ctx>(async (_req, ctx) => {
  const owner = await requireUser(ROLES_FOR.owner);
  await menuCategoryService.remove(owner, await idOf(ctx));
  return new NextResponse(null, { status: 204 });
});

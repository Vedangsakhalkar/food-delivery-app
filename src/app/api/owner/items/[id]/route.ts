import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { menuItemService } from "@/services/menu-item-service";
import { itemSchema } from "@/validators/menu";

type Ctx = { params: Promise<{ id: string }> };

async function idOf(ctx: Ctx) {
  const parsed = z.uuid().safeParse((await ctx.params).id);
  if (!parsed.success) throw new NotFoundError("Item not found");
  return parsed.data;
}

export const GET = withErrorHandling<Ctx>(async (_req, ctx) => {
  const owner = await requireUser(ROLES_FOR.owner);
  return NextResponse.json({ item: await menuItemService.get(owner, await idOf(ctx)) });
});

export const PATCH = withErrorHandling<Ctx>(async (req, ctx) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const input = itemSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json({ item: await menuItemService.update(owner, await idOf(ctx), input) });
});

export const DELETE = withErrorHandling<Ctx>(async (_req, ctx) => {
  const owner = await requireUser(ROLES_FOR.owner);
  await menuItemService.remove(owner, await idOf(ctx));
  return new NextResponse(null, { status: 204 });
});

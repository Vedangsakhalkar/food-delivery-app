import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { withErrorHandling } from "@/lib/handle-error";
import { addressService } from "@/services/address-service";
import { addressSchema } from "@/validators/address";

type Ctx = { params: Promise<{ id: string }> };

async function idOf(ctx: Ctx) {
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) throw new NotFoundError("Address not found");
  return id.data;
}

export const PATCH = withErrorHandling<Ctx>(async (req, ctx) => {
  const user = await requireUser();
  const input = addressSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json({ address: await addressService.update(user, await idOf(ctx), input) });
});

export const DELETE = withErrorHandling<Ctx>(async (_req, ctx) => {
  const user = await requireUser();
  await addressService.remove(user, await idOf(ctx));
  return new NextResponse(null, { status: 204 });
});

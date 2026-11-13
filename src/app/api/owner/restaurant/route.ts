import { NextResponse } from "next/server";
import { ROLES_FOR } from "@/lib/access-rules";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { restaurantService } from "@/services/restaurant-service";
import { restaurantSchema } from "@/validators/restaurant";

export const GET = withErrorHandling(async () => {
  const owner = await requireUser(ROLES_FOR.owner);
  return NextResponse.json({ restaurant: await restaurantService.getMine(owner) });
});

export const POST = withErrorHandling(async (req) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const input = restaurantSchema.parse(await req.json().catch(() => ({})));
  const restaurant = await restaurantService.create(owner, input);
  return NextResponse.json({ restaurant }, { status: 201 });
});

export const PATCH = withErrorHandling(async (req) => {
  const owner = await requireUser(ROLES_FOR.owner);
  const input = restaurantSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json({ restaurant: await restaurantService.update(owner, input) });
});

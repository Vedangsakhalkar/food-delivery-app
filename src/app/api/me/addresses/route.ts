import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { addressService } from "@/services/address-service";
import { addressSchema } from "@/validators/address";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  return NextResponse.json({ addresses: await addressService.list(user) });
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const input = addressSchema.parse(await req.json().catch(() => ({})));
  return NextResponse.json({ address: await addressService.create(user, input) }, { status: 201 });
});

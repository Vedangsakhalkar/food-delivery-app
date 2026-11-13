import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/handle-error";
import { userService } from "@/services/user-service";
import { updateProfileSchema } from "@/validators/auth";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  return NextResponse.json({ user });
});

export const PATCH = withErrorHandling(async (req) => {
  const user = await requireUser();
  const input = updateProfileSchema.parse(await req.json().catch(() => ({})));
  const updated = await userService.updateProfile(user.id, input);
  return NextResponse.json({ user: updated });
});

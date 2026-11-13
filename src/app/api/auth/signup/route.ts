import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/handle-error";
import { clientIp, enforce } from "@/lib/rate-limit";
import { limiters } from "@/lib/rate-limiters";
import { authService } from "@/lib/supabase/auth-gateway";
import { signUpSchema } from "@/validators/auth";

export const POST = withErrorHandling(async (req) => {
  enforce(limiters.signup, clientIp(req));
  const input = signUpSchema.parse(await req.json().catch(() => ({})));
  const origin = new URL(req.url).origin;
  await authService.signUp(input, `${origin}/auth/callback`);
  return NextResponse.json({ ok: true }, { status: 201 });
});

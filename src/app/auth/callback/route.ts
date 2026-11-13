import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Landing route for Supabase email links (confirm email, reset password). */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  // Only allow same-site relative redirects.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=link_invalid`);
}

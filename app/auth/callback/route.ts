import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") && nextRaw !== "/login" ? nextRaw : "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("[auth/callback] Supabase OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    try {
      const supabase = await createServerSupabase();
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      console.error("[auth/callback] exchange failed:", exchangeError);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("[auth/callback] unexpected error:", err);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=google`);
}

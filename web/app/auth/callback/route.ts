import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Google OAuth redirects here with a `code`; exchange it for a session, then send the user back into Admin. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/admin`);
    }
  }

  return NextResponse.redirect(`${origin}/admin?auth_error=1`);
}

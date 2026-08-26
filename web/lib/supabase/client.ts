import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Only call this after checking
 * `isSupabaseConfigured()` — it throws if the env vars are missing, which is
 * expected until web/docs/google-sso-setup.md has been completed.
 */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

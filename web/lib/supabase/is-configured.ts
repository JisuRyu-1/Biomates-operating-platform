/**
 * True once real Supabase project credentials are in place. Lets the UI show
 * a clear "setup needed" state instead of crashing while `.env.local` is
 * still empty (see web/docs/google-sso-setup.md).
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

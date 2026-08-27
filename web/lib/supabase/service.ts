import "server-only";
import { createClient } from "@supabase/supabase-js";

export function isServiceConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Service-role Supabase client -- bypasses RLS entirely. Only use this for
 * the narrow, deliberately-public server routes (registration create/read)
 * that must write to or read from PII tables without an authenticated admin
 * session. Never import this into client code.
 */
export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

import { createClient } from "@/lib/supabase/client";
import type { AdminAccount } from "@/lib/types";

export async function listAdmins(): Promise<AdminAccount[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("admin_whitelist").select("id, name, email").order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function findAdminByEmail(email: string): Promise<AdminAccount | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("admin_whitelist").select("id, name, email").eq("email", email).maybeSingle();
  if (error) throw error;
  return data;
}

export async function addAdmin(name: string, email: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("admin_whitelist").insert({ name, email });
  if (error) throw error;
}

export async function removeAdmin(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("admin_whitelist").delete().eq("id", id);
  if (error) throw error;
}

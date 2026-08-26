"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { findAdminByEmail } from "@/lib/admin-whitelist";
import type { AdminAccount } from "./types";

interface AuthContextValue {
  isConfigured: boolean;
  isLoading: boolean;
  currentAdmin: AdminAccount | null;
  isAuthed: boolean;
  /** Signed in with a real Google account, but that email isn't in admin_whitelist. */
  accessDenied: boolean;
  deniedEmail: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  dismissAccessDenied: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [isLoading, setIsLoading] = useState(configured);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();

    async function resolveSession(session: Session | null) {
      const email = session?.user?.email;
      if (!email) {
        setCurrentAdmin(null);
        setIsLoading(false);
        return;
      }
      try {
        const admin = await findAdminByEmail(email);
        if (admin) {
          setCurrentAdmin(admin);
          setAccessDenied(false);
          setDeniedEmail(null);
        } else {
          setCurrentAdmin(null);
          setAccessDenied(true);
          setDeniedEmail(email);
          await supabase.auth.signOut();
        }
      } finally {
        setIsLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => resolveSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveSession(session);
    });
    return () => subscription.subscription.unsubscribe();
  }, [configured]);

  const loginWithGoogle = useCallback(async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, [configured]);

  const logout = useCallback(async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentAdmin(null);
  }, [configured]);

  const dismissAccessDenied = useCallback(() => {
    setAccessDenied(false);
    setDeniedEmail(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isConfigured: configured,
        isLoading,
        currentAdmin,
        isAuthed: !!currentAdmin,
        accessDenied,
        deniedEmail,
        loginWithGoogle,
        logout,
        dismissAccessDenied,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AuthProvider");
  return ctx;
}

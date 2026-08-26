"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { useBiomatesData } from "./data-context";
import type { AdminAccount } from "./types";

const SESSION_KEY = "biomates_admin_session";

function readSessionAccountId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}
function notify() {
  listeners.forEach((l) => l());
}

interface AuthContextValue {
  currentAdmin: AdminAccount | null;
  isAuthed: boolean;
  login: (accountId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * "Who is currently signed in" is a session concept, kept separate from
 * `adminAccounts` (the whitelist of who is *allowed* to sign in, managed on
 * the Team screen). Nesting inside DataProvider lets a Team removal
 * immediately invalidate that person's session — `currentAdmin` is
 * recomputed against the live account list on every render.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { adminAccounts } = useBiomatesData();
  const sessionAccountId = useSyncExternalStore(subscribe, readSessionAccountId, () => null);
  const currentAdmin = sessionAccountId ? (adminAccounts.find((a) => a.id === sessionAccountId) ?? null) : null;

  const login = useCallback((accountId: string) => {
    try {
      window.localStorage.setItem(SESSION_KEY, accountId);
    } catch {
      // ignore
    }
    notify();
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    notify();
  }, []);

  return (
    <AuthContext.Provider value={{ currentAdmin, isAuthed: !!currentAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AuthProvider");
  return ctx;
}

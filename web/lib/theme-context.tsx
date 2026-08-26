"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

const THEME_KEY = "biomates_theme_pref";

function readIsDark(): boolean {
  let pref: string | null = null;
  try {
    pref = window.localStorage.getItem(THEME_KEY);
  } catch {
    // ignore
  }
  if (pref === "light") return false;
  if (pref === "dark") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    mql.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

// Stable references so useSyncExternalStore doesn't loop when nothing changed.
const listeners = new Set<() => void>();
function subscribeStore(callback: () => void): () => void {
  listeners.add(callback);
  const unsubscribe = subscribe(callback);
  return () => {
    listeners.delete(callback);
    unsubscribe();
  };
}
function notifyListeners() {
  listeners.forEach((l) => l());
}

const SERVER_SNAPSHOT = false;

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useSyncExternalStore(subscribeStore, readIsDark, () => SERVER_SNAPSHOT);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    const next = readIsDark() ? "light" : "dark";
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
    notifyListeners();
  }, []);

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

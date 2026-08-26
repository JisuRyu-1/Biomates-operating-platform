"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface DevicePreviewContextValue {
  isPreview: boolean;
  toggle: () => void;
}

const DevicePreviewContext = createContext<DevicePreviewContextValue | null>(null);

/** Session-only (not persisted) — matches the prototype's "미리보기" toggle, which also reset on reload. */
export function DevicePreviewProvider({ children }: { children: ReactNode }) {
  const [isPreview, setIsPreview] = useState(false);
  const toggle = useCallback(() => setIsPreview((v) => !v), []);

  return <DevicePreviewContext.Provider value={{ isPreview, toggle }}>{children}</DevicePreviewContext.Provider>;
}

export function useDevicePreview(): DevicePreviewContextValue {
  const ctx = useContext(DevicePreviewContext);
  if (!ctx) throw new Error("useDevicePreview must be used within a DevicePreviewProvider");
  return ctx;
}

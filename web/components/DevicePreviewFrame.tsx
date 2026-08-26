"use client";

import type { ReactNode } from "react";
import { useDevicePreview } from "@/lib/device-preview-context";

/**
 * Wraps page content in a phone-shaped frame when preview mode is on, so the
 * mobile layout (which reacts to container width via CSS container queries
 * inside the frame) can be checked without resizing the actual browser
 * window. The site header/bottom nav stay outside this wrapper and keep
 * reacting to the real viewport width, not the frame.
 */
export function DevicePreviewFrame({ children }: { children: ReactNode }) {
  const { isPreview } = useDevicePreview();

  if (!isPreview) return <>{children}</>;

  return (
    <div className="device-frame phone-preview">
      <div className="phone-preview-content">{children}</div>
    </div>
  );
}

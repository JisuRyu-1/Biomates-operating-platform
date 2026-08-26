"use client";

import { useEffect, useRef } from "react";
import type { Speaker } from "@/lib/types";

interface SpeakerModalProps {
  speaker: Speaker;
  onClose: () => void;
}

export function SpeakerModal({ speaker, onClose }: SpeakerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusables = Array.from(modal.querySelectorAll<HTMLElement>("button, [href], input, select, textarea"));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaker-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="speaker-modal" ref={modalRef}>
        <div className="speaker-modal-photo speaker-modal-photo-fallback" aria-hidden="true">
          {speaker.name.slice(0, 1)}
        </div>
        <h3 className="h2 brand-font" id="speaker-modal-title" style={{ textAlign: "center" }}>
          {speaker.name}
        </h3>
        <p className="muted" style={{ textAlign: "center", marginTop: 2 }}>
          {speaker.org}
        </p>
        <hr className="divider" style={{ margin: "16px 0" }} />
        {speaker.bio?.summary && (
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            {speaker.bio.summary}
          </p>
        )}
        <button type="button" className="btn btn-block" style={{ marginTop: 18 }} ref={closeBtnRef} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

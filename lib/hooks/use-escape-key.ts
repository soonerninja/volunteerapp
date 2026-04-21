"use client";

import { useEffect } from "react";

/**
 * Fire `handler` when the user presses Escape. Attaches a
 * document-level listener so it fires regardless of which element
 * inside the modal currently has focus.
 */
export function useEscapeKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handler, enabled]);
}

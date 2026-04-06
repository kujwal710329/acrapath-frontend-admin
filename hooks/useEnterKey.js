"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `handler` when the user presses Enter.
 *
 * Safely skipped when focus is on:
 *   - textarea  → Enter = newline
 *   - select    → Enter = pick option
 *   - button    → Enter = native click (prevents double-firing)
 *
 * Uses a ref internally so the listener is only re-registered
 * when `enabled` changes, not on every render.
 *
 * @param {() => void} handler  - callback to invoke on Enter
 * @param {{ enabled?: boolean }} options
 */
export function useEnterKey(handler, { enabled = true } = {}) {
  const handlerRef = useRef(handler);

  // Always keep the ref pointing to the latest handler
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e) => {
      if (e.key !== "Enter") return;

      const tag = document.activeElement?.tagName?.toLowerCase();

      // Skip elements where Enter has a native meaning
      if (tag === "textarea" || tag === "select" || tag === "button") return;

      e.preventDefault();
      handlerRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]); // only re-register when enabled flips
}

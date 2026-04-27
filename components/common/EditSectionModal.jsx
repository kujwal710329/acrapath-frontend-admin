"use client";

import { useEffect } from "react";
import Button from "@/components/common/Button";

/**
 * Reusable edit-section modal shell.
 *
 * Props:
 *   title        — modal header text
 *   isOpen       — boolean
 *   onClose      — called on Cancel / backdrop click / Escape
 *   onSave       — called when user clicks Save
 *   isLoading    — disables inputs and shows spinner on Save button
 *   children     — form fields rendered inside the scrollable body
 */
export default function EditSectionModal({
  title,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  children,
}) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isLoading, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-[fadeIn_0.15s_ease]"
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      <div className="w-full max-w-lg rounded-2xl bg-(--pure-white) shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-black-shade-100) shrink-0">
          <h2 className="text-16 font-semibold text-(--color-black-shade-900)">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-full text-(--color-black-shade-500) hover:bg-(--color-black-shade-100) transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <fieldset disabled={isLoading} className="contents">
            {children}
          </fieldset>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-(--color-black-shade-100) shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-auto! h-10! px-5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onSave}
            disabled={isLoading}
            className="w-auto! h-10! px-6 gap-2"
          >
            {isLoading && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
            )}
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

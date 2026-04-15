"use client";

import { useEffect } from "react";
import Heading from "@/components/common/Heading";
import Button from "@/components/common/Button";

/**
 * Reusable centered confirmation dialog.
 *
 * Props:
 *   open          — boolean, controls visibility
 *   onClose       — called when user cancels or presses Escape
 *   onConfirm     — called when user clicks the confirm button
 *   title         — dialog heading (string)
 *   description   — optional body text (string)
 *   confirmLabel  — confirm button text (default "Confirm")
 *   cancelLabel   — cancel button text (default "Cancel")
 *   confirmVariant — Button variant for the confirm action: "primary" | "danger" (default "primary")
 *   loading       — shows spinner on confirm button while true
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  loading = false,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-2xl bg-(--pure-white) shadow-xl p-6 flex flex-col gap-5">
        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <Heading as="h2" className="text-18">
            {title}
          </Heading>
          {description && (
            <p className="text-14 text-(--color-black-shade-500) leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-auto! h-10! px-5"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
            className="w-auto! h-10! px-5"
          >
            {loading && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

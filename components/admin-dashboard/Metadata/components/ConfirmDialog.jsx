"use client";

/**
 * Lightweight confirm dialog — rendered as a fixed overlay.
 * No external library needed; matches project Tailwind patterns.
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // "danger" | "warning"
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmCls =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-(--color-primary) hover:bg-(--color-primary-shade-700) text-white";

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-(--pure-white) rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-16 font-bold text-(--color-black-shade-800) mb-2">
          {title}
        </h3>
        {message && (
          <p className="text-14 text-(--color-black-shade-600) mb-6">{message}</p>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-14 font-semibold border border-(--color-black-shade-200) text-(--color-black-shade-700) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-14 font-semibold transition-colors cursor-pointer ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

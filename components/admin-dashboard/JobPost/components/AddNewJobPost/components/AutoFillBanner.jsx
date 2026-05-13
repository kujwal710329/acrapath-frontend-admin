"use client";

/**
 * AutoFillBanner — shown above Company Description when it was auto-filled
 * from a selected company suggestion. Dismiss with [×].
 */
export default function AutoFillBanner({ source, onDismiss }) {
  return (
    <div
      className="mb-3 flex items-start justify-between gap-3 rounded-xl px-4 py-3"
      style={{
        background: "color-mix(in srgb, var(--color-secondary) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent)",
      }}
    >
      <div className="flex items-start gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="mt-0.5 shrink-0"
          style={{ color: "var(--color-secondary-shade-900)" }}
        >
          <path
            d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 11.5l-3-3 1.06-1.06L6.5 9.38l5.44-5.44 1.06 1.06L6.5 11.5Z"
            fill="currentColor"
          />
        </svg>
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-secondary-shade-900)" }}
          >
            Description auto-filled from{" "}
            {source === "metadata" ? "verified company data" : "previous job posting"}
          </p>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--color-secondary-shade-800)" }}
          >
            Edit freely — your changes will not be saved back.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss auto-fill banner"
        className="shrink-0 rounded p-0.5 transition-colors hover:bg-(--color-secondary-shade-100) cursor-pointer"
        style={{ color: "var(--color-secondary-shade-800)" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 1l12 12M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

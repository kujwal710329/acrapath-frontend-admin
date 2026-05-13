"use client";

import { useState, useRef, useEffect } from "react";
import { JOB_POST_STATUS_OPTIONS } from "./JobPostStatusDropdown";

// ── Status pill tokens (uses global CSS vars) ─────────────────────────────────
const STATUS_STYLE = {
  requests: {
    idle:   { border: "color-mix(in srgb, var(--color-primary) 35%, transparent)",  color: "var(--color-primary)",   background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" },
    active: { border: "var(--color-primary)",   color: "var(--pure-white)", background: "var(--color-primary)" },
  },
  active: {
    idle:   { border: "color-mix(in srgb, var(--color-secondary) 40%, transparent)", color: "var(--color-secondary-shade-800)", background: "color-mix(in srgb, var(--color-secondary) 10%, transparent)" },
    active: { border: "var(--color-secondary)", color: "var(--pure-white)", background: "var(--color-secondary)" },
  },
  rejected: {
    idle:   { border: "color-mix(in srgb, var(--color-red) 35%, transparent)", color: "var(--color-red)", background: "color-mix(in srgb, var(--color-red) 8%, transparent)" },
    active: { border: "var(--color-red)", color: "var(--pure-white)", background: "var(--color-red)" },
  },
};

function Spinner() {
  return (
    <svg className="animate-spin shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
      <path fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 00-12 12h4z" style={{ opacity: 0.75 }} />
    </svg>
  );
}

// ── BulkActionBar ─────────────────────────────────────────────────────────────
/**
 * Gmail-style floating action bar.
 *
 * Props
 * ─────
 * count                 number   — rows currently selected
 * total                 number   — total visible rows
 * isIndeterminate       boolean  — partial selection (drives checkbox state)
 * onSelectAll           fn       — select all rows
 * onClear               fn       — deselect all rows
 * onBulkStatus          fn|null  — async (statusValue) => void  (omit to hide)
 * onBulkDeleteRequest   fn|null  — () => void  caller opens confirm modal (omit to hide)
 */
export default function BulkActionBar({
  count,
  total,
  isIndeterminate,
  onSelectAll,
  onClear,
  onBulkStatus,
  onBulkDeleteRequest,
}) {
  const [pickedStatus, setPickedStatus] = useState(null);
  const [applying, setApplying] = useState(false);
  const checkRef = useRef(null);

  useEffect(() => {
    if (checkRef.current) checkRef.current.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  // Reset pill choice whenever the selection count changes
  useEffect(() => { setPickedStatus(null); }, [count]);

  const handleCheckbox = () => (count === total ? onClear() : onSelectAll());

  const handleApply = async () => {
    if (!pickedStatus || applying) return;
    setApplying(true);
    try {
      await onBulkStatus(pickedStatus);
    } finally {
      setApplying(false);
      setPickedStatus(null);
    }
  };

  const showStatus = !!onBulkStatus;
  const showDelete = !!onBulkDeleteRequest;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        padding: "10px 16px",
        borderRadius: "12px",
        border: "1.5px solid var(--color-primary)",
        background: "var(--pure-white)",
        boxShadow: "0 4px 20px rgba(20, 127, 246, 0.10)",
        animation: "bulkBarSlideIn 0.18s ease-out both",
      }}
    >
      <style>{`@keyframes bulkBarSlideIn{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Checkbox */}
      <input
        ref={checkRef}
        type="checkbox"
        checked={count === total}
        onChange={handleCheckbox}
        className="h-4 w-4 shrink-0 rounded cursor-pointer accent-(--color-primary)"
        aria-label="Toggle all"
      />

      {/* Count */}
      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary)", whiteSpace: "nowrap" }}>
        {count} of {total} selected
      </span>

      {/* Divider */}
      <span style={{ width: "1px", height: "18px", background: "var(--color-black-shade-200)", flexShrink: 0 }} />

      {/* Status pills + update */}
      {showStatus && (
        <>
          <span style={{ fontSize: "12px", color: "var(--color-black-shade-500)", whiteSpace: "nowrap" }}>
            Set status:
          </span>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {JOB_POST_STATUS_OPTIONS.map((opt) => {
              const tokens = STATUS_STYLE[opt.value];
              const isChosen = pickedStatus === opt.value;
              const t = isChosen ? tokens.active : tokens.idle;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPickedStatus(isChosen ? null : opt.value)}
                  disabled={applying}
                  style={{
                    padding: "3px 12px",
                    borderRadius: "999px",
                    border: `1.5px solid ${t.border}`,
                    color: t.color,
                    background: t.background,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: applying ? "not-allowed" : "pointer",
                    opacity: applying ? 0.5 : 1,
                    transition: "all 0.12s ease",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Update button */}
          <button
            type="button"
            onClick={handleApply}
            disabled={!pickedStatus || applying}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 16px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12px",
              fontWeight: 600,
              cursor: pickedStatus && !applying ? "pointer" : "not-allowed",
              background: pickedStatus && !applying ? "var(--color-primary)" : "var(--color-black-shade-100)",
              color: pickedStatus && !applying ? "var(--pure-white)" : "var(--color-black-shade-400)",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {applying && <Spinner />}
            {applying ? "Updating…" : "Update"}
          </button>
        </>
      )}

      {/* Delete button */}
      {showDelete && (
        <>
          {showStatus && (
            <span style={{ width: "1px", height: "18px", background: "var(--color-black-shade-200)", flexShrink: 0 }} />
          )}
          <button
            type="button"
            onClick={onBulkDeleteRequest}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 16px",
              borderRadius: "8px",
              border: "1.5px solid color-mix(in srgb, var(--color-red) 35%, transparent)",
              background: "color-mix(in srgb, var(--color-red) 8%, transparent)",
              color: "var(--color-red)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.12s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "color-mix(in srgb, var(--color-red) 15%, transparent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "color-mix(in srgb, var(--color-red) 8%, transparent)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
            Delete {count > 1 ? `${count} jobs` : "job"}
          </button>
        </>
      )}

      {/* Clear × */}
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        title="Clear selection"
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "1px solid var(--color-black-shade-200)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--color-black-shade-500)",
          flexShrink: 0,
          transition: "all 0.12s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--color-black-shade-100)";
          e.currentTarget.style.borderColor = "var(--color-black-shade-300)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "var(--color-black-shade-200)";
        }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

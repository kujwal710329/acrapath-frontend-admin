"use client";

import { useState, useEffect, useRef } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export function fmtMonthYear(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function MonthYearPicker({ value, onChange, placeholder, minDate, maxDate, disabled, error }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const y = new Date(value).getUTCFullYear();
      return isNaN(y) ? new Date().getFullYear() : y;
    }
    return new Date().getFullYear();
  });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const parsedValue = value ? new Date(value) : null;
  const selectedMonth = parsedValue && !isNaN(parsedValue.getTime()) ? parsedValue.getUTCMonth() : null;
  const selectedYear = parsedValue && !isNaN(parsedValue.getTime()) ? parsedValue.getUTCFullYear() : null;

  const displayValue =
    selectedMonth !== null && selectedYear !== null
      ? `${MONTHS[selectedMonth]} ${selectedYear}`
      : null;

  const minParsed = minDate ? new Date(minDate) : null;
  const maxParsed = maxDate ? new Date(maxDate) : null;
  const minY = minParsed ? minParsed.getUTCFullYear() : null;
  const minM = minParsed ? minParsed.getUTCMonth() : null;
  const maxY = maxParsed ? maxParsed.getUTCFullYear() : null;
  const maxM = maxParsed ? maxParsed.getUTCMonth() : null;

  const isMonthDisabled = (monthIndex) => {
    if (minParsed) {
      if (viewYear < minY) return true;
      if (viewYear === minY && monthIndex < minM) return true;
    }
    if (maxParsed) {
      if (viewYear > maxY) return true;
      if (viewYear === maxY && monthIndex > maxM) return true;
    }
    return false;
  };

  const handleSelect = (monthIndex) => {
    if (isMonthDisabled(monthIndex)) return;
    const date = new Date(Date.UTC(viewYear, monthIndex, 1));
    onChange(date.toISOString());
    setOpen(false);
  };

  const panelStyle = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "var(--pure-white)",
    border: "1px solid var(--color-black-shade-200)",
    borderRadius: "0.75rem",
    padding: "0.75rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    minWidth: "220px",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "3.5rem",
          padding: "0 1.25rem",
          borderRadius: "0.75rem",
          border: `1px solid ${error ? "var(--color-red)" : "var(--color-black-shade-300)"}`,
          backgroundColor: "var(--pure-white)",
          color: displayValue ? "var(--color-black-shade-900)" : "var(--color-black-shade-400)",
          fontSize: "0.9375rem",
          fontWeight: 500,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          outline: "none",
          transition: "border-color 0.15s",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <span>{displayValue || placeholder || "Select month"}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, marginLeft: "0.5rem", color: "var(--color-black-shade-400)" }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {error && (
        <p style={{ marginTop: "0.375rem", fontSize: "0.75rem", color: "var(--color-red)" }}>
          {error}
        </p>
      )}

      {open && (
        <div role="dialog" aria-label="Month and year picker" style={panelStyle}>
          {/* Year navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <button
              type="button"
              aria-label="Previous year"
              onClick={() => setViewYear((y) => y - 1)}
              style={{
                padding: "0.25rem 0.625rem",
                borderRadius: "0.375rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-black-shade-500)",
                fontSize: "1.125rem",
                fontWeight: 600,
                lineHeight: 1,
                fontFamily: "inherit",
              }}
            >
              ‹
            </button>
            <span style={{ fontWeight: 500, color: "var(--color-black-shade-900)", fontSize: "0.9375rem" }}>
              {viewYear}
            </span>
            <button
              type="button"
              aria-label="Next year"
              onClick={() => setViewYear((y) => y + 1)}
              style={{
                padding: "0.25rem 0.625rem",
                borderRadius: "0.375rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-black-shade-500)",
                fontSize: "1.125rem",
                fontWeight: 600,
                lineHeight: 1,
                fontFamily: "inherit",
              }}
            >
              ›
            </button>
          </div>

          {/* Month grid — 4 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.25rem" }}>
            {MONTHS.map((m, i) => {
              const sel = selectedMonth === i && selectedYear === viewYear;
              const dis = isMonthDisabled(i);
              return (
                <button
                  key={m}
                  type="button"
                  aria-label={`${FULL_MONTHS[i]} ${viewYear}`}
                  disabled={dis}
                  onClick={() => handleSelect(i)}
                  style={{
                    padding: "0.5rem 0",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: sel ? 600 : 400,
                    border: "none",
                    cursor: dis ? "not-allowed" : "pointer",
                    backgroundColor: sel ? "var(--color-primary)" : "transparent",
                    color: sel
                      ? "var(--pure-white)"
                      : dis
                      ? "var(--color-black-shade-300)"
                      : "var(--color-black-shade-800)",
                    opacity: dis ? 0.5 : 1,
                    transition: "background-color 0.15s, color 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!sel && !dis) e.currentTarget.style.backgroundColor = "var(--color-black-shade-100)";
                  }}
                  onMouseLeave={(e) => {
                    if (!sel && !dis) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

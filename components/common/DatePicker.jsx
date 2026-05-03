"use client";

import { useState, useEffect, useRef } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export function DatePicker({ value, onChange, placeholder, minDate, maxDate, disabled, error }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("month"); // "month" | "day"
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const y = new Date(value).getUTCFullYear();
      return isNaN(y) ? new Date().getFullYear() : y;
    }
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setStep("month");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") { setOpen(false); setStep("month"); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const parsedValue = value ? new Date(value) : null;
  const isValidParsed = parsedValue && !isNaN(parsedValue.getTime());
  const selectedDay = isValidParsed ? parsedValue.getUTCDate() : null;
  const selectedMonth = isValidParsed ? parsedValue.getUTCMonth() : null;
  const selectedYear = isValidParsed ? parsedValue.getUTCFullYear() : null;

  const displayValue = isValidParsed
    ? `${parsedValue.getUTCDate()} ${MONTHS[parsedValue.getUTCMonth()]} ${parsedValue.getUTCFullYear()}`
    : null;

  const minParsed = minDate ? new Date(minDate) : null;
  const maxParsed = maxDate ? new Date(maxDate) : null;
  const minY = minParsed ? minParsed.getUTCFullYear() : null;
  const minMo = minParsed ? minParsed.getUTCMonth() : null;
  const minD = minParsed ? minParsed.getUTCDate() : null;
  const maxY = maxParsed ? maxParsed.getUTCFullYear() : null;
  const maxMo = maxParsed ? maxParsed.getUTCMonth() : null;
  const maxD = maxParsed ? maxParsed.getUTCDate() : null;

  const isMonthDisabled = (monthIndex) => {
    if (minParsed) {
      if (viewYear < minY) return true;
      if (viewYear === minY && monthIndex < minMo) return true;
    }
    if (maxParsed) {
      if (viewYear > maxY) return true;
      if (viewYear === maxY && monthIndex > maxMo) return true;
    }
    return false;
  };

  const isDayDisabled = (day) => {
    if (viewMonth === null) return true;
    if (minParsed) {
      if (viewYear < minY) return true;
      if (viewYear === minY && viewMonth < minMo) return true;
      if (viewYear === minY && viewMonth === minMo && day < minD) return true;
    }
    if (maxParsed) {
      if (viewYear > maxY) return true;
      if (viewYear === maxY && viewMonth > maxMo) return true;
      if (viewYear === maxY && viewMonth === maxMo && day > maxD) return true;
    }
    return false;
  };

  const handleMonthSelect = (monthIndex) => {
    if (isMonthDisabled(monthIndex)) return;
    setViewMonth(monthIndex);
    setStep("day");
  };

  const handleDaySelect = (day) => {
    if (isDayDisabled(day)) return;
    const date = new Date(Date.UTC(viewYear, viewMonth, day));
    onChange(date.toISOString());
    setOpen(false);
    setStep("month");
    setViewMonth(null);
  };

  const daysInMonth = viewMonth !== null ? new Date(viewYear, viewMonth + 1, 0).getDate() : 0;

  const navBtnStyle = {
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
  };

  const cellBtnBase = {
    border: "none",
    fontFamily: "inherit",
    transition: "background-color 0.15s, color 0.15s",
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
        <span>{displayValue || placeholder || "Select date"}</span>
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
        <div
          role="dialog"
          aria-label="Date picker"
          style={{
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
          }}
        >
          {step === "month" && (
            <>
              {/* Year navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <button type="button" aria-label="Previous year" onClick={() => setViewYear((y) => y - 1)} style={navBtnStyle}>‹</button>
                <span style={{ fontWeight: 500, color: "var(--color-black-shade-900)", fontSize: "0.9375rem" }}>{viewYear}</span>
                <button type="button" aria-label="Next year" onClick={() => setViewYear((y) => y + 1)} style={navBtnStyle}>›</button>
              </div>
              {/* Month grid */}
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
                      onClick={() => handleMonthSelect(i)}
                      style={{
                        ...cellBtnBase,
                        padding: "0.5rem 0",
                        borderRadius: "9999px",
                        fontSize: "0.8125rem",
                        fontWeight: sel ? 600 : 400,
                        cursor: dis ? "not-allowed" : "pointer",
                        backgroundColor: sel ? "var(--color-primary)" : "transparent",
                        color: sel ? "var(--pure-white)" : dis ? "var(--color-black-shade-300)" : "var(--color-black-shade-800)",
                        opacity: dis ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => { if (!sel && !dis) e.currentTarget.style.backgroundColor = "var(--color-black-shade-100)"; }}
                      onMouseLeave={(e) => { if (!sel && !dis) e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === "day" && viewMonth !== null && (
            <>
              {/* Header with back arrow and month+year label */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <button type="button" aria-label="Back to month selection" onClick={() => setStep("month")} style={navBtnStyle}>‹</button>
                <span style={{ fontWeight: 500, color: "var(--color-black-shade-900)", fontSize: "0.875rem" }}>
                  {FULL_MONTHS[viewMonth]} {viewYear}
                </span>
                <div style={{ width: "2rem" }} />
              </div>
              {/* Day grid — 6 columns for compact layout */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.2rem" }}>
                {Array.from({ length: daysInMonth }, (_, idx) => idx + 1).map((day) => {
                  const dis = isDayDisabled(day);
                  const sel = selectedYear === viewYear && selectedMonth === viewMonth && selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-label={`${day} ${FULL_MONTHS[viewMonth]} ${viewYear}`}
                      disabled={dis}
                      onClick={() => handleDaySelect(day)}
                      style={{
                        ...cellBtnBase,
                        padding: "0.35rem 0",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: sel ? 600 : 400,
                        cursor: dis ? "not-allowed" : "pointer",
                        backgroundColor: sel ? "var(--color-primary)" : "transparent",
                        color: sel ? "var(--pure-white)" : dis ? "var(--color-black-shade-300)" : "var(--color-black-shade-800)",
                        opacity: dis ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => { if (!sel && !dis) e.currentTarget.style.backgroundColor = "var(--color-black-shade-100)"; }}
                      onMouseLeave={(e) => { if (!sel && !dis) e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

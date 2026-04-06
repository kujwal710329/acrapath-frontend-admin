"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export const JOB_POST_STATUS_OPTIONS = [
  { value: "requests", label: "Requested" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLORS = {
  requests: "text-(--color-primary)",
  active: "text-green-600",
  rejected: "text-red-500",
};

export default function JobPostStatusDropdown({
  value,
  onChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const approxMenuH = JOB_POST_STATUS_OPTIONS.length * 38 + 10;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceBelow < approxMenuH) {
      setMenuStyle({ top: rect.top - approxMenuH - 4, left: rect.left });
    } else {
      setMenuStyle({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const handleSelect = useCallback(
    (val) => {
      onChange?.(val);
      setOpen(false);
    },
    [onChange]
  );

  const current =
    JOB_POST_STATUS_OPTIONS.find((o) => o.value === value) ??
    JOB_POST_STATUS_OPTIONS[0];

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() =>
          disabled ? undefined : open ? setOpen(false) : openMenu()
        }
        disabled={disabled}
        className={`flex items-center gap-1.5 text-14 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${STATUS_COLORS[current?.value] ?? "text-(--color-black-shade-700)"}`}
      >
        <span>{current?.label}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", ...menuStyle, zIndex: 9999 }}
            className="w-36 rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1"
          >
            {JOB_POST_STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 text-14 hover:bg-(--color-black-shade-50) transition-colors cursor-pointer ${STATUS_COLORS[opt.value] ?? ""} ${opt.value === value ? "font-semibold" : "font-medium"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

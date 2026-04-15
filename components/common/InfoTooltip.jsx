"use client";

import { useState, useEffect, useRef } from "react";
import Icon from "@/components/common/Icon";

/**
 * Info icon that shows a polished tooltip on hover (desktop) or click (mobile).
 *
 * @param {string} text    - Tooltip content.
 * @param {"center"|"left"|"right"} align
 *   "center" (default) — centres tooltip above icon.
 *   "left"             — right-aligns tooltip to icon (use when icon is near right edge).
 *   "right"            — left-aligns tooltip to icon (use when icon is near left edge).
 */
export default function InfoTooltip({ text, align = "center" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const bubblePos =
    align === "left"
      ? "right-0"
      : align === "right"
        ? "left-0"
        : "left-1/2 -translate-x-1/2";

  const arrowPos =
    align === "left"
      ? "right-3"
      : align === "right"
        ? "left-3"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      ref={ref}
      className="group relative inline-flex cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      {/* Icon */}
      <span
        className={`flex items-center transition-opacity duration-150 ${
          open ? "opacity-100" : "opacity-50 group-hover:opacity-100"
        }`}
      >
        <Icon
          name="statics/Employer-Dashboard/info.svg"
          width={16}
          height={16}
          alt="More info"
        />
      </span>

      {/* Tooltip bubble — visible on hover (desktop) OR when open (click/touch) */}
      <div
        className={`
          pointer-events-none
          absolute bottom-full z-50
          mb-2.5 w-60
          ${bubblePos}
          rounded-xl
          border border-white/10
          bg-(--color-black-shade-900)
          px-3.5 py-2.5
          text-[0.75rem] font-normal leading-relaxed tracking-wide text-white/90
          shadow-[0_8px_24px_rgba(0,0,0,0.25)]
          transition-all duration-200 ease-out
          ${
            open
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          }
        `}
      >
        {text}

        {/* Arrow */}
        <span className={`absolute ${arrowPos} top-full`}>
          <svg width="14" height="7" viewBox="0 0 14 7" fill="none" aria-hidden="true">
            <path d="M0 0 L7 7 L14 0" fill="#1a1a1a" />
            <path d="M0 0 L7 7 L14 0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          </svg>
        </span>
      </div>
    </div>
  );
}

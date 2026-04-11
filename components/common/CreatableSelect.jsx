"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "@/components/common/Icon";

export default function CreatableSelect({
  label,
  options = [],
  value = "",
  onChange,
  onBlur,
  placeholder = "Select option",
  allowCreate = true,
  showAllOnOpen = false,
  error,
  isDisabled = false,
  disabled = false,
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);

  const isOff = isDisabled || disabled;

  const ref = useRef(null);
  const hasFocused = useRef(false);
  const hasBlurred = useRef(false);
  const didSelectRef = useRef(false);
  // Refs so the stale useEffect closure can read current values
  const queryRef = useRef("");
  const valueRef = useRef(value);
  const inputWasModifiedRef = useRef(false);

  useEffect(() => { valueRef.current = value; }, [value]);

  const filtered =
    open && showAllOnOpen && !query
      ? options
      : options.filter((opt) =>
          opt.toLowerCase().includes(query.toLowerCase()),
        );

  const exists = options.some(
    (opt) => opt.toLowerCase() === query.toLowerCase(),
  );

  const triggerBlur = () => {
    if (hasFocused.current && !hasBlurred.current) {
      hasBlurred.current = true;
      hasFocused.current = false;
      onBlur?.(didSelectRef.current);
      didSelectRef.current = false;
    }
  };

  const openDropdown = () => {
    if (ref.current) {
      const { bottom } = ref.current.getBoundingClientRect();
      setDropUp(window.innerHeight - bottom < 240);
    }
    setOpen(true);
  };

  const selectValue = (val) => {
    didSelectRef.current = true;
    onChange(val);
    queryRef.current = "";
    setQuery("");
    inputWasModifiedRef.current = false;
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) {
        // If the user explicitly deleted the text and closed without selecting, clear the parent value
        if (!didSelectRef.current && inputWasModifiedRef.current && queryRef.current === "" && valueRef.current) {
          onChange?.("");
        }
        inputWasModifiedRef.current = false;
        setOpen(false);
        triggerBlur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = open ? query : value;

  // Determine border class based on state priority: disabled > error > open > default
  let borderClass;
  if (isOff) {
    borderClass =
      "border-(--color-black-shade-200) bg-(--color-black-shade-100) text-(--color-black-shade-400) cursor-not-allowed";
  } else if (error) {
    borderClass = "border-(--color-red) focus:border-(--color-red)";
  } else if (open) {
    borderClass = "border-(--color-primary)";
  } else {
    borderClass =
      "border-(--color-black-shade-300) hover:border-(--color-black-shade-400) focus:border-(--color-primary)";
  }

  // Arrow color matches error state
  const arrowColor = error
    ? "var(--color-red)"
    : open
      ? "var(--color-primary)"
      : "var(--color-black-shade-400)";

  return (
    <div className={`mb-4 ${className}`} ref={ref}>
      {label && (
        <label className="mb-2 block text-[0.9375rem] font-medium text-(--color-black-shade-900)">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          value={displayValue}
          placeholder={placeholder}
          disabled={isOff}
          onFocus={() => {
            if (isOff) return;
            hasFocused.current = true;
            hasBlurred.current = false;
            openDropdown();
            const initial = showAllOnOpen ? "" : value || "";
            queryRef.current = initial;
            setQuery(initial);
          }}
          onChange={(e) => {
            if (isOff) return;
            queryRef.current = e.target.value;
            inputWasModifiedRef.current = true;
            setQuery(e.target.value);
            openDropdown();
          }}
          className={`h-14 w-full rounded-xl border px-5 ${value && !isOff ? "pr-16" : "pr-12"} text-[0.9375rem] font-medium text-(--color-black-shade-900) outline-none transition-colors duration-150 placeholder:text-(--color-black-shade-400) ${borderClass}`}
        />

        {/* Clear button — shown when a value is selected */}
        {value && !isOff && (
          <button
            type="button"
            aria-label="Clear selection"
            className="absolute right-9 top-1/2 -translate-y-1/2 flex items-center justify-center text-(--color-black-shade-400) cursor-pointer hover:text-(--color-black-shade-700)"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange?.("");
              queryRef.current = "";
              setQuery("");
              inputWasModifiedRef.current = false;
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Animated arrow */}
        <span
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: arrowColor }}
        >
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {open && !isOff && (
          <ul className={`absolute z-20 max-h-56 w-full overflow-auto rounded-xl border border-(--color-black-shade-100) bg-white py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.10)] ${dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}>
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <li
                  key={opt}
                  onMouseDown={() => selectValue(opt)}
                  className={`mx-1.5 flex cursor-pointer items-center justify-between rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                    opt === value
                      ? "bg-(--color-primary-shade-100) font-semibold text-(--color-primary)"
                      : "font-medium text-(--color-black-shade-800) hover:bg-(--color-black-shade-50)"
                  }`}
                >
                  <span>{opt}</span>
                  {opt === value && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </li>
              ))
            ) : (
              <li className="px-5 py-3 text-sm text-(--color-black-shade-400)">
                No results found
              </li>
            )}

            {allowCreate && query && !exists && (
              <li
                onMouseDown={() => selectValue(query)}
                className="mx-1.5 mt-0.5 flex cursor-pointer items-center gap-2 rounded-lg border-t border-(--color-black-shade-100) px-3.5 py-2.5 text-sm font-medium text-(--color-primary) hover:bg-(--color-black-shade-50)"
              >
                <Icon
                  name="statics/login/plus-icon.svg"
                  width={14}
                  height={14}
                />
                Add "{query}"
              </li>
            )}
          </ul>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-(--color-red)">{error}</p>
      )}
    </div>
  );
}

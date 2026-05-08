"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Reusable typeahead dropdown with debounced search.
 * Used for Company Name and Job Title fields in job post forms.
 * All colors from globals.css CSS variables — no raw hex or Tailwind color scales.
 */
export function SearchableInput({
  value,
  onChange,
  onSelect,
  onBlur,
  fetchSuggestions,
  renderItem,
  getItemLabel,
  placeholder = "",
  debounceMs = 300,
  minChars = 2,
  disabled = false,
  error,
  className = "",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const latestQueryRef = useRef("");

  // ── Debounced fetch ────────────────────────────────────────────────────────

  const runFetch = useCallback(
    async (query) => {
      if (query.length < minChars) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      latestQueryRef.current = query;
      setLoading(true);
      try {
        const results = await fetchSuggestions(query);
        // Discard stale responses
        if (latestQueryRef.current !== query) return;
        setSuggestions(results ?? []);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        if (latestQueryRef.current !== query) return;
        setSuggestions([]);
      } finally {
        if (latestQueryRef.current === query) setLoading(false);
      }
    },
    [fetchSuggestions, minChars]
  );

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      onChange(val);

      if (!val) {
        setSuggestions([]);
        setOpen(false);
        setLoading(false);
        clearTimeout(debounceRef.current);
        return;
      }

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runFetch(val), debounceMs);
    },
    [onChange, debounceMs, runFetch]
  );

  // ── Keyboard navigation ────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e) => {
      if (!open || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          e.preventDefault();
          handleSelect(suggestions[activeIndex]);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    },
    [open, suggestions, activeIndex] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Select ─────────────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (item) => {
      onChange(getItemLabel(item));
      onSelect?.(item);
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange, onSelect, getItemLabel]
  );

  // ── Click outside ──────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Cleanup debounce on unmount ────────────────────────────────────────────

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // ── Shared input style (matches existing form inputs exactly) ──────────────

  const inputBase =
    "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400) pr-12";
  const inputNormal =
    "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
  const inputErrorCls =
    "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";
  const inputDisabled =
    "border-(--color-black-shade-200) bg-(--color-black-shade-50) text-(--color-black-shade-800) cursor-default";

  const inputClass = disabled
    ? `${inputBase} ${inputDisabled}`
    : error
    ? `${inputBase} ${inputErrorCls}`
    : `${inputBase} ${inputNormal}`;

  const showDropdown = open && suggestions.length > 0;
  const showNoResults = open && !loading && suggestions.length === 0 && value?.length >= minChars;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Delay so click on dropdown item fires first
            setTimeout(() => {
              onBlur?.();
            }, 150);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={inputClass}
        />

        {/* Loading spinner */}
        {loading && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-(--color-black-shade-400)"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-(--color-red)">{error}</p>
      )}

      {/* Dropdown panel */}
      {(showDropdown || showNoResults) && (
        <div
          className="absolute z-[300] top-full mt-1 w-full rounded-xl border border-(--color-black-shade-200) bg-(--pure-white) shadow-lg overflow-hidden"
          style={{ maxHeight: 280, overflowY: "auto" }}
        >
          {showNoResults ? (
            <div className="px-4 py-3 text-sm text-(--color-black-shade-400) text-center">
              No results for &quot;{value}&quot;
            </div>
          ) : (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`px-4 py-3 cursor-pointer transition-colors text-sm text-(--color-black-shade-900) ${
                  idx === activeIndex
                    ? "bg-(--color-primary-shade-100)"
                    : "hover:bg-(--color-black-shade-50)"
                }`}
              >
                {renderItem(item)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableInput;

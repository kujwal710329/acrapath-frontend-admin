"use client";

import { useState, useRef, useEffect } from "react";

// ── SelectPill ────────────────────────────────────────────────────────────────
// Single-select pill — used for Job Type, Work Type, Pay Type, Education, etc.
export function SelectPill({ label, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`h-9 cursor-pointer rounded-full border px-4 text-base font-medium transition-colors
        ${
          isSelected
            ? "border-(--color-primary) bg-(--color-primary-shade-100) text-(--color-primary)"
            : "border-(--color-black-shade-300) text-(--color-black-shade-700) hover:border-(--color-primary)"
        }`}
    >
      {label}
    </button>
  );
}

// ── TogglePill ────────────────────────────────────────────────────────────────
// Multi-select toggle pill with × / + icon — used for small predefined sets
// like Additional Requirements (Gender, Age, Assets, Regional Languages).
export function TogglePill({ label, isSelected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-base font-medium transition-colors
        ${
          isSelected
            ? "border-(--color-primary) bg-(--color-primary-shade-100) text-(--color-primary)"
            : "border-(--color-black-shade-300) text-(--color-black-shade-700) hover:border-(--color-primary)"
        }`}
    >
      {label}
      {isSelected ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  );
}

// ── TagInput ──────────────────────────────────────────────────────────────────
// Multi-select tag input with:
//   • Removable pill tags for each selected item (× button)
//   • Filtered suggestion dropdown from predefined `options`
//   • Custom entry support (allowCreate)
//   • Keyboard: Enter to confirm, Backspace to remove last tag, Escape to close
export function TagInput({
  options = [],
  value = [],
  onChange,
  placeholder = "Search or type to add...",
  allowCreate = true,
  error,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Only show options that are not already selected
  const available = options.filter((o) => !value.includes(o));

  const filtered = query
    ? available.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : available;

  const trimmed = query.trim();
  const exactMatch = options.some(
    (o) => o.toLowerCase() === trimmed.toLowerCase(),
  );
  const canCreate =
    allowCreate && trimmed && !exactMatch && !value.includes(trimmed);

  const showDropdown = open && (filtered.length > 0 || canCreate);

  const addTag = (tag) => {
    const t = tag.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeTag = (tag) => onChange(value.filter((v) => v !== tag));

  // Measure space below container and flip upward if needed
  const openDropdown = () => {
    if (containerRef.current) {
      const { bottom } = containerRef.current.getBoundingClientRect();
      // 240px ≈ max-h-56 (224px) + a little breathing room
      setDropUp(window.innerHeight - bottom < 240);
    }
    setOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Tag pills + text input row */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex min-h-14 w-full cursor-text flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2 transition-colors
          ${
            open
              ? "border-(--color-primary)"
              : error
                ? "border-(--color-red)"
                : "border-(--color-black-shade-300)"
          }`}
      >
        {/* Selected tag pills */}
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full border border-(--color-primary) bg-(--color-primary-shade-100) px-3 py-1 text-sm font-medium text-(--color-primary)"
          >
            {tag}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                removeTag(tag);
              }}
              aria-label={`Remove ${tag}`}
              className="flex items-center justify-center opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            openDropdown();
          }}
          onFocus={openDropdown}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length > 0) addTag(filtered[0]);
              else if (canCreate) addTag(query);
            }
            if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
            if (e.key === "Backspace" && !query && value.length > 0) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-32 flex-1 bg-transparent py-1 text-[0.9375rem] font-medium text-(--color-black-shade-900) outline-none placeholder:text-(--color-black-shade-400)"
        />
      </div>

      {/* Suggestion dropdown — flips upward when near the viewport bottom */}
      {showDropdown && (
        <ul className={`absolute z-20 max-h-56 w-full overflow-auto rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.10)] ${dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}>
          {filtered.map((opt) => (
            <li
              key={opt}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(opt);
              }}
              className="mx-1.5 flex cursor-pointer items-center rounded-lg px-3.5 py-2.5 text-sm font-medium text-(--color-black-shade-800) hover:bg-(--color-black-shade-50)"
            >
              {opt}
            </li>
          ))}
          {canCreate && (
            <li
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(trimmed);
              }}
              className={`mx-1.5 flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium text-(--color-primary) hover:bg-(--color-black-shade-50) ${filtered.length > 0 ? "mt-0.5 border-t border-(--color-black-shade-100)" : ""}`}
            >
              + Add &ldquo;{trimmed}&rdquo;
            </li>
          )}
        </ul>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-(--color-red)">{error}</p>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { apiRequest } from "@/utilities/api";

const CATEGORY_PILL = {
  development: { bg: "var(--color-primary-shade-100)", color: "var(--color-primary)" },
  marketing:   { bg: "var(--color-secondary-shade-100)", color: "var(--color-secondary-shade-900)" },
  sales:       { bg: "#fef3c7", color: "#92400e" },
  design:      { bg: "#ede9fe", color: "#6d28d9" },
  consultancy: { bg: "#fee2e2", color: "#991b1b" },
};

function getCategoryStyle(category) {
  return CATEGORY_PILL[category] ?? { bg: "var(--color-black-shade-100)", color: "var(--color-black-shade-700)" };
}

function highlightMatch(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{ fontWeight: 600, color: "var(--color-primary)" }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  );
}

export function TemplateSearchInput({
  value,
  onChange,
  onSelect,
  onClear,
  placeholder = "Search templates…",
  apiEndpoint = "/job-templates/suggestions",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);
  const latestQueryRef = useRef("");

  const runFetch = useCallback(
    async (query) => {
      if (!query || query.length < 1) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      latestQueryRef.current = query;
      setLoading(true);
      try {
        const res = await apiRequest(
          `${apiEndpoint}?q=${encodeURIComponent(query)}`,
          {},
          { useCache: false }
        );
        if (latestQueryRef.current !== query) return;
        const items = res?.data ?? [];
        setSuggestions(items);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        if (latestQueryRef.current !== query) return;
        setSuggestions([]);
      } finally {
        if (latestQueryRef.current === query) setLoading(false);
      }
    },
    [apiEndpoint]
  );

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      onChange(val);
      clearTimeout(debounceRef.current);
      if (!val) {
        setSuggestions([]);
        setOpen(false);
        setLoading(false);
        return;
      }
      debounceRef.current = setTimeout(() => runFetch(val), 300);
    },
    [onChange, runFetch]
  );

  const handleSelect = useCallback(
    (item) => {
      onChange(item.title);
      onSelect?.(item);
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange, onSelect]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!open || suggestions.length === 0) {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        const target = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
        if (target) { e.preventDefault(); handleSelect(target); }
      } else if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    },
    [open, suggestions, activeIndex, handleSelect]
  );

  const handleClear = useCallback(() => {
    clearTimeout(debounceRef.current);
    setSuggestions([]);
    setOpen(false);
    setLoading(false);
    setActiveIndex(-1);
    onClear?.();
  }, [onClear]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex];
    item?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const showDropdown = open && suggestions.length > 0;
  const showNoResults = open && !loading && suggestions.length === 0 && (value?.length ?? 0) >= 1;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-48">
      {/* Input */}
      <div className="relative">
        {/* Search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--color-black-shade-400)"
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-(--color-black-shade-300) pl-9 pr-9 text-sm font-medium text-(--color-black-shade-900) outline-none transition-colors placeholder:text-(--color-black-shade-400) focus:border-(--color-primary)"
        />

        {/* Right side: spinner or clear button */}
        {loading ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-(--color-black-shade-400)" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-black-shade-400) hover:text-(--color-black-shade-700) cursor-pointer"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {(showDropdown || showNoResults) && (
        <div
          ref={listRef}
          className="absolute z-[300] top-full mt-1 w-full rounded-xl border border-(--color-black-shade-200) bg-(--pure-white) shadow-lg overflow-hidden"
          style={{ maxHeight: 280, overflowY: "auto" }}
        >
          {showNoResults ? (
            <div className="px-4 py-3 text-sm text-center text-(--color-black-shade-400)">
              No templates matching &quot;{value}&quot;
            </div>
          ) : (
            suggestions.map((item, idx) => {
              const catStyle = getCategoryStyle(item.category);
              return (
                <div
                  key={item.templateId ?? idx}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer transition-colors"
                  style={{
                    background: idx === activeIndex ? "var(--color-black-shade-50)" : undefined,
                  }}
                  onMouseLeave={() => {}}
                >
                  <span className="text-sm font-medium text-(--color-black-shade-900) truncate">
                    {highlightMatch(item.title, value)}
                  </span>
                  {item.category && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
                      style={{ background: catStyle.bg, color: catStyle.color }}
                    >
                      {item.category}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default TemplateSearchInput;

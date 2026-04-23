"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { Country } from "country-state-city";

const nameMap = Object.fromEntries(
  Country.getAllCountries().map((c) => [c.isoCode, c.name])
);

const COUNTRY_LIST = getCountries().map((isoCode) => ({
  isoCode,
  dialCode: `+${getCountryCallingCode(isoCode)}`,
  name: nameMap[isoCode] || isoCode,
}));

export default function CountryCodeSelect({
  value,
  onChange,
  valueType = "iso",
  height = "h-14",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropUp, setDropUp] = useState(false);

  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  const currentIso = useMemo(() => {
    if (!value) return null;
    if (valueType === "iso") return value;
    return COUNTRY_LIST.find((c) => c.dialCode === value)?.isoCode ?? null;
  }, [value, valueType]);

  const displayCode = currentIso
    ? `+${getCountryCallingCode(currentIso)}`
    : value || "+91";

  const filtered = useMemo(() => {
    if (!search) return COUNTRY_LIST;
    const s = search.toLowerCase().replace(/^\+/, "");
    return COUNTRY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.dialCode.replace("+", "").includes(s) ||
        c.isoCode.toLowerCase().includes(s)
    );
  }, [search]);

  const openDropdown = () => {
    if (wrapperRef.current) {
      const { bottom } = wrapperRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - bottom < 260);
    }
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) close();
    };
    const onKeyDown = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (country) => {
    onChange(valueType === "iso" ? country.isoCode : country.dialCode);
    close();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (open ? close() : openDropdown())}
        className={`${height} w-22 flex items-center justify-center gap-1 rounded-xl border bg-white px-3 text-[0.9375rem] font-medium outline-none transition-colors ${
          open
            ? "border-(--color-primary)"
            : "border-(--color-black-shade-300) hover:border-(--color-black-shade-400)"
        }`}
      >
        <span>{displayCode}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={`absolute left-0 z-50 w-64 overflow-hidden rounded-xl border border-(--color-black-shade-100) bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${dropUp ? "bottom-full mb-1.5" : "top-full mt-1"}`}>
          <div className="border-b border-(--color-black-shade-100) p-2">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code…"
              className="h-9 w-full rounded-lg border border-(--color-black-shade-200) px-3 text-sm outline-none focus:border-(--color-primary)"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1.5">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <li
                  key={c.isoCode}
                  onMouseDown={() => handleSelect(c)}
                  className={`mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    c.isoCode === currentIso
                      ? "bg-(--color-primary-shade-100) font-semibold text-(--color-primary)"
                      : "font-medium text-(--color-black-shade-800) hover:bg-(--color-black-shade-50)"
                  }`}
                >
                  <span className="w-10 shrink-0 font-mono text-xs">{c.dialCode}</span>
                  <span className="truncate">{c.name}</span>
                  {c.isoCode === currentIso && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto shrink-0" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-(--color-black-shade-400)">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

function toISO(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplay(isoStr) {
  // "2026-02-03" → "3 Feb 2026"
  const [y, m, d] = isoStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLast30Days() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(toISO(d));
  }
  return dates;
}

export default function DateSelector({ label = "Today", onSelect }) {
  const dates = getLast30Days();
  const [selected, setSelected] = useState(dates[0]);
  const [open, setOpen] = useState(false);

  const handleSelect = (isoStr) => {
    setSelected(isoStr);
    setOpen(false);
    onSelect?.(isoStr);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-14 text-(--color-black-shade-500) font-normal">
        {label}
      </span>
      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 h-10 px-4 rounded-lg border border-(--color-black-shade-200) bg-(--pure-white) text-14 text-black font-normal hover:border-(--color-black-shade-300) transition-colors cursor-pointer"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {formatDisplay(selected)}
          <svg
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute right-0 top-[calc(100%+0.25rem)] z-20 w-44 rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1 overflow-y-auto max-h-60"
          >
            {dates.map((iso) => (
              <li
                key={iso}
                role="option"
                aria-selected={iso === selected}
                onClick={() => handleSelect(iso)}
                className={`
                  px-4 py-2.5 text-14 cursor-pointer transition-colors
                  ${
                    iso === selected
                      ? "bg-(--color-primary-shade-100) text-(--color-primary) font-medium"
                      : "text-black hover:bg-(--color-black-shade-50)"
                  }
                `}
              >
                {formatDisplay(iso)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

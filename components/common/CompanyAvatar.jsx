"use client";

import { useState, useEffect } from "react";

// Full class strings kept here so Tailwind's content scanner includes them.
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-pink-500",
];

function getColorIndex(name) {
  if (!name) return -1;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
}

// xs is internal; exposed sizes are sm / md / lg.
const SIZE_CLASSES = {
  xs: { box: "w-5 h-5",   text: "text-xs" },
  sm: { box: "w-6 h-6",   text: "text-xs" },
  md: { box: "w-12 h-12", text: "text-xl" },
  lg: { box: "w-14 h-14", text: "text-xl" },
};

const API_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:5000/api/v1";

// Module-level icon cache — persists for the page session.
// Key: lowercased company name. Value: resolved iconUrl string | null | Promise.
const iconCache = new Map();

function getCompanyIcon(companyName) {
  const key = companyName.toLowerCase().trim();

  if (iconCache.has(key)) {
    const val = iconCache.get(key);
    return val instanceof Promise ? val : Promise.resolve(val);
  }

  const promise = fetch(
    `${API_BASE}/companies/icon?name=${encodeURIComponent(companyName)}`
  )
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const url = data.iconUrl ?? null;
      iconCache.set(key, url);
      return url;
    })
    .catch((e) => {
      console.warn("[CompanyAvatar] icon lookup failed:", e);
      iconCache.set(key, null);
      return null;
    });

  iconCache.set(key, promise);
  return promise;
}

/**
 * CompanyAvatar
 *
 * Renders a company icon from metadata when available; falls back to a
 * deterministic letter-based avatar. When `companyName` is empty/null,
 * renders a neutral gray box.
 *
 * Props:
 *   companyName  — string | null | undefined
 *   size         — "sm" | "md" | "lg"  (default "md")
 *   className    — additional Tailwind classes (e.g. rounding, positioning)
 */
export default function CompanyAvatar({ companyName, size = "md", className = "" }) {
  const { box, text } = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const letter = companyName?.trim()?.[0]?.toUpperCase() ?? null;
  const bgColor = letter
    ? AVATAR_COLORS[getColorIndex(companyName)]
    : "bg-(--color-black-shade-300)";

  const [iconUrl, setIconUrl] = useState(null);

  useEffect(() => {
    if (!companyName?.trim()) return;
    let cancelled = false;

    getCompanyIcon(companyName).then((url) => {
      if (!cancelled) setIconUrl(url);
    });

    return () => { cancelled = true; };
  }, [companyName]);

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={companyName}
        className={`${box} shrink-0 object-contain rounded ${className}`}
        style={{ background: "var(--card, #fff)" }}
        onError={() => setIconUrl(null)}
      />
    );
  }

  return (
    <div
      className={`${box} ${bgColor} shrink-0 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {letter && (
        <span className={`${text} font-bold text-white leading-none select-none`}>
          {letter}
        </span>
      )}
    </div>
  );
}

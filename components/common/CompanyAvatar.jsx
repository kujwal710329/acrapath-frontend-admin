"use client";

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

/**
 * CompanyAvatar
 *
 * Renders a deterministic letter-based avatar for a company.
 * When `companyName` is empty/null, renders a neutral gray box.
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

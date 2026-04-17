"use client";

const STATUS_CONFIG = {
  open: {
    label: "Open",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  "in-progress": {
    label: "In Progress",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  resolved: {
    label: "Resolved",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
  },
  closed: {
    label: "Closed",
    classes: "bg-(--color-black-shade-100) text-(--color-black-shade-500) border-(--color-black-shade-200)",
    dot: "bg-(--color-black-shade-400)",
  },
};

export default function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  const textSize = size === "md" ? "text-13 px-2.5 py-1" : "text-12 px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap ${textSize} ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

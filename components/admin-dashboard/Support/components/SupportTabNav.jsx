"use client";

const TABS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function SupportTabNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex items-center gap-1" aria-label="Filter tickets by status">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`h-8 px-3 rounded text-14 font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-(--color-primary) text-white"
                : "text-(--color-black-shade-600) hover:bg-(--color-black-shade-50) border border-(--color-black-shade-200)"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

"use client";

export const LIBRARY_TABS = [
  { key: "all", label: "All Books" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function LibraryTabNav({ activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {LIBRARY_TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded text-14 font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === tab.key
              ? "bg-(--color-primary-shade-100) text-(--color-primary)"
              : "text-(--color-black-shade-600) hover:bg-(--color-black-shade-50) hover:text-(--color-black-shade-800)"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

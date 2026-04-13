"use client";

export const PROFESSIONAL_TABS = [
  { key: "members", label: "Members" },
  { key: "requests", label: "Requests" },
  { key: "onHold", label: "On hold" },
  { key: "verificationPending", label: "Verification Pending" },
];

export default function ProfessionalsTabNav({ activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {PROFESSIONAL_TABS.map((tab) => (
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

"use client";

import { useState } from "react";
import { useMetadata, METADATA_TYPES, ARRAY_TYPES } from "@/hooks/useMetadata";
import ArrayTypeEditor from "./components/ArrayTypeEditor";
import ObjectTypeEditor from "./components/ObjectTypeEditor";
import SeedAllPanel from "./components/SeedAllPanel";

// ─── Human-readable labels & descriptions ─────────────────────────────────────

const TYPE_META = {
  jobCategories: {
    label: "Job Categories",
    description: "Top-level job category names shown in filters and forms.",
    kind: "array",
  },
  jobCategoryApiMap: {
    label: "Category API Map",
    description: "Maps each job category name to its internal API key string.",
    kind: "object",
  },
  jobRolesByCategory: {
    label: "Job Roles by Category",
    description: "Available job role options grouped under each job category.",
    kind: "object",
  },
  techSkillsByCategory: {
    label: "Tech Skills by Category",
    description: "Technical skill suggestions grouped under each job category.",
    kind: "object",
  },
  strategicSkillsByCategory: {
    label: "Strategic Skills by Category",
    description: "Soft/strategic skill suggestions grouped under each job category.",
    kind: "object",
  },
  commonJobRoles: {
    label: "Common Job Roles",
    description: "A flat list of common job roles used across the platform.",
    kind: "array",
  },
  fieldsOfStudy: {
    label: "Fields of Study",
    description: "Academic fields of study available for professional profiles.",
    kind: "array",
  },
  __seedAll: {
    label: "Seed All",
    description: "Bulk upsert all metadata types at once from a single JSON payload.",
    kind: "seed",
  },
};

const NAV_ITEMS = [
  ...METADATA_TYPES.map((t) => ({ key: t, ...TYPE_META[t] })),
  { key: "__seedAll", ...TYPE_META["__seedAll"] },
];

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function SidebarItem({ item, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item.key)}
      className={`w-full text-left px-4 py-3 border-b border-(--color-black-shade-100) text-14 font-semibold transition-colors duration-150 cursor-pointer ${
        isActive
          ? "bg-(--color-primary-shade-100) text-black"
          : "text-black hover:bg-(--color-black-shade-50)"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="block truncate">{item.label}</span>
      {item.kind === "seed" && (
        <span className="block text-11 font-normal text-(--color-black-shade-400) mt-0.5">
          bulk seed
        </span>
      )}
    </button>
  );
}

// ─── Content panel header ────────────────────────────────────────────────────

function PanelHeader({ item, onRefresh, loading }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-20 font-bold text-(--color-black-shade-900)">{item.label}</h2>
        <p className="text-14 text-(--color-black-shade-500) mt-1">{item.description}</p>
      </div>
      {item.kind !== "seed" && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-(--color-black-shade-200) text-13 font-medium text-(--color-black-shade-600) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={loading ? "animate-spin" : ""}
          >
            <path
              d="M12.5 7A5.5 5.5 0 1 1 7 1.5c1.52 0 2.9.62 3.9 1.6L13 1"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Refresh
        </button>
      )}
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorPanel({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-14 text-(--color-black-shade-500)">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-xl text-14 font-medium text-(--color-primary) border border-(--color-primary) hover:bg-(--color-primary-shade-100) transition-colors cursor-pointer"
      >
        Retry
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MetadataPage() {
  const [activeKey, setActiveKey] = useState(METADATA_TYPES[0]);

  const {
    allData,
    loading,
    error,
    refresh,
    addItem,
    removeItem,
    addItemToCategory,
    removeItemFromCategory,
    replaceAll,
    seedAll,
    isPending,
  } = useMetadata();

  const activeItem = TYPE_META[activeKey] ?? TYPE_META[METADATA_TYPES[0]];
  const activeValues = allData[activeKey];

  return (
    <div className="flex min-h-screen">
      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 border-r border-(--color-black-shade-100) flex flex-col">
        {/* Sidebar title */}
        <div className="px-4 py-4 border-b border-(--color-black-shade-100)">
          <p className="text-11 font-semibold text-(--color-black-shade-400) uppercase tracking-wider">
            Metadata Types
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.key}
              item={item}
              isActive={activeKey === item.key}
              onClick={setActiveKey}
            />
          ))}
        </nav>
      </aside>

      {/* ── Right content panel ───────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {/* Sticky panel header */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-(--pure-white) border-b border-(--color-black-shade-100)">
          <PanelHeader item={activeItem} onRefresh={refresh} loading={loading} />
        </div>

        <div className="px-6 py-6">
          {/* Global error */}
          {error && activeItem.kind !== "seed" ? (
            <ErrorPanel message={error} onRetry={refresh} />
          ) : activeItem.kind === "seed" ? (
            <SeedAllPanel isPending={isPending} onSeedAll={seedAll} />
          ) : ARRAY_TYPES.has(activeKey) ? (
            <ArrayTypeEditor
              type={activeKey}
              values={Array.isArray(activeValues) ? activeValues : []}
              loading={loading}
              isPending={isPending}
              onAdd={addItem}
              onRemove={removeItem}
              onReplaceAll={replaceAll}
            />
          ) : (
            <ObjectTypeEditor
              type={activeKey}
              values={activeValues && typeof activeValues === "object" ? activeValues : {}}
              loading={loading}
              isPending={isPending}
              onAddItemToCategory={addItemToCategory}
              onRemoveItemFromCategory={removeItemFromCategory}
              onReplaceAll={replaceAll}
            />
          )}
        </div>
      </div>
    </div>
  );
}

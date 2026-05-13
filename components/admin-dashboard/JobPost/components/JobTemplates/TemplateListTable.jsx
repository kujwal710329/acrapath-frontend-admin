"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import TemplatePreviewCard from "./TemplatePreviewCard";
import ConfirmModal from "@/components/common/ConfirmModal";

// ── Category labels & colours ─────────────────────────────────────────────────
const CATEGORY_COLORS = {
  development: "var(--color-primary)",
  marketing: "var(--color-secondary)",
  sales: "#f59e0b",
  design: "#8b5cf6",
  consultancy: "#ef4444",
};

const CATEGORY_LABELS = {
  development: "Development",
  marketing: "Marketing",
  sales: "Sales",
  design: "Design",
  consultancy: "Consultancy",
};

// ── Toggle switch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, loading = false, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled || loading}
      onClick={onChange}
      className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: checked ? "var(--color-primary)" : "var(--color-black-shade-300)" }}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-150"
        style={{ transform: checked ? "translateX(18px)" : "translateX(3px)" }}
      />
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-3 w-3 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
      )}
    </button>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-(--color-black-shade-100)">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4 border-r border-(--color-black-shade-100) last:border-r-0">
          <div className="h-4 rounded bg-(--color-black-shade-100)" />
        </td>
      ))}
    </tr>
  );
}

// ── Kebab menu ────────────────────────────────────────────────────────────────
function KebabMenu({ template, onEdit, onDuplicate, onToggleActive, onRequestDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-(--color-black-shade-500) transition-colors hover:bg-(--color-black-shade-100) hover:text-(--color-black-shade-900) cursor-pointer"
        aria-label="More actions"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-30 min-w-[180px] rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) py-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <button
            type="button"
            onClick={() => { onEdit(); close(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-(--color-black-shade-800) hover:bg-(--color-black-shade-50) cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>

          <button
            type="button"
            onClick={() => { onDuplicate(); close(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-(--color-black-shade-800) hover:bg-(--color-black-shade-50) cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Duplicate
          </button>

          <button
            type="button"
            onClick={() => { onToggleActive(); close(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-(--color-black-shade-800) hover:bg-(--color-black-shade-50) cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {template.isActive ? "Deactivate" : "Activate"}
          </button>

          <div className="my-1 border-t border-(--color-black-shade-100)" />

          <button
            type="button"
            onClick={() => { onRequestDelete(); close(); }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-(--color-red) hover:bg-red-50 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Column header with optional sort ─────────────────────────────────────────
function ColHeader({ children, sortKey, activeSort, onSort }) {
  const isActive = activeSort?.startsWith(sortKey ?? "__none__");
  const isDesc = isActive && activeSort?.endsWith("_desc");

  if (!sortKey) {
    return (
      <th className="px-4 py-3 text-left text-13 font-semibold text-(--color-black-shade-700) bg-(--pure-white) border-b border-(--color-black-shade-100) whitespace-nowrap">
        {children}
      </th>
    );
  }

  return (
    <th
      className="px-4 py-3 text-left text-13 font-semibold text-(--color-black-shade-700) bg-(--pure-white) border-b border-(--color-black-shade-100) whitespace-nowrap"
    >
      <button
        type="button"
        onClick={() => onSort(isActive && !isDesc ? `${sortKey}_desc` : `${sortKey}_asc`)}
        className="flex items-center gap-1 cursor-pointer hover:text-(--color-primary) transition-colors"
      >
        {children}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform ${isActive ? (isDesc ? "rotate-180" : "rotate-0") : "opacity-40"}`}
          style={{ color: isActive ? "var(--color-primary)" : undefined }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </th>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ pagination, onPageChange }) {
  const { currentPage, totalPages, totalCount } = pagination;
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-(--color-black-shade-100)">
      <p className="text-sm text-(--color-black-shade-500)">
        {totalCount} template{totalCount !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-black-shade-200) text-(--color-black-shade-600) disabled:opacity-40 hover:border-(--color-primary) hover:text-(--color-primary) transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span className="px-2 text-sm font-medium text-(--color-black-shade-700)">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-black-shade-200) text-(--color-black-shade-600) disabled:opacity-40 hover:border-(--color-primary) hover:text-(--color-primary) transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TemplateListTable({
  templates = [],
  loading = false,
  error = null,
  pagination,
  activeSort,
  onSort,
  onPageChange,
  onEdit,
  onToggleFeatured,
  onTogglePopular,
  onToggleActive,
  onDelete,
  onDuplicate,
  onCreateFirst,
  toggleLoadingIds = new Set(),
}) {
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handlePreview = useCallback((t) => setPreviewTemplate(t), []);
  const closePreview = useCallback(() => setPreviewTemplate(null), []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTargetId) onDelete(deleteTargetId);
    setDeleteTargetId(null);
  }, [deleteTargetId, onDelete]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-(--color-black-shade-100)">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <ColHeader sortKey="title" activeSort={activeSort} onSort={onSort}>Template</ColHeader>
                <ColHeader>Category</ColHeader>
                <ColHeader>Status</ColHeader>
                <ColHeader>Featured</ColHeader>
                <ColHeader>Popular</ColHeader>
                <ColHeader sortKey="used" activeSort={activeSort} onSort={onSort}>Used</ColHeader>
                <ColHeader>Actions</ColHeader>
              </tr>
            </thead>

            <tbody>
              {loading && templates.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-(--color-red)">
                    {error}
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-base font-medium text-(--color-black-shade-700) mb-1">
                      No templates yet
                    </p>
                    <p className="text-sm text-(--color-black-shade-400) mb-4">
                      Create your first job post template for employers to use
                    </p>
                    {onCreateFirst && (
                      <button
                        type="button"
                        onClick={onCreateFirst}
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
                        style={{ background: "var(--color-primary)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create first template
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-(--color-black-shade-100) transition-colors hover:bg-(--color-black-shade-50) last:border-b-0"
                  >
                    {/* Template column */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="font-medium text-sm text-(--color-black-shade-900) truncate">{t.title}</p>
                      {t.description && (
                        <p className="mt-0.5 text-xs text-(--color-black-shade-500) line-clamp-1">{t.description}</p>
                      )}
                      {t.previewTags?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {t.previewTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                              style={{ background: "var(--color-primary-shade-100)", color: "var(--color-primary)" }}
                            >
                              {tag}
                            </span>
                          ))}
                          {t.previewTags.length > 3 && (
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-medium text-(--color-black-shade-500)">
                              +{t.previewTags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Category column */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: CATEGORY_COLORS[t.category] ?? "var(--color-black-shade-400)" }}
                        />
                        <span className="text-sm text-(--color-black-shade-800)">
                          {CATEGORY_LABELS[t.category] ?? t.category ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Status column */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: t.isActive ? "var(--color-secondary)" : "var(--color-black-shade-400)" }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: t.isActive ? "var(--color-secondary-shade-900)" : "var(--color-black-shade-500)" }}
                        >
                          {t.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-4 py-3.5">
                      <ToggleSwitch
                        checked={!!t.isFeatured}
                        loading={toggleLoadingIds.has(`featured_${t._id}`)}
                        onChange={() => onToggleFeatured(t._id)}
                      />
                    </td>

                    {/* Popular toggle */}
                    <td className="px-4 py-3.5">
                      <ToggleSwitch
                        checked={!!t.isPopular}
                        loading={toggleLoadingIds.has(`popular_${t._id}`)}
                        onChange={() => onTogglePopular(t._id)}
                      />
                    </td>

                    {/* Used column */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-(--color-black-shade-700)">
                        {t.usageCount ?? 0} time{t.usageCount !== 1 ? "s" : ""}
                      </span>
                    </td>

                    {/* Actions column */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePreview(t)}
                          className="rounded-lg border border-(--color-black-shade-200) px-2.5 py-1 text-xs font-medium text-(--color-black-shade-700) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(t)}
                          className="rounded-lg border border-(--color-black-shade-200) px-2.5 py-1 text-xs font-medium text-(--color-black-shade-700) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <KebabMenu
                          template={t}
                          onEdit={() => onEdit(t)}
                          onDuplicate={() => onDuplicate(t._id)}
                          onToggleActive={() => onToggleActive(t._id)}
                          onRequestDelete={() => setDeleteTargetId(t._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <TemplatePreviewCard template={previewTemplate} onClose={closePreview} />
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Template"
        description="This will permanently delete the template. Employers will no longer be able to use it."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}

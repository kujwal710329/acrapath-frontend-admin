"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAdminTemplates } from "@/hooks/useAdminTemplates";
import TemplateListTable from "./TemplateListTable";
import TemplateFormDrawer from "./TemplateFormDrawer";
import TemplateSearchInput from "./TemplateSearchInput";

// ── Category labels ───────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  development: "Development",
  marketing: "Marketing",
  sales: "Sales",
  design: "Design",
  consultancy: "Consultancy",
};

// ── Stats card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) px-5 py-4">
      <p className="text-xs font-medium text-(--color-black-shade-500)">{label}</p>
      <p
        className="text-2xl font-bold"
        style={{ color: color ?? "var(--color-black-shade-900)" }}
      >
        {value ?? 0}
      </p>
    </div>
  );
}

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function JobTemplatesAdminPage() {
  const {
    templates,
    categories,
    loading,
    submitting,
    error,
    pagination,
    stats,
    loadTemplates,
    refreshTemplates,
    loadCategories,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleFeatured,
    togglePopular,
    toggleActive,
    duplicateTemplate,
  } = useAdminTemplates();

  // ── Filters ───────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("created_desc");
  const debouncedSearch = useDebounce(searchInput, 300);

  // ── Drawer state ──────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null); // null = create mode

  // ── Toggle loading tracking (per-cell spinner) ────────────────────────────
  const [toggleLoadingIds, setToggleLoadingIds] = useState(new Set());

  const addToggleLoading = (key) =>
    setToggleLoadingIds((prev) => new Set([...prev, key]));
  const removeToggleLoading = (key) =>
    setToggleLoadingIds((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadTemplates({ page: 1 });
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch when filters change ──────────────────────────────────────────
  useEffect(() => {
    loadTemplates({
      q: debouncedSearch,
      category: categoryFilter,
      status: statusFilter,
      sort,
      page: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryFilter, statusFilter, sort]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const handlePageChange = useCallback(
    (page) => {
      loadTemplates({ page });
    },
    [loadTemplates]
  );

  // ── Sort ──────────────────────────────────────────────────────────────────
  const handleSort = useCallback(
    (newSort) => {
      setSort(newSort);
    },
    []
  );

  // ── Open drawer ───────────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingTemplate(null);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback(
    async (template) => {
      // Fetch full template data for admin (no usage increment)
      const full = await getTemplateById(template._id);
      setEditingTemplate(full ?? template);
      setDrawerOpen(true);
    },
    [getTemplateById]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingTemplate(null);
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (data) => {
      if (editingTemplate) {
        return updateTemplate(editingTemplate._id, data);
      }
      return createTemplate(data);
    },
    [editingTemplate, createTemplate, updateTemplate]
  );

  // ── Toggle Featured ───────────────────────────────────────────────────────
  const handleToggleFeatured = useCallback(
    async (id) => {
      const key = `featured_${id}`;
      addToggleLoading(key);
      await toggleFeatured(id);
      removeToggleLoading(key);
    },
    [toggleFeatured]
  );

  // ── Toggle Popular ────────────────────────────────────────────────────────
  const handleTogglePopular = useCallback(
    async (id) => {
      const key = `popular_${id}`;
      addToggleLoading(key);
      await togglePopular(id);
      removeToggleLoading(key);
    },
    [togglePopular]
  );

  // ── Toggle Active ─────────────────────────────────────────────────────────
  const handleToggleActive = useCallback((id) => toggleActive(id), [toggleActive]);

  // ── Delete (soft) ─────────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => deleteTemplate(id), [deleteTemplate]);

  // ── Duplicate ─────────────────────────────────────────────────────────────
  const handleDuplicate = useCallback((id) => duplicateTemplate(id), [duplicateTemplate]);

  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-(--color-black-shade-900)">Job Templates</h1>
          <p className="mt-0.5 text-sm text-(--color-black-shade-500)">
            Manage pre-built job templates that employers can use to fill job posts faster
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 h-10 rounded-xl px-5 text-sm font-semibold text-white transition-colors cursor-pointer flex-shrink-0 hover:opacity-90"
          style={{ background: "var(--color-primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Template
        </button>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Templates" value={stats.total} />
        <StatCard label="Active" value={stats.active} color="var(--color-secondary-shade-900)" />
        <StatCard label="Featured" value={stats.featured} color="#d97706" />
        <StatCard label="Total Used" value={stats.totalUsed} color="var(--color-primary)" />
      </div>

      {/* ── Filter row ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search with live suggestion dropdown */}
        <TemplateSearchInput
          value={searchInput}
          onChange={(val) => setSearchInput(val)}
          onSelect={(template) => {
            setSearchInput(template.title);
          }}
          onClear={() => {
            setSearchInput("");
          }}
          placeholder="Search templates…"
          apiEndpoint="/job-templates/suggestions"
        />

        {/* Category dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-xl border border-(--color-black-shade-300) px-3 text-sm font-medium text-(--color-black-shade-800) outline-none transition-colors focus:border-(--color-primary) cursor-pointer bg-(--pure-white)"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Status dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-(--color-black-shade-300) px-3 text-sm font-medium text-(--color-black-shade-800) outline-none transition-colors focus:border-(--color-primary) cursor-pointer bg-(--pure-white)"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Refresh */}
        <button
          type="button"
          onClick={refreshTemplates}
          disabled={loading}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-(--color-black-shade-300) text-(--color-black-shade-600) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Refresh"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={loading ? "animate-spin" : ""}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <TemplateListTable
        templates={templates}
        loading={loading}
        error={error}
        pagination={pagination}
        activeSort={sort}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onEdit={openEdit}
        onToggleFeatured={handleToggleFeatured}
        onTogglePopular={handleTogglePopular}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onCreateFirst={openCreate}
        toggleLoadingIds={toggleLoadingIds}
      />

      {/* ── Drawer ────────────────────────────────────────────────────────── */}
      {drawerOpen && (
        <TemplateFormDrawer
          template={editingTemplate}
          onClose={closeDrawer}
          onSave={handleSave}
          submitting={submitting}
        />
      )}
    </div>
  );
}

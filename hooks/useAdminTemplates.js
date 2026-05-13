"use client";

import { useState, useCallback, useRef } from "react";
import {
  fetchTemplates,
  fetchTemplateCategories,
  fetchTemplateByIdAdmin,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateFeatured,
  toggleTemplatePopular,
  toggleTemplateActive,
} from "@/services/jobTemplate.service";
import { logger } from "@/utilities/logger";
import { showSuccess, showError } from "@/utilities/toast";

const DEFAULT_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const DEFAULT_STATS = {
  total: 0,
  active: 0,
  featured: 0,
  totalUsed: 0,
};

/**
 * useAdminTemplates — all state and API calls for the admin Templates tab.
 *
 * Exposes:
 *   templates, categories, loading, submitting, error,
 *   pagination, stats,
 *   fetchTemplates, fetchCategories, fetchTemplateById,
 *   createTemplate, updateTemplate, deleteTemplate,
 *   toggleFeatured, togglePopular, toggleActive, duplicateTemplate
 */
export function useAdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [stats, setStats] = useState(DEFAULT_STATS);

  // Track latest filters so refresh() always uses them
  const currentFiltersRef = useRef({ category: "", q: "", status: "", sort: "", page: 1 });
  const reqIdRef = useRef(0);

  // ── List ──────────────────────────────────────────────────────────────────

  const loadTemplates = useCallback(async (filters = {}) => {
    const id = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    currentFiltersRef.current = { ...currentFiltersRef.current, ...filters };

    try {
      const res = await fetchTemplates(currentFiltersRef.current);
      if (reqIdRef.current !== id) return;

      const { templates: rows = [], pagination: pag = {}, stats: st = {} } =
        res?.data ?? {};

      setTemplates(rows);
      setPagination({
        currentPage: pag.currentPage ?? 1,
        totalPages: pag.totalPages ?? 1,
        totalCount: pag.totalCount ?? 0,
        hasNextPage: pag.hasNextPage ?? false,
        hasPrevPage: pag.hasPrevPage ?? false,
      });
      setStats({
        total: st.total ?? 0,
        active: st.active ?? 0,
        featured: st.featured ?? 0,
        totalUsed: st.totalUsed ?? 0,
      });

      logger.debug("[useAdminTemplates] loaded", { count: rows.length });
    } catch (err) {
      if (reqIdRef.current !== id) return;
      logger.error("[useAdminTemplates] load error", { error: err.message });
      setError(err.message || "Failed to load templates");
      setTemplates([]);
    } finally {
      if (reqIdRef.current === id) setLoading(false);
    }
  }, []);

  const refreshTemplates = useCallback(() => {
    loadTemplates(currentFiltersRef.current);
  }, [loadTemplates]);

  // ── Categories ────────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetchTemplateCategories();
      setCategories(res?.data ?? []);
    } catch (err) {
      logger.error("[useAdminTemplates] categories error", { error: err.message });
    }
  }, []);

  // ── Single template (for drawer) ──────────────────────────────────────────

  const getTemplateById = useCallback(async (id) => {
    try {
      const res = await fetchTemplateByIdAdmin(id);
      return res?.data ?? null;
    } catch (err) {
      logger.error("[useAdminTemplates] getById error", { id, error: err.message });
      return null;
    }
  }, []);

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreateTemplate = useCallback(
    async (data) => {
      setSubmitting(true);
      try {
        const res = await createTemplate(data);
        showSuccess("Template created successfully");
        logger.debug("[useAdminTemplates] created", { id: res?.data?._id });
        refreshTemplates();
        return { success: true, data: res?.data };
      } catch (err) {
        logger.error("[useAdminTemplates] create error", { error: err.message });
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [refreshTemplates]
  );

  // ── Update ────────────────────────────────────────────────────────────────

  const handleUpdateTemplate = useCallback(
    async (id, data) => {
      setSubmitting(true);
      try {
        const res = await updateTemplate(id, data);
        showSuccess("Template updated successfully");
        logger.debug("[useAdminTemplates] updated", { id });
        refreshTemplates();
        return { success: true, data: res?.data };
      } catch (err) {
        logger.error("[useAdminTemplates] update error", { id, error: err.message });
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [refreshTemplates]
  );

  // ── Delete (soft) ─────────────────────────────────────────────────────────

  const handleDeleteTemplate = useCallback(
    async (id) => {
      // Optimistic removal from list and stats
      setTemplates((prev) => {
        const removed = prev.find((t) => t._id === id);
        if (removed) {
          setStats((s) => ({
            ...s,
            total: Math.max(0, s.total - 1),
            active: removed.isActive ? Math.max(0, s.active - 1) : s.active,
            featured: removed.isFeatured ? Math.max(0, s.featured - 1) : s.featured,
            totalUsed: Math.max(0, s.totalUsed - (removed.usageCount ?? 0)),
          }));
        }
        return prev.filter((t) => t._id !== id);
      });
      try {
        await deleteTemplate(id);
        showSuccess("Template deleted successfully");
        logger.debug("[useAdminTemplates] deleted", { id });
      } catch (err) {
        logger.error("[useAdminTemplates] delete error", { id, error: err.message });
        showError("Failed to delete template");
        refreshTemplates(); // restore accurate state on error only
      }
    },
    [refreshTemplates]
  );

  // ── Toggle Featured ───────────────────────────────────────────────────────

  const handleToggleFeatured = useCallback(
    async (id) => {
      // Optimistic flip
      setTemplates((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isFeatured: !t.isFeatured } : t))
      );
      try {
        const res = await toggleTemplateFeatured(id);
        // Sync with server truth
        setTemplates((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isFeatured: res?.data?.isFeatured } : t))
        );
        logger.debug("[useAdminTemplates] featured toggled", { id });
      } catch (err) {
        logger.error("[useAdminTemplates] toggle featured error", { id, error: err.message });
        refreshTemplates();
      }
    },
    [refreshTemplates]
  );

  // ── Toggle Popular ────────────────────────────────────────────────────────

  const handleTogglePopular = useCallback(
    async (id) => {
      setTemplates((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isPopular: !t.isPopular } : t))
      );
      try {
        const res = await toggleTemplatePopular(id);
        setTemplates((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isPopular: res?.data?.isPopular } : t))
        );
        logger.debug("[useAdminTemplates] popular toggled", { id });
      } catch (err) {
        logger.error("[useAdminTemplates] toggle popular error", { id, error: err.message });
        refreshTemplates();
      }
    },
    [refreshTemplates]
  );

  // ── Toggle Active ─────────────────────────────────────────────────────────

  const handleToggleActive = useCallback(
    async (id) => {
      setTemplates((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isActive: !t.isActive } : t))
      );
      try {
        const res = await toggleTemplateActive(id);
        setTemplates((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isActive: res?.data?.isActive } : t))
        );
        logger.debug("[useAdminTemplates] active toggled", { id });
      } catch (err) {
        logger.error("[useAdminTemplates] toggle active error", { id, error: err.message });
        refreshTemplates();
      }
    },
    [refreshTemplates]
  );

  // ── Duplicate ─────────────────────────────────────────────────────────────

  const handleDuplicateTemplate = useCallback(
    async (id) => {
      try {
        const original = await fetchTemplateByIdAdmin(id);
        if (!original?.data) throw new Error("Template not found");

        const { _id, __v, templateId, createdAt, updatedAt, createdBy, updatedBy, usageCount, ...rest } =
          original.data;

        const duplicate = {
          ...rest,
          title: `Copy of ${rest.title}`,
          isActive: false,
          isFeatured: false,
          isPopular: false,
        };

        const res = await createTemplate(duplicate);
        showSuccess("Template duplicated — saved as draft");
        logger.debug("[useAdminTemplates] duplicated", { sourceId: id, newId: res?.data?._id });
        refreshTemplates();
        return { success: true, data: res?.data };
      } catch (err) {
        logger.error("[useAdminTemplates] duplicate error", { id, error: err.message });
        showError("Failed to duplicate template");
        return { success: false, error: err.message };
      }
    },
    [refreshTemplates]
  );

  return {
    // State
    templates,
    categories,
    loading,
    submitting,
    error,
    pagination,
    stats,
    // Actions
    loadTemplates,
    refreshTemplates,
    loadCategories,
    getTemplateById,
    createTemplate: handleCreateTemplate,
    updateTemplate: handleUpdateTemplate,
    deleteTemplate: handleDeleteTemplate,
    toggleFeatured: handleToggleFeatured,
    togglePopular: handleTogglePopular,
    toggleActive: handleToggleActive,
    duplicateTemplate: handleDuplicateTemplate,
  };
}

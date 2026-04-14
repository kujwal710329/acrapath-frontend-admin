"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchAllTestimonials,
  fetchFeaturedTestimonials,
  toggleFeaturedStatus,
  adminDeleteTestimonial,
  adminCreateTestimonial,
} from "@/services/testimonials.service";
import { DEBOUNCE_CONFIG } from "@/utilities/config";
import { logger } from "@/utilities/logger";
import { showSuccess, showError } from "@/utilities/toast";

const DEFAULT_PAGINATION = {
  page: 1,
  totalPages: 1,
  totalCount: 0,
  hasPrevPage: false,
  hasNextPage: false,
};

/**
 * Manages fetching, pagination, search, toggle-featured, and delete
 * for the Testimonials admin section.
 */
export function useTestimonials({ tab, perPage }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Incremented on each new request — lets us discard stale responses
  const reqIdRef = useRef(0);
  // Keeps current page/search accessible from stable callbacks
  const curRef = useRef({ page: 1, search: "" });
  const debounceRef = useRef(null);

  const load = useCallback(
    async (nextPage, nextSearch) => {
      const id = ++reqIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const result =
          tab === "featured"
            ? await fetchFeaturedTestimonials({ page: nextPage, limit: perPage })
            : await fetchAllTestimonials({ page: nextPage, limit: perPage, search: nextSearch });

        if (reqIdRef.current !== id) return; // stale — discard

        setRows(result?.data ?? []);
        setPagination({
          page: result?.page ?? result?.pagination?.page ?? nextPage,
          totalPages: result?.totalPages ?? result?.pagination?.totalPages ?? 1,
          totalCount: result?.total ?? result?.totalCount ?? result?.count ?? 0,
          hasPrevPage: result?.hasPrevPage ?? result?.pagination?.hasPrevPage ?? false,
          hasNextPage: result?.hasNextPage ?? result?.pagination?.hasNextPage ?? false,
        });
        logger.debug("[useTestimonials] loaded", {
          count: result?.data?.length,
          tab,
          page: nextPage,
        });
      } catch (err) {
        if (reqIdRef.current !== id) return;
        // apiRequest already showed a toast; just record error for the table UI
        logger.error("[useTestimonials] load error", { error: err.message });
        setError(err.message || "Failed to load testimonials");
        setRows([]);
      } finally {
        if (reqIdRef.current === id) setLoading(false);
      }
    },
    [tab, perPage]
  );

  // Reset + reload whenever tab or perPage changes
  useEffect(() => {
    curRef.current = { page: 1, search: "" };
    setPage(1);
    setSearch("");
    clearTimeout(debounceRef.current);
    load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, perPage]); // `load` is intentionally excluded — it changes with tab/perPage anyway

  // Refresh event listener
  useEffect(() => {
    const handleRefresh = () => load(curRef.current.page, curRef.current.search);
    window.addEventListener("admin-refresh", handleRefresh);
    return () => window.removeEventListener("admin-refresh", handleRefresh);
  }, [load]);

  const goToPage = useCallback(
    (nextPage) => {
      curRef.current.page = nextPage;
      setPage(nextPage);
      load(nextPage, curRef.current.search);
    },
    [load]
  );

  const handleSearch = useCallback(
    (query) => {
      curRef.current.search = query;
      setSearch(query);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        curRef.current.page = 1;
        setPage(1);
        load(1, query);
      }, DEBOUNCE_CONFIG.SEARCH_DELAY ?? 500);
    },
    [load]
  );

  const refresh = useCallback(() => {
    load(curRef.current.page, curRef.current.search);
  }, [load]);

  /**
   * Optimistically flip isFeatured; reconcile from API response on success,
   * rollback + showError on failure.
   */
  const toggleFeatured = useCallback(
    async (testimonialId) => {
      // Snapshot previous rows for potential rollback
      let previousRows;
      setRows((prev) => {
        previousRows = prev;
        return prev.map((r) =>
          r._id === testimonialId ? { ...r, isFeatured: !r.isFeatured } : r
        );
      });

      try {
        const result = await toggleFeaturedStatus(testimonialId);
        // Reconcile with actual server state
        const serverValue = result?.data?.isFeatured;
        if (serverValue !== undefined) {
          setRows((prev) =>
            prev.map((r) =>
              r._id === testimonialId ? { ...r, isFeatured: serverValue } : r
            )
          );
        }
        showSuccess(result?.message ?? "Featured status updated");
        logger.debug("[useTestimonials] featured toggled", { testimonialId });
      } catch (err) {
        // Rollback
        setRows(previousRows);
        showError(err.message || "Failed to update featured status");
        logger.error("[useTestimonials] toggle featured failed", { error: err.message });
      }
    },
    []
  );

  /**
   * Create a new testimonial; reload the list on success.
   * Returns the created testimonial data so the caller can close the modal.
   */
  const createTestimonial = useCallback(
    async (formData) => {
      const result = await adminCreateTestimonial(formData);
      showSuccess(result?.message ?? "Testimonial created successfully.");
      logger.debug("[useTestimonials] testimonial created", { id: result?.data?._id });
      // Reload current page so the new row appears
      load(curRef.current.page, curRef.current.search);
      return result;
    },
    [load]
  );

  /**
   * Optimistically remove row; rollback + showError on failure.
   */
  const deleteTestimonial = useCallback(
    async (testimonialId) => {
      // Snapshot previous rows for potential rollback
      let previousRows;
      setRows((prev) => {
        previousRows = prev;
        return prev.filter((r) => r._id !== testimonialId);
      });

      try {
        await adminDeleteTestimonial(testimonialId);
        showSuccess("Testimonial deleted.");
        logger.debug("[useTestimonials] testimonial deleted", { testimonialId });
      } catch (err) {
        // Rollback
        setRows(previousRows);
        showError(err.message || "Failed to delete testimonial");
        logger.error("[useTestimonials] delete failed", { error: err.message });
      }
    },
    []
  );

  return {
    rows,
    pagination,
    loading,
    error,
    page,
    search,
    goToPage,
    handleSearch,
    refresh,
    toggleFeatured,
    deleteTestimonial,
    createTestimonial,
  };
}

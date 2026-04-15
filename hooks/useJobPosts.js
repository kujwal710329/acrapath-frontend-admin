"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchJobPosts, updateJobPostStatus, toggleDreamjob as toggleDreamjobService } from "@/services/jobPost.service";
import { DEBOUNCE_CONFIG } from "@/utilities/config";
import { logger } from "@/utilities/logger";
import { showSuccess } from "@/utilities/toast";

const DEFAULT_PAGINATION = {
  page: 1,
  totalPages: 1,
  totalCount: 0,
  hasPrevPage: false,
  hasNextPage: false,
};

/**
 * Manages fetching, pagination, search, and status updates
 * for the Job Post admin section.
 */
export function useJobPosts({ tab, perPage }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const reqIdRef = useRef(0);
  const curRef = useRef({ page: 1, search: "" });
  const debounceRef = useRef(null);

  const load = useCallback(
    async (nextPage, nextSearch) => {
      const id = ++reqIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const result = await fetchJobPosts({
          tab,
          page: nextPage,
          limit: perPage,
          search: nextSearch,
        });

        if (reqIdRef.current !== id) return;

        setRows(result?.data ?? []);
        setPagination({
          page: result?.page ?? nextPage,
          totalPages: result?.totalPages ?? 1,
          totalCount: result?.totalCount ?? 0,
          hasPrevPage: result?.hasPrevPage ?? false,
          hasNextPage: result?.hasNextPage ?? false,
        });
        logger.debug("[useJobPosts] loaded", {
          count: result?.data?.length,
          tab,
          page: nextPage,
        });
      } catch (err) {
        if (reqIdRef.current !== id) return;
        logger.error("[useJobPosts] load error", { error: err.message });
        setError(err.message || "Failed to load job posts");
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
  }, [tab, perPage]);

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

  const updateStatus = useCallback(
    async (jobId, status) => {
      setRows((prev) =>
        prev.map((r) => (r.jobId === jobId ? { ...r, status } : r))
      );
      try {
        await updateJobPostStatus(jobId, status);
        showSuccess("Status updated successfully");
        logger.debug("[useJobPosts] status updated", { jobId, status });
      } catch (err) {
        logger.error("[useJobPosts] status update failed", {
          error: err.message,
        });
        load(curRef.current.page, curRef.current.search);
      }
    },
    [load]
  );

  /**
   * Optimistically toggle a row's dreamjob flag; roll back on API failure.
   */
  const toggleDreamjob = useCallback(
    async (jobId) => {
      // Optimistic flip
      setRows((prev) =>
        prev.map((r) => (r.jobId === jobId ? { ...r, dreamjob: !r.dreamjob } : r))
      );
      try {
        const result = await toggleDreamjobService(jobId);
        showSuccess(result?.message ?? "Top status updated successfully");
        logger.debug("[useJobPosts] dreamjob toggled", { jobId });
      } catch (err) {
        // apiRequest already showed a toast — reload accurate state
        logger.error("[useJobPosts] dreamjob toggle failed", { error: err.message });
        load(curRef.current.page, curRef.current.search);
      }
    },
    [load]
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
    updateStatus,
    toggleDreamjob,
  };
}

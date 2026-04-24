"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchProfessionals,
  fetchAllEmployees,
  updateVerificationStatus,
  toggleTopProfessionalStatus,
  adminDeleteProfessional,
} from "@/services/professionals.service";
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
 * for the Professionals admin section.
 */
export function useProfessionals({ tab, perPage }) {
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
          tab === "topVerified"
            ? await fetchAllEmployees({ page: nextPage, limit: perPage, search: nextSearch })
            : await fetchProfessionals({ tab, page: nextPage, limit: perPage, search: nextSearch });

        if (reqIdRef.current !== id) return; // stale — discard

        setRows(result?.data ?? []);
        setPagination({
          page: result?.page ?? nextPage,
          totalPages: result?.totalPages ?? 1,
          totalCount: result?.totalCount ?? 0,
          hasPrevPage: result?.hasPrevPage ?? false,
          hasNextPage: result?.hasNextPage ?? false,
        });
        logger.debug("[useProfessionals] loaded", {
          count: result?.data?.length,
          tab,
          page: nextPage,
        });
      } catch (err) {
        if (reqIdRef.current !== id) return;
        // apiRequest already showed a toast; just record error for the table UI
        logger.error("[useProfessionals] load error", { error: err.message });
        setError(err.message || "Failed to load professionals");
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
   * Optimistically update a row's status; roll back + reload on API failure.
   */
  const updateStatus = useCallback(
    async (userId, status) => {
      // Optimistic update
      setRows((prev) =>
        prev.map((r) =>
          r.id === userId ? { ...r, profileVerificationStatus: status } : r
        )
      );
      try {
        const result = await updateVerificationStatus(userId, status);
        // If backend returned a professionalId (e.g. on first verification), persist it
        if (result?.data?.professionalId) {
          setRows((prev) =>
            prev.map((r) =>
              r.id === userId
                ? { ...r, professionalId: result.data.professionalId }
                : r
            )
          );
        }
        showSuccess("Status updated successfully");
        logger.debug("[useProfessionals] status updated", { userId, status });
      } catch (err) {
        // apiRequest already showed a toast — just reload accurate state
        logger.error("[useProfessionals] status update failed", {
          error: err.message,
        });
        load(curRef.current.page, curRef.current.search);
      }
    },
    [load]
  );

  /**
   * Optimistically toggle a row's isTopProfessional; reconcile from API response.
   */
  const toggleTopProfessional = useCallback(
    async (userId) => {
      // Optimistic flip
      setRows((prev) =>
        prev.map((r) =>
          (r.sfUserId ?? r.id) === userId
            ? { ...r, isTopProfessional: !r.isTopProfessional }
            : r
        )
      );
      try {
        const result = await toggleTopProfessionalStatus(userId);
        // Reconcile with actual server state from response
        const serverValue = result?.data?.isTopProfessional;
        if (serverValue !== undefined) {
          setRows((prev) =>
            prev.map((r) =>
              (r.sfUserId ?? r.id) === userId
                ? { ...r, isTopProfessional: serverValue }
                : r
            )
          );
        }
        showSuccess(result?.message ?? "Top status updated successfully");
        logger.debug("[useProfessionals] top status toggled", { userId });
      } catch (err) {
        // apiRequest already showed a toast — reload accurate state
        logger.error("[useProfessionals] top status toggle failed", { error: err.message });
        load(curRef.current.page, curRef.current.search);
      }
    },
    [load]
  );

  /**
   * Optimistically remove a row; roll back on API failure.
   */
  const deleteProfessional = useCallback(
    async (userId) => {
      setRows((prev) => prev.filter((r) => r.id !== userId));
      try {
        await adminDeleteProfessional(userId);
        showSuccess("Professional deleted successfully");
        logger.debug("[useProfessionals] professional deleted", { userId });
      } catch (err) {
        logger.error("[useProfessionals] delete failed", { error: err.message });
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
    toggleTopProfessional,
    deleteProfessional,
  };
}

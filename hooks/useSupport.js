"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchAllTickets,
  fetchTicketById,
  addAdminReply,
  updateTicketStatus,
} from "@/services/support.service";
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
 * Manages fetching, pagination, status filter, reply submission,
 * and status updates for the Support admin section.
 */
export function useSupport({ statusFilter = "", perPage = 20 } = {}) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Stale-response guard
  const reqIdRef = useRef(0);
  // Stable ref to current page so callbacks don't capture stale closures
  const curRef = useRef({ page: 1 });

  const load = useCallback(
    async (nextPage) => {
      const id = ++reqIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAllTickets({
          page: nextPage,
          limit: perPage,
          status: statusFilter,
        });

        if (reqIdRef.current !== id) return; // stale — discard

        setRows(result?.data ?? []);
        setPagination({
          page: result?.pagination?.page ?? nextPage,
          totalPages: result?.pagination?.totalPages ?? 1,
          totalCount: result?.pagination?.total ?? 0,
          hasPrevPage: result?.pagination?.hasPrevPage ?? false,
          hasNextPage: result?.pagination?.hasNextPage ?? false,
        });
        logger.debug("[useSupport] loaded", {
          count: result?.data?.length,
          statusFilter,
          page: nextPage,
        });
      } catch (err) {
        if (reqIdRef.current !== id) return;
        logger.error("[useSupport] load error", { error: err.message });
        setError(err.message || "Failed to load tickets");
        setRows([]);
      } finally {
        if (reqIdRef.current === id) setLoading(false);
      }
    },
    [statusFilter, perPage]
  );

  // Reset + reload on filter or perPage change
  useEffect(() => {
    curRef.current = { page: 1 };
    setPage(1);
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, perPage]);

  // Refresh event listener (dispatched by toolbar Refresh button)
  useEffect(() => {
    const handleRefresh = () => load(curRef.current.page);
    window.addEventListener("admin-refresh", handleRefresh);
    return () => window.removeEventListener("admin-refresh", handleRefresh);
  }, [load]);

  const goToPage = useCallback(
    (nextPage) => {
      curRef.current.page = nextPage;
      setPage(nextPage);
      load(nextPage);
    },
    [load]
  );

  const refresh = useCallback(() => {
    load(curRef.current.page);
  }, [load]);

  /**
   * Fetch a single ticket with full replies for the detail panel.
   * Returns the ticket object (does not affect list state).
   */
  const loadTicket = useCallback(async (ticketId) => {
    const result = await fetchTicketById(ticketId);
    return result?.data ?? null;
  }, []);

  /**
   * Submit an admin reply; returns updated ticket from re-fetch.
   * Optimistically bumps repliesCount in the list row.
   */
  const submitReply = useCallback(async (ticketId, message) => {
    const result = await addAdminReply(ticketId, message);

    // Optimistically update status + repliesCount in the list
    setRows((prev) =>
      prev.map((r) =>
        r.ticketId === ticketId
          ? {
              ...r,
              status: result?.data?.status ?? r.status,
              repliesCount: result?.data?.repliesCount ?? (r.repliesCount ?? 0) + 1,
            }
          : r
      )
    );

    showSuccess(result?.message ?? "Reply sent successfully");
    logger.debug("[useSupport] reply submitted", { ticketId });

    // Return fresh ticket so detail panel can refresh thread
    return fetchTicketById(ticketId).then((r) => r?.data ?? null);
  }, []);

  /**
   * Update ticket status; reconciles list row from API response.
   */
  const changeStatus = useCallback(async (ticketId, status) => {
    const result = await updateTicketStatus(ticketId, status);

    setRows((prev) =>
      prev.map((r) =>
        r.ticketId === ticketId
          ? { ...r, status: result?.data?.status ?? status }
          : r
      )
    );

    showSuccess(result?.message ?? `Status updated to "${status}"`);
    logger.debug("[useSupport] status changed", { ticketId, status });

    return result?.data ?? null;
  }, []);

  return {
    rows,
    pagination,
    loading,
    error,
    page,
    goToPage,
    refresh,
    loadTicket,
    submitReply,
    changeStatus,
  };
}

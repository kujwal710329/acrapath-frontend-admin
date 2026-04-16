"use client";

import { useState, useCallback } from "react";
import SupportTabNav from "./components/SupportTabNav";
import TicketsTable from "./components/TicketsTable";
import TicketDetailPanel from "./components/TicketDetailPanel";
import TableControls from "@/components/admin-dashboard/Professionals/components/TableControls";
import { useSupport } from "@/hooks/useSupport";

export default function SupportPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const {
    rows,
    pagination,
    loading,
    error,
    goToPage,
    refresh,
    loadTicket,
    submitReply,
    changeStatus,
  } = useSupport({ statusFilter, perPage });

  const handleTabChange = useCallback((tab) => {
    setStatusFilter(tab);
  }, []);

  const handleRefreshClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent("admin-refresh"));
  }, []);

  const handleOpenTicket = useCallback((ticket) => {
    setSelectedTicket(ticket);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedTicket(null);
    // Refresh list to pick up any status changes made in the panel
    refresh();
  }, [refresh]);

  return (
    <div className="flex flex-col">
      {/* ── Sticky toolbar ──────────────────────────────────────────────── */}
      <div className="sticky top-18 z-20 flex items-center justify-between flex-wrap gap-3 px-6 py-3 bg-(--pure-white) border-b border-(--color-black-shade-100)">
        <div className="flex items-center gap-3 flex-wrap">
          <SupportTabNav activeTab={statusFilter} onTabChange={handleTabChange} />
          <button
            onClick={handleRefreshClick}
            className="h-8 px-3 rounded border border-(--color-black-shade-200) text-14 text-(--color-black-shade-600) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
            aria-label="Refresh"
          >
            Refresh
          </button>
        </div>

        <TableControls
          search=""
          onSearch={undefined}
          perPage={perPage}
          onPerPageChange={setPerPage}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasPrevPage={pagination.hasPrevPage}
          hasNextPage={pagination.hasNextPage}
          onPageChange={goToPage}
          onFilterClick={() => {}}
        />
      </div>

      {/* ── Ticket count summary ─────────────────────────────────────────── */}
      {!loading && !error && pagination.totalCount > 0 && (
        <div className="px-6 py-2 text-13 text-(--color-black-shade-500) border-b border-(--color-black-shade-100)">
          {pagination.totalCount} ticket{pagination.totalCount !== 1 ? "s" : ""}
          {statusFilter ? ` · ${statusFilter}` : ""}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <TicketsTable
        data={rows}
        loading={loading}
        error={error}
        onRetry={refresh}
        onOpenTicket={handleOpenTicket}
      />

      {/* ── Detail panel ────────────────────────────────────────────────── */}
      <TicketDetailPanel
        open={!!selectedTicket}
        ticket={selectedTicket}
        onClose={handleClosePanel}
        onLoadTicket={loadTicket}
        onSubmitReply={submitReply}
        onChangeStatus={changeStatus}
      />
    </div>
  );
}

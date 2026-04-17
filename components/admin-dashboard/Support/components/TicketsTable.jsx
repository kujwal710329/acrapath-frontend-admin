"use client";

import { useCallback } from "react";
import StatusBadge from "./StatusBadge";
import Button from "@/components/common/Button";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColumnHeader({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left text-14 font-semibold text-(--color-black-shade-700) border border-(--color-black-shade-100) bg-(--pure-white) whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5 border border-(--color-black-shade-100)">
          <div className="h-4 rounded bg-(--color-black-shade-100)" />
        </td>
      ))}
    </tr>
  );
}

function Cell({ children, className = "" }) {
  return (
    <td
      className={`px-4 py-3.5 text-14 border border-(--color-black-shade-100) ${className}`}
    >
      {children}
    </td>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(str, max = 48) {
  if (!str) return "—";
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TicketsTable({ data = [], loading, error, onRetry, onOpenTicket }) {
  const handleRowClick = useCallback(
    (ticket) => {
      onOpenTicket?.(ticket);
    },
    [onOpenTicket]
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <ColumnHeader>Ticket ID</ColumnHeader>
              <ColumnHeader>User</ColumnHeader>
              <ColumnHeader>Category</ColumnHeader>
              <ColumnHeader>Subject</ColumnHeader>
              <ColumnHeader>Status</ColumnHeader>
              <ColumnHeader>Replies</ColumnHeader>
              <ColumnHeader>Date</ColumnHeader>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-14 text-(--color-black-shade-500)">{error}</p>
        <Button variant="outline" onClick={onRetry} className="w-auto! h-10! px-5">
          Retry
        </Button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          className="text-(--color-black-shade-300)"
        >
          <path
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-14 font-medium text-(--color-black-shade-600)">No tickets found</p>
        <p className="text-13 text-(--color-black-shade-400)">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <ColumnHeader>Ticket ID</ColumnHeader>
            <ColumnHeader>User</ColumnHeader>
            <ColumnHeader>Category</ColumnHeader>
            <ColumnHeader>Subject</ColumnHeader>
            <ColumnHeader>Status</ColumnHeader>
            <ColumnHeader>Replies</ColumnHeader>
            <ColumnHeader>Submitted</ColumnHeader>
          </tr>
        </thead>
        <tbody>
          {data.map((ticket) => (
            <tr
              key={ticket._id ?? ticket.ticketId}
              onClick={() => handleRowClick(ticket)}
              className="hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
            >
              {/* Ticket ID */}
              <Cell className="text-(--color-primary) font-medium whitespace-nowrap">
                {ticket.ticketId}
              </Cell>

              {/* User */}
              <Cell className="whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-(--color-black-shade-800) font-medium leading-tight">
                    {ticket.fullName || "—"}
                  </span>
                  <span className="text-12 text-(--color-black-shade-400) leading-tight">
                    {ticket.email || ""}
                  </span>
                </div>
              </Cell>

              {/* Category */}
              <Cell className="text-(--color-black-shade-600) whitespace-nowrap">
                {ticket.category || "—"}
              </Cell>

              {/* Subject */}
              <Cell className="text-(--color-black-shade-700) max-w-64">
                <span className="block truncate" title={ticket.subject}>
                  {truncate(ticket.subject, 52)}
                </span>
              </Cell>

              {/* Status */}
              <Cell className="whitespace-nowrap">
                <StatusBadge status={ticket.status} />
              </Cell>

              {/* Replies count */}
              <Cell className="text-center text-(--color-black-shade-600) whitespace-nowrap">
                {ticket.repliesCount ?? 0}
              </Cell>

              {/* Date */}
              <Cell className="text-(--color-black-shade-500) whitespace-nowrap">
                {formatDate(ticket.createdAt)}
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

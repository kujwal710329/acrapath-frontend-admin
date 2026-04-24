"use client";

import { useState, useCallback } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import JobPostStatusDropdown from "./JobPostStatusDropdown";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColumnHeader({ children }) {
  return (
    <th className="px-4 py-3 text-left text-14 font-semibold text-(--color-black-shade-700) border border-(--color-black-shade-100) bg-(--pure-white) whitespace-nowrap">
      {children}
    </th>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-3 py-3.5 border border-(--color-black-shade-100)">
        <div className="h-4 w-4 rounded bg-(--color-black-shade-100)" />
      </td>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5 border border-(--color-black-shade-100)">
          <div className="h-4 rounded bg-(--color-black-shade-100)" />
        </td>
      ))}
      <td className="px-4 py-3.5 border border-(--color-black-shade-100) text-center">
        <div className="h-6 w-12 rounded bg-(--color-black-shade-100) mx-auto" />
      </td>
    </tr>
  );
}

const THEAD = ({ isAllSelected, onToggleAll }) => (
  <thead>
    <tr>
      <th className="w-12 px-3 py-3 border border-(--color-black-shade-100) bg-(--pure-white)">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onToggleAll}
          className="h-4 w-4 rounded border-(--color-black-shade-300) cursor-pointer accent-(--color-primary)"
          aria-label="Select all"
        />
      </th>
      <ColumnHeader>Job ID</ColumnHeader>
      <ColumnHeader>Created Date &amp; Time</ColumnHeader>
      <ColumnHeader>Company</ColumnHeader>
      <ColumnHeader>Category</ColumnHeader>
      <ColumnHeader>Profile Seen</ColumnHeader>
      <ColumnHeader>Talbox Matches</ColumnHeader>
      <ColumnHeader>Profile Unlock</ColumnHeader>
      <ColumnHeader>Status</ColumnHeader>
      <th className="px-4 py-3 text-center text-14 font-semibold text-(--color-black-shade-700) border border-(--color-black-shade-100) bg-(--pure-white) whitespace-nowrap">
        Actions
      </th>
    </tr>
  </thead>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function CurrentPostTable({ data = [], loading, error, onRetry, onStatusChange, onView, onDelete }) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // null | { id, label }

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;

  const toggleAll = useCallback(() => {
    setSelectedRows(
      isAllSelected ? new Set() : new Set(data.map((_, i) => i))
    );
  }, [isAllSelected, data]);

  const toggleRow = useCallback((index) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <THEAD isAllSelected={false} onToggleAll={() => {}} />
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-14 text-(--color-black-shade-500)">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-14 font-medium text-(--color-primary) border border-(--color-primary) hover:bg-(--color-primary-shade-100) transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-14 font-medium text-(--color-black-shade-600)">
          No job posts found
        </p>
        <p className="text-13 text-(--color-black-shade-400)">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const { id } = confirmDelete;
          setConfirmDelete(null);
          onDelete?.(id);
        }}
        title="Delete Job Post?"
        description={`Are you sure you want to delete Job ID: ${confirmDelete?.label ?? "this job post"}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <THEAD isAllSelected={isAllSelected} onToggleAll={toggleAll} />
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="hover:bg-(--color-black-shade-50) transition-colors"
              >
                <td className="px-3 py-3.5 border border-(--color-black-shade-100)">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(idx)}
                    onChange={() => toggleRow(idx)}
                    className="h-4 w-4 rounded border-(--color-black-shade-300) cursor-pointer accent-(--color-primary)"
                    aria-label={`Select ${row.id}`}
                  />
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {row.jobId ?? row.id}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {row.company ?? row.companyName ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap capitalize">
                  {row.jobCategory ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {row.profileSeen ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {row.talboxMatches ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {row.profileUnlock ?? "—"}
                </td>
                <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
                  <JobPostStatusDropdown
                    value={row.status ?? "active"}
                    onChange={(val) => onStatusChange?.(row.jobId ?? row.id, val)}
                  />
                </td>
                <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView?.(row)}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-(--color-primary) bg-(--color-primary-shade-100) border border-(--color-primary) hover:opacity-80 transition-colors cursor-pointer"
                      aria-label={`View job ${row.jobId ?? row.id}`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: row.jobId ?? row.id, label: row.jobId ?? row.id })}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                      aria-label={`Delete job ${row.jobId ?? row.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

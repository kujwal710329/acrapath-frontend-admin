"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Button from "@/components/common/Button";
import ConfirmModal from "@/components/common/ConfirmModal";
import CompanyAvatar from "@/components/common/CompanyAvatar";
import BulkActionBar from "./BulkActionBar";
import { useTableSelection } from "@/hooks/useTableSelection";

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
        <div className="h-7 w-24 rounded-md bg-(--color-black-shade-100) mx-auto" />
      </td>
    </tr>
  );
}

function TableHead({ checkboxRef, isAllSelected, onToggleAll }) {
  return (
    <thead>
      <tr>
        <th className="w-12 px-3 py-3 border border-(--color-black-shade-100) bg-(--pure-white)">
          <input
            ref={checkboxRef}
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
        <ColumnHeader>Job Title</ColumnHeader>
        <ColumnHeader>Category</ColumnHeader>
        <ColumnHeader>Type</ColumnHeader>
        <ColumnHeader>Salary Range</ColumnHeader>
        <ColumnHeader>Top Verified</ColumnHeader>
        <th className="px-4 py-3 text-center text-14 font-semibold text-(--color-black-shade-700) border border-(--color-black-shade-100) bg-(--pure-white) whitespace-nowrap">
          Actions
        </th>
      </tr>
    </thead>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 00-12 12h4z" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TopVerifiedJobsTable({
  data = [],
  loading,
  error,
  onRetry,
  onStatusChange,
  onToggleDreamjob,
  onView,
  onDelete,
}) {
  const {
    selectedRows, count, total, isAllSelected, isIndeterminate,
    hasSelection, toggleRow, toggleAll, selectAll, clearSelection, getSelectedItems,
  } = useTableSelection(data);

  const [togglingIds, setTogglingIds] = useState(new Set());
  const [confirmPending, setConfirmPending] = useState(null);
  // null | { id, label, isTop } for single toggle
  const [confirmDelete, setConfirmDelete] = useState(null);
  // null | { id, label } for single | { bulk: true, ids, label } for bulk

  const theadCheckRef = useRef(null);

  useEffect(() => {
    if (theadCheckRef.current) theadCheckRef.current.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  const proceedToggle = useCallback(async (jobId) => {
    setTogglingIds((prev) => new Set([...prev, jobId]));
    try {
      await onToggleDreamjob?.(jobId);
    } finally {
      setTogglingIds((prev) => { const next = new Set(prev); next.delete(jobId); return next; });
    }
  }, [onToggleDreamjob]);

  const handleToggle = useCallback((row) => {
    const id = row.jobId ?? row.id;
    setConfirmPending({ id, isTop: row.isDreamJob === true, label: row.jobTitle ?? row.company ?? row.companyName ?? String(id) });
  }, []);

  const handleConfirmToggle = useCallback(() => {
    if (!confirmPending) return;
    const { id } = confirmPending;
    setConfirmPending(null);
    proceedToggle(id);
  }, [confirmPending, proceedToggle]);

  const handleBulkStatus = useCallback(async (status) => {
    const items = getSelectedItems();
    await Promise.all(items.map((row) => onStatusChange?.(row.jobId ?? row.id, status)));
    clearSelection();
  }, [getSelectedItems, onStatusChange, clearSelection]);

  const handleBulkDeleteRequest = useCallback(() => {
    const ids = getSelectedItems().map((r) => r.jobId ?? r.id);
    setConfirmDelete({ bulk: true, ids, label: `${ids.length} selected job${ids.length !== 1 ? "s" : ""}` });
  }, [getSelectedItems]);

  const handleConfirmDelete = useCallback(() => {
    if (!confirmDelete) return;
    if (confirmDelete.bulk) {
      confirmDelete.ids.forEach((id) => onDelete?.(id));
      clearSelection();
    } else {
      onDelete?.(confirmDelete.id);
    }
    setConfirmDelete(null);
  }, [confirmDelete, onDelete, clearSelection]);

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <TableHead checkboxRef={{ current: null }} isAllSelected={false} onToggleAll={() => {}} />
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-14 text-(--color-black-shade-500)">{error}</p>
        <Button variant="outline" onClick={onRetry} className="w-auto! h-10! px-5">Retry</Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-14 font-medium text-(--color-black-shade-600)">No job posts found</p>
        <p className="text-13 text-(--color-black-shade-400)">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      {/* Toggle dreamjob confirm */}
      <ConfirmModal
        open={!!confirmPending}
        onClose={() => setConfirmPending(null)}
        onConfirm={handleConfirmToggle}
        title={confirmPending?.isTop ? "Remove from Top Verified?" : "Mark as Top Verified?"}
        description={confirmPending?.label}
        confirmLabel={confirmPending?.isTop ? "Remove" : "Mark as Top"}
        confirmVariant="primary"
      />

      {/* Delete confirm (single or bulk) */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title={confirmDelete?.bulk ? `Delete ${confirmDelete.ids?.length} Jobs?` : "Delete Job Post?"}
        description={
          confirmDelete?.bulk
            ? `Are you sure you want to permanently delete ${confirmDelete.label}? This action cannot be undone.`
            : `Are you sure you want to delete Job ID: ${confirmDelete?.label ?? "this job post"}? This action cannot be undone.`
        }
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {hasSelection && (
          <BulkActionBar
            count={count}
            total={total}
            isIndeterminate={isIndeterminate}
            onSelectAll={selectAll}
            onClear={clearSelection}
            onBulkStatus={onStatusChange ? handleBulkStatus : null}
            onBulkDeleteRequest={handleBulkDeleteRequest}
          />
        )}

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <TableHead
              checkboxRef={theadCheckRef}
              isAllSelected={isAllSelected}
              onToggleAll={toggleAll}
            />
            <tbody>
              {data.map((row, idx) => {
                const jobId = row.jobId ?? row.id;
                const isTop = row.isDreamJob === true;
                const isToggling = togglingIds.has(jobId);
                const salMin = row.compensation?.minRange;
                const salMax = row.compensation?.maxRange;
                const salaryRange =
                  salMin != null && salMax != null
                    ? `₹${salMin.toLocaleString()} – ₹${salMax.toLocaleString()}`
                    : "—";

                return (
                  <tr
                    key={jobId ?? idx}
                    className="hover:bg-(--color-black-shade-50) transition-colors"
                    style={selectedRows.has(idx) ? { background: "color-mix(in srgb, var(--color-primary) 5%, transparent)" } : {}}
                  >
                    <td className="px-3 py-3.5 border border-(--color-black-shade-100)">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(idx)}
                        onChange={() => toggleRow(idx)}
                        className="h-4 w-4 rounded border-(--color-black-shade-300) cursor-pointer accent-(--color-primary)"
                        aria-label={`Select ${jobId}`}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                      {jobId}
                    </td>
                    <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CompanyAvatar companyName={row.company ?? row.companyName ?? ""} size="sm" />
                        <span>{row.company ?? row.companyName ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                      {row.jobTitle ?? row.title ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap capitalize">
                      {row.jobCategory ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                      {row.type ?? row.jobType ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                      {salaryRange}
                    </td>
                    <td className="px-4 py-3.5 border border-(--color-black-shade-100) whitespace-nowrap">
                      {isTop ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-13 font-semibold bg-yellow-50 text-yellow-600 border border-yellow-200">
                          <span className="text-base leading-none">★</span>
                          Top Verified
                        </span>
                      ) : (
                        <span className="text-14 text-(--color-black-shade-300)">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onView?.(row)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-(--color-primary) bg-(--color-primary-shade-100) border border-(--color-primary) hover:opacity-80 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggle(row)}
                          disabled={isToggling}
                          className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            isTop
                              ? "text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100"
                              : "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                          }`}
                        >
                          {isToggling && <Spinner />}
                          {isToggling ? "Updating…" : isTop ? "Remove Top" : "Mark as Top"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: jobId, label: jobId })}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-(--color-red) bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

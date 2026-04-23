"use client";

import { useState, useCallback } from "react";
import StarRating from "./StarRating";
import Button from "@/components/common/Button";
import ConfirmModal from "@/components/common/ConfirmModal";
import { CATEGORY_LABELS, CATEGORY_BADGE_STYLES } from "@/constants/testimonialCategories";

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
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5 border border-(--color-black-shade-100)">
          <div className="h-4 rounded bg-(--color-black-shade-100)" />
        </td>
      ))}
      <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
        <div className="h-6 w-28 rounded bg-(--color-black-shade-100)" />
      </td>
    </tr>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 rounded-full border-2 border-(--color-primary) border-t-transparent animate-spin"
      aria-label="Loading"
    />
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
      <ColumnHeader>Name</ColumnHeader>
      <ColumnHeader>Role</ColumnHeader>
      <ColumnHeader>Designation</ColumnHeader>
      <ColumnHeader>Company</ColumnHeader>
      <ColumnHeader>Title</ColumnHeader>
      <ColumnHeader>Rating</ColumnHeader>
      <ColumnHeader>Featured</ColumnHeader>
      <ColumnHeader>Category</ColumnHeader>
      <th className="px-4 py-3 text-left text-14 font-semibold text-(--color-black-shade-700) border border-(--color-black-shade-100) bg-(--pure-white) whitespace-nowrap">
        Actions
      </th>
    </tr>
  </thead>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(row) {
  if (row.userName) return row.userName;
  const userId = row.userId;
  if (!userId) return "—";
  const first = userId.firstName ?? "";
  const last = userId.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || userId.email || "—";
}

function resolveCurrentExperience(userId) {
  const work = userId?.professionalInfo?.workExperience ?? [];
  const intern = userId?.professionalInfo?.internshipExperience ?? [];
  // Prefer currentlyWorking, else most recent by joiningDate
  const sortedWork = [...work].sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
  const sortedIntern = [...intern].sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
  return (
    sortedWork.find((w) => w.currentlyWorking) ??
    sortedWork[0] ??
    sortedIntern.find((i) => i.currentlyWorking) ??
    sortedIntern[0] ??
    null
  );
}

function getDesignation(row) {
  const userId = row.userId;
  if (!userId) return "—";
  // Employers store designation in personalInfo.currentDesignation
  if (userId.personalInfo?.currentDesignation) return userId.personalInfo.currentDesignation;
  // Employees store it in their work/internship experience
  const exp = resolveCurrentExperience(userId);
  if (exp?.role) return exp.role;
  return "—";
}

function getCompany(row) {
  const userId = row.userId;
  if (!userId) return "—";
  if (userId.companyName) return userId.companyName;
  const exp = resolveCurrentExperience(userId);
  return exp?.companyName || "—";
}

function getRole(row) {
  return capitalizeRole(row.userId?.role);
}

function truncate(str, max = 40) {
  if (!str) return "—";
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

function capitalizeRole(role) {
  if (!role) return "—";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TestimonialsTable({
  data = [],
  loading,
  error,
  onRetry,
  onToggleFeatured,
  onEdit,
  onDelete,
}) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Confirmation modal state for delete
  const [deletePendingId, setDeletePendingId] = useState(null);

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

  const handleToggleFeatured = useCallback(
    async (id) => {
      setTogglingIds((prev) => new Set(prev).add(id));
      try {
        await onToggleFeatured?.(id);
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [onToggleFeatured]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletePendingId) return;
    const id = deletePendingId;
    setDeletePendingId(null);
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await onDelete?.(id);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [deletePendingId, onDelete]);

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
        <Button variant="outline" onClick={onRetry} className="w-auto! h-10! px-5">
          Retry
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-14 font-medium text-(--color-black-shade-600)">
          No testimonials found
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
        open={!!deletePendingId}
        onClose={() => setDeletePendingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete testimonial?"
        description="This action is permanent and cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <THEAD isAllSelected={isAllSelected} onToggleAll={toggleAll} />
          <tbody>
            {data.map((row, idx) => {
              const id = row._id;
              const isToggling = togglingIds.has(id);
              const isDeleting = deletingIds.has(id);

              return (
                <tr
                  key={id ?? idx}
                  className="hover:bg-(--color-black-shade-50) transition-colors"
                >
                  <td className="px-3 py-3.5 border border-(--color-black-shade-100)">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(idx)}
                      onChange={() => toggleRow(idx)}
                      className="h-4 w-4 rounded border-(--color-black-shade-300) cursor-pointer accent-(--color-primary)"
                      aria-label={`Select row ${idx + 1}`}
                    />
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                    {getDisplayName(row)}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                    {getRole(row)}
                  </td>

                  {/* Designation */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                    {getDesignation(row)}
                  </td>

                  {/* Company */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                    {getCompany(row)}
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) max-w-48">
                    <span className="block truncate" title={row.title}>
                      {truncate(row.title, 40)}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3.5 border border-(--color-black-shade-100) whitespace-nowrap">
                    <StarRating rating={row.rating} />
                  </td>

                  {/* Featured */}
                  <td className="px-4 py-3.5 text-14 border border-(--color-black-shade-100) whitespace-nowrap">
                    {row.isFeatured ? (
                      <span className="text-amber-500 font-medium">★ Featured</span>
                    ) : (
                      <span className="text-(--color-black-shade-400)">—</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5 text-14 border border-(--color-black-shade-100) whitespace-nowrap">
                    {row.category ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-12 font-medium ${CATEGORY_BADGE_STYLES[row.category] ?? "bg-(--color-black-shade-100) text-(--color-black-shade-600) border border-(--color-black-shade-200)"}`}>
                        {CATEGORY_LABELS[row.category] ?? row.category}
                      </span>
                    ) : (
                      <span className="text-12 text-(--color-black-shade-400)">Universal</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 border border-(--color-black-shade-100) whitespace-nowrap">
                    {/* Toggle Featured button */}
                    <button
                      onClick={() => handleToggleFeatured(id)}
                      disabled={isToggling || isDeleting}
                      className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        row.isFeatured
                          ? "text-amber-600 border border-amber-200 hover:bg-amber-50"
                          : "text-(--color-primary) border border-(--color-primary) hover:bg-(--color-primary-shade-100)"
                      }`}
                    >
                      {isToggling ? <Spinner /> : null}
                      {row.isFeatured ? "Unfeature" : "Feature"}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => onEdit?.(row)}
                      disabled={isDeleting || isToggling}
                      className="inline-flex items-center gap-1.5 ml-2 rounded px-3 py-1 text-xs text-(--color-black-shade-600) border border-(--color-black-shade-300) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeletePendingId(id)}
                      disabled={isDeleting || isToggling}
                      className="inline-flex items-center gap-1.5 ml-2 rounded px-3 py-1 text-xs text-red-500 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? <Spinner /> : null}
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

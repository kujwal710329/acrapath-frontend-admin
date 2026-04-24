"use client";

import { useState, useCallback } from "react";
import Button from "@/components/common/Button";
import ConfirmModal from "@/components/common/ConfirmModal";
import {
  BOOK_CATEGORY_LABELS,
  BOOK_CATEGORY_BADGE_STYLES,
} from "@/constants/bookCategories";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(str, max = 40) {
  if (!str) return "—";
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
      {/* Cover */}
      <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
        <div className="h-14 w-10 rounded bg-(--color-black-shade-100)" />
      </td>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5 border border-(--color-black-shade-100)">
          <div className="h-4 rounded bg-(--color-black-shade-100)" />
        </td>
      ))}
      <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
        <div className="h-6 w-36 rounded bg-(--color-black-shade-100)" />
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

function CoverThumbnail({ src, title }) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div className="h-14 w-10 rounded bg-(--color-black-shade-100) flex items-center justify-center shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-(--color-black-shade-300)"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title ?? "Book cover"}
      onError={() => setImgError(true)}
      className="h-14 w-10 rounded object-cover shrink-0 border border-(--color-black-shade-100)"
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
      <ColumnHeader>Cover</ColumnHeader>
      <ColumnHeader>Title</ColumnHeader>
      <ColumnHeader>Author</ColumnHeader>
      <ColumnHeader>Pages</ColumnHeader>
      <ColumnHeader>Category</ColumnHeader>
      <ColumnHeader>Views</ColumnHeader>
      <ColumnHeader>Status</ColumnHeader>
      <ColumnHeader>Created At</ColumnHeader>
      <th className="px-4 py-3 text-left text-14 font-semibold text-(--color-black-shade-700) border border-(--color-black-shade-100) bg-(--pure-white) whitespace-nowrap">
        Actions
      </th>
    </tr>
  </thead>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function LibraryTable({
  data = [],
  loading,
  error,
  onRetry,
  onToggleActive,
  onEdit,
  onDelete,
}) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [deletePendingBook, setDeletePendingBook] = useState(null); // { id, title }

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

  const handleToggleActive = useCallback(
    async (id) => {
      setTogglingIds((prev) => new Set(prev).add(id));
      try {
        await onToggleActive?.(id);
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [onToggleActive]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletePendingBook) return;
    const { id } = deletePendingBook;
    setDeletePendingBook(null);
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
  }, [deletePendingBook, onDelete]);

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
          No books found
        </p>
        <p className="text-13 text-(--color-black-shade-400)">
          Try adjusting your search or filters, or add a new book
        </p>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        open={!!deletePendingBook}
        onClose={() => setDeletePendingBook(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete book?"
        description={
          deletePendingBook?.title
            ? `Are you sure you want to delete "${deletePendingBook.title}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
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
                  {/* Checkbox */}
                  <td className="px-3 py-3.5 border border-(--color-black-shade-100)">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(idx)}
                      onChange={() => toggleRow(idx)}
                      className="h-4 w-4 rounded border-(--color-black-shade-300) cursor-pointer accent-(--color-primary)"
                      aria-label={`Select row ${idx + 1}`}
                    />
                  </td>

                  {/* Cover */}
                  <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
                    <CoverThumbnail
                      src={row.coverImageUrl}
                      title={row.title}
                    />
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) max-w-48">
                    <span className="block truncate font-medium" title={row.title}>
                      {truncate(row.title, 40)}
                    </span>
                  </td>

                  {/* Author */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                    {row.authorName || "—"}
                  </td>

                  {/* Pages */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap tabular-nums">
                    {row.pages > 0 ? row.pages : "—"}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5 text-14 border border-(--color-black-shade-100) whitespace-nowrap">
                    {row.category ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-12 font-medium ${
                          BOOK_CATEGORY_BADGE_STYLES[row.category] ??
                          "bg-(--color-black-shade-100) text-(--color-black-shade-600) border border-(--color-black-shade-200)"
                        }`}
                      >
                        {BOOK_CATEGORY_LABELS[row.category] ?? row.category}
                      </span>
                    ) : (
                      <span className="text-12 text-(--color-black-shade-400)">—</span>
                    )}
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap tabular-nums">
                    {row.viewCount ?? 0}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-14 border border-(--color-black-shade-100) whitespace-nowrap">
                    {row.isActive ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-12 font-medium bg-green-50 text-green-700 border border-green-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-12 font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Created At */}
                  <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                    {formatDate(row.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 border border-(--color-black-shade-100) whitespace-nowrap">
                    {/* Toggle Active/Inactive */}
                    <button
                      onClick={() => handleToggleActive(id)}
                      disabled={isToggling || isDeleting}
                      className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        row.isActive
                          ? "text-amber-600 border border-amber-200 hover:bg-amber-50"
                          : "text-green-600 border border-green-200 hover:bg-green-50"
                      }`}
                    >
                      {isToggling ? <Spinner /> : null}
                      {row.isActive ? "Deactivate" : "Activate"}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit?.(row)}
                      disabled={isDeleting || isToggling}
                      className="inline-flex items-center gap-1.5 ml-2 rounded px-3 py-1 text-xs text-(--color-black-shade-600) border border-(--color-black-shade-300) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeletePendingBook({ id, title: row.title })}
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

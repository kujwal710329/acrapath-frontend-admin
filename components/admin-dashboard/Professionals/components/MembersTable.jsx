"use client";

import { useState, useCallback } from "react";
import Icon from "@/components/common/Icon";
import Button from "@/components/common/Button";
import ConfirmModal from "@/components/common/ConfirmModal";
import ResumeChip from "./ResumeChip";
import StatusDropdown, { STATUS_OPTIONS } from "./StatusDropdown";
import {
  formatContact,
  formatCities,
  formatRelativeTime,
  getResumeName,
  getResumeUrl,
  getDisplayName,
} from "@/utilities/professionals.helpers";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColumnHeader({ children, withMenu }) {
  return (
    <th className="px-4 py-3 text-left text-14 font-semibold text-(--color-black-shade-700) border border-(--color-black-shade-100) bg-(--pure-white) whitespace-nowrap">
      {withMenu ? (
        <div className="flex items-center gap-2">
          <span>{children}</span>
          <button
            className="cursor-pointer opacity-50 hover:opacity-90 transition-opacity shrink-0"
            aria-label={`${children} options`}
          >
            <Icon
              name="statics/Employee-Dashboard/three-vertical-dots.svg"
              width={3}
              height={15}
              alt="options"
            />
          </button>
        </div>
      ) : (
        children
      )}
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
      <td className="px-4 py-3.5 border border-(--color-black-shade-100) text-center">
        <div className="h-6 w-6 rounded-full bg-(--color-black-shade-100) mx-auto" />
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
      <ColumnHeader>Professional ID</ColumnHeader>
      <ColumnHeader>Full Name</ColumnHeader>
      <ColumnHeader>Contact Number</ColumnHeader>
      <ColumnHeader>Professional Category</ColumnHeader>
      <ColumnHeader>City Preference</ColumnHeader>
      <ColumnHeader withMenu>Last Active</ColumnHeader>
      <ColumnHeader withMenu>Score</ColumnHeader>
      <ColumnHeader>Resume</ColumnHeader>
      <ColumnHeader withMenu>Status</ColumnHeader>
      <th className="px-4 py-3 text-center text-14 font-semibold text-(--color-black-shade-700) border border-(--color-black-shade-100) bg-(--pure-white) whitespace-nowrap">
        Actions
      </th>
    </tr>
  </thead>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function MembersTable({ data = [], loading, error, onRetry, onStatusChange, onView, onArchive, onDelete }) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // null | { id, name }
  const [confirmArchive, setConfirmArchive] = useState(null); // null | { id, name, isArchived }

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
          No professionals found
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
        open={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
        onConfirm={() => {
          if (!confirmArchive) return;
          const { id, isArchived } = confirmArchive;
          setConfirmArchive(null);
          onArchive?.(id, isArchived ? "inactive" : "active");
        }}
        title={confirmArchive?.isArchived ? "Unarchive Professional?" : "Archive Professional?"}
        description={
          confirmArchive?.isArchived
            ? `Reactivate ${confirmArchive?.name ?? "this professional"}? They will become visible on public pages again.`
            : `Are you sure you want to archive ${confirmArchive?.name ?? "this professional"}? They will be hidden from all public pages.`
        }
        confirmLabel={confirmArchive?.isArchived ? "Unarchive" : "Archive"}
        confirmVariant="primary"
      />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const { id } = confirmDelete;
          setConfirmDelete(null);
          onDelete?.(id);
        }}
        title="Delete Professional?"
        description={`Are you sure you want to delete ${confirmDelete?.name ?? "this professional"}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />

    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <THEAD isAllSelected={isAllSelected} onToggleAll={toggleAll} />
        <tbody>
          {data.map((row, idx) => {
            const resumeName = getResumeName(row.resumeCV);
            const resumeUrl = getResumeUrl(row.resumeCV);
            const isArchived = row.accountStatus === "inactive";
            return (
              <tr
                key={row.id ?? idx}
                className={`transition-colors ${isArchived ? "opacity-60 bg-amber-50/40" : "hover:bg-(--color-black-shade-50)"}`}
              >
                <td className="px-3 py-3.5 border border-(--color-black-shade-100)">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(idx)}
                    onChange={() => toggleRow(idx)}
                    className="h-4 w-4 rounded border-(--color-black-shade-300) cursor-pointer accent-(--color-primary)"
                    aria-label={`Select ${row.fullName}`}
                  />
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {row.professionalId ?? row.id}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {getDisplayName(row)}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {formatContact(row.countryCode, row.contactNo)}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap capitalize">
                  {row.professionalCategory ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) max-w-45">
                  <span
                    className="block truncate"
                    title={formatCities(row.cityPreference)}
                  >
                    {formatCities(row.cityPreference)}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-14 text-(--color-black-shade-600) border border-(--color-black-shade-100) whitespace-nowrap">
                  {formatRelativeTime(row.lastActive)}
                </td>
                <td className="px-4 py-3.5 text-14 font-medium text-(--color-black-shade-700) border border-(--color-black-shade-100) whitespace-nowrap">
                  {row.score ?? "—"}
                </td>
                <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
                  <ResumeChip filename={resumeName} href={resumeUrl} />
                </td>
                <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
                  <StatusDropdown
                    value={row.profileVerificationStatus}
                    onChange={(val) => onStatusChange?.(row.id, val)}
                    options={STATUS_OPTIONS}
                  />
                </td>
                <td className="px-4 py-3.5 border border-(--color-black-shade-100)">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView?.(row)}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-(--color-primary) bg-(--color-primary-shade-100) border border-(--color-primary) hover:opacity-80 transition-colors cursor-pointer"
                      aria-label={`View ${row.fullName}`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => setConfirmArchive({ id: row.id, name: getDisplayName(row) || "this professional", isArchived })}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        isArchived
                          ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                          : "text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100"
                      }`}
                      aria-label={isArchived ? `Unarchive ${row.fullName}` : `Archive ${row.fullName}`}
                    >
                      {isArchived ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: row.id, name: getDisplayName(row) || "this professional" })}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                      aria-label={`Delete ${row.fullName}`}
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
    </>
  );
}

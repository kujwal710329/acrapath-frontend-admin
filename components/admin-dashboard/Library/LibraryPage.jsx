"use client";

import { useState, useCallback } from "react";
import LibraryTabNav from "./components/LibraryTabNav";
import LibraryTable from "./components/LibraryTable";
import AddBookModal from "./components/AddBookModal";
import EditBookModal from "./components/EditBookModal";
import TableControls from "@/components/admin-dashboard/Professionals/components/TableControls";
import { useLibrary } from "@/hooks/useLibrary";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [perPage, setPerPage] = useState(20);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // book object to edit

  const {
    rows,
    pagination,
    loading,
    error,
    search,
    goToPage,
    handleSearch,
    refresh,
    toggleActive,
    addBook,
    editBook,
    removeBook,
  } = useLibrary({ tab: activeTab, perPage });

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleRefreshClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent("admin-refresh"));
  }, []);

  return (
    <div className="flex flex-col">
      {/* Sticky toolbar */}
      <div className="sticky top-18 z-20 flex items-center justify-between flex-wrap gap-3 px-6 py-3 bg-(--pure-white) border-b border-(--color-black-shade-100)">
        <div className="flex items-center gap-3 flex-wrap">
          <LibraryTabNav activeTab={activeTab} onTabChange={handleTabChange} />
          <button
            onClick={handleRefreshClick}
            className="h-8 px-3 rounded border border-(--color-black-shade-200) text-14 text-(--color-black-shade-600) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
            aria-label="Refresh"
          >
            Refresh
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="h-8 px-3 rounded bg-(--color-primary) text-white text-14 font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            + Add Book
          </button>
        </div>
        <TableControls
          search={search}
          onSearch={handleSearch}
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

      {/* Table */}
      <div>
        <LibraryTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={refresh}
          onToggleActive={toggleActive}
          onEdit={setEditTarget}
          onDelete={removeBook}
        />
      </div>

      <AddBookModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={addBook}
      />

      <EditBookModal
        open={!!editTarget}
        book={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={editBook}
      />
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import TestimonialsTabNav from "./components/TestimonialsTabNav";
import TestimonialsTable from "./components/TestimonialsTable";
import CreateTestimonialModal from "./components/CreateTestimonialModal";
import EditTestimonialModal from "./components/EditTestimonialModal";
import TableControls from "@/components/admin-dashboard/Professionals/components/TableControls";
import { useTestimonials } from "@/hooks/useTestimonials";

export default function TestimonialsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [perPage, setPerPage] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const {
    rows,
    pagination,
    loading,
    error,
    search,
    goToPage,
    handleSearch,
    refresh,
    toggleFeatured,
    deleteTestimonial,
    createTestimonial,
    updateTestimonial,
  } = useTestimonials({ tab: activeTab, perPage });

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
          <TestimonialsTabNav activeTab={activeTab} onTabChange={handleTabChange} />
          <button
            onClick={handleRefreshClick}
            className="h-8 px-3 rounded border border-(--color-black-shade-200) text-14 text-(--color-black-shade-600) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
            aria-label="Refresh"
          >
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="h-8 px-3 rounded bg-(--color-primary) text-white text-14 font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            + Create Testimonial
          </button>
        </div>
        <TableControls
          search={search}
          onSearch={activeTab === "all" ? handleSearch : undefined}
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
        <TestimonialsTable
          data={rows}
          loading={loading}
          error={error}
          onRetry={refresh}
          onToggleFeatured={toggleFeatured}
          onEdit={setEditTarget}
          onDelete={deleteTestimonial}
        />
      </div>

      <CreateTestimonialModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={createTestimonial}
      />

      <EditTestimonialModal
        open={!!editTarget}
        testimonial={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={updateTestimonial}
      />
    </div>
  );
}

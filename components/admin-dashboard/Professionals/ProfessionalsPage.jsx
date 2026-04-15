"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfessionalsTabNav from "./components/ProfessionalsTabNav";
import TableControls from "./components/TableControls";
import MembersTable from "./components/MembersTable";
import RequestsTable from "./components/RequestsTable";
import TopVerifiedProfessionalsTable from "./components/TopVerifiedProfessionalsTable";
import { useProfessionals } from "@/hooks/useProfessionals";

const MEMBERS_TYPE_TABS = new Set(["members", "verificationPending"]);

export default function ProfessionalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("members");
  const [perPage, setPerPage] = useState(20);

  const {
    rows,
    pagination,
    loading,
    error,
    search,
    goToPage,
    handleSearch,
    refresh,
    updateStatus,
    toggleTopProfessional,
  } = useProfessionals({ tab: activeTab, perPage });

  // Header refresh button
  useEffect(() => {
    window.addEventListener("admin-refresh", refresh);
    return () => window.removeEventListener("admin-refresh", refresh);
  }, [refresh]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleView = useCallback(
    (row) => router.push(`/admin/professionals/${row.id}`),
    [router]
  );

  const isMembersType = MEMBERS_TYPE_TABS.has(activeTab);
  const isTopVerified = activeTab === "topVerified";

  return (
    <div className="flex flex-col">
      {/* Sticky toolbar — sticks below the fixed admin header (top-18 = 4.5rem) */}
      <div className="sticky top-18 z-20 flex items-center justify-between flex-wrap gap-3 px-6 py-3 bg-(--pure-white) border-b border-(--color-black-shade-100)">
        <ProfessionalsTabNav activeTab={activeTab} onTabChange={handleTabChange} />
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
        {isTopVerified ? (
          <TopVerifiedProfessionalsTable
            data={rows}
            loading={loading}
            error={error}
            onRetry={refresh}
            onToggleTop={toggleTopProfessional}
          />
        ) : isMembersType ? (
          <MembersTable
            data={rows}
            loading={loading}
            error={error}
            onRetry={refresh}
            onStatusChange={updateStatus}
            onView={handleView}
          />
        ) : (
          <RequestsTable
            data={rows}
            loading={loading}
            error={error}
            onRetry={refresh}
            onStatusChange={updateStatus}
            onView={handleView}
          />
        )}
      </div>
    </div>
  );
}

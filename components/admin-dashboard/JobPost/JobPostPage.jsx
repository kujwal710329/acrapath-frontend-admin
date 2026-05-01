"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import JobPostTabNav from "./components/JobPostTabNav";
import TableControls from "@/components/admin-dashboard/Professionals/components/TableControls";
import CurrentPostTable from "./components/CurrentPostTable";
import JobPostRequestsTable from "./components/JobPostRequestsTable";
import TopVerifiedJobsTable from "./components/TopVerifiedJobsTable";
import AddNewJobPost from "./components/AddNewJobPost";
import { useJobPosts } from "@/hooks/useJobPosts";
import BulkJobUpload from "./components/BulkJobUpload/BulkJobUpload";

const REQUESTS_TYPE_TABS = new Set(["request", "rejected"]);

export default function JobPostPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("currentPost");
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
    toggleDreamjob,
    deleteJob,
  } = useJobPosts({ tab: activeTab, perPage });

  // Header refresh button
  useEffect(() => {
    window.addEventListener("admin-refresh", refresh);
    return () => window.removeEventListener("admin-refresh", refresh);
  }, [refresh]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleView = useCallback(
    (row) => router.push(`/admin/job-post/${row.jobId}`),
    [router]
  );

  const isRequestsType = REQUESTS_TYPE_TABS.has(activeTab);
  const isAddNew = activeTab === "addNew";
  const isTopVerified = activeTab === "topVerified";
  const isBulkUpload = activeTab === "bulkUpload";

  return (
    <div className="flex flex-col">
      {/* Sticky toolbar */}
      <div className="sticky top-18 z-20 flex items-center justify-between flex-wrap gap-3 px-6 py-3 bg-(--pure-white) border-b border-(--color-black-shade-100)">
        <JobPostTabNav activeTab={activeTab} onTabChange={handleTabChange} />
        {!isAddNew && !isBulkUpload && (
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
        )}
      </div>

      {/* Table */}
      <div>
        {/* Keep AddNewJobPost mounted at all times so in-progress form state
            survives tab switches. CSS hidden prevents any visual output. */}
        <div className={isAddNew ? "" : "hidden"}>
          <AddNewJobPost onBack={() => handleTabChange("currentPost")} />
        </div>

        {isBulkUpload && (
          <BulkJobUpload onViewJobs={() => handleTabChange("request")} />
        )}

        {!isAddNew && !isBulkUpload && (
          isTopVerified ? (
            <TopVerifiedJobsTable
              data={rows}
              loading={loading}
              error={error}
              onRetry={refresh}
              onToggleDreamjob={toggleDreamjob}
              onView={handleView}
              onDelete={deleteJob}
            />
          ) : isRequestsType ? (
            <JobPostRequestsTable
              data={rows}
              loading={loading}
              error={error}
              onRetry={refresh}
              onStatusChange={updateStatus}
              onView={handleView}
              onDelete={deleteJob}
            />
          ) : (
            <CurrentPostTable
              data={rows}
              loading={loading}
              error={error}
              onRetry={refresh}
              onStatusChange={updateStatus}
              onView={handleView}
              onDelete={deleteJob}
            />
          )
        )}
      </div>
    </div>
  );
}

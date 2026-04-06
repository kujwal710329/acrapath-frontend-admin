"use client";

import { useState, useCallback, useEffect } from "react";
import StatCard from "@/components/AdminDashboard/Overview/StatCard";
import SectionStatsCard from "@/components/AdminDashboard/Overview/SectionStatsCard";
import DateSelector from "@/components/AdminDashboard/Overview/DateSelector";
import { useAdminStats } from "@/hooks/useAdminStats";

function formatDate(isoStr) {
  if (!isoStr) return "";
  const [y, m, d] = isoStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

function buildSections(data) {
  if (!data) return [];
  return [
    {
      title: "Professionals",
      stats: [
        { label: "Signup", value: data.professionals?.signup ?? 0 },
        { label: "Accepted", value: data.professionals?.accepted ?? 0 },
        { label: "Pending", value: data.professionals?.pending ?? 0 },
        { label: "Rejected", value: data.professionals?.rejected ?? 0 },
        { label: "Deactivated", value: data.professionals?.deactivated ?? 0 },
      ],
    },
    {
      title: "Employers",
      stats: [
        { label: "Signup", value: data.employers?.signup ?? 0 },
        { label: "Accepted", value: data.employers?.accepted ?? 0 },
        { label: "Pending", value: data.employers?.pending ?? 0 },
        { label: "Deactivated", value: data.employers?.deactivated ?? 0 },
      ],
    },
    {
      title: "Job Posts",
      stats: [
        { label: "Total Request", value: data.jobPosts?.totalRequest ?? 0 },
        { label: "Accepted", value: data.jobPosts?.accepted ?? 0 },
        { label: "Pending", value: data.jobPosts?.pending ?? 0 },
        { label: "Expired", value: data.jobPosts?.expired ?? 0 },
      ],
    },
    {
      title: "Job Post Applies",
      stats: [
        { label: "Total Applies", value: data.jobPostApplies?.totalApplies ?? 0 },
        { label: "Shortlisted", value: data.jobPostApplies?.shortlisted ?? 0 },
        { label: "Total User Applies", value: data.jobPostApplies?.totalUserApplies ?? 0 },
        { label: "Avg Applies / User", value: data.jobPostApplies?.avgAppliesPerUser ?? 0 },
      ],
    },
  ];
}

export default function OverviewPage() {
  const [selectedDate, setSelectedDate] = useState(null);

  const dateParams = selectedDate
    ? { startDate: selectedDate, endDate: selectedDate }
    : {};

  const { data, loading, refetch } = useAdminStats(dateParams);

  // Listen for header refresh button
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("admin-refresh", handler);
    return () => window.removeEventListener("admin-refresh", handler);
  }, [refetch]);

  const handleDateSelect = useCallback((isoStr) => {
    setSelectedDate(isoStr);
  }, []);

  const topCards = [
    { label: "Active Job Post", value: data?.topCards?.activeJobPosts ?? 0 },
    { label: "Total Applies", value: data?.topCards?.totalApplies ?? 0 },
    { label: "Applies Per Post", value: data?.topCards?.appliesPerPost ?? 0 },
  ];

  const sections = buildSections(data);

  const periodLabel = selectedDate ? "Selected Day" : "Last 30 Days";
  const dateRangeText =
    data?.dateRange?.startDate && data?.dateRange?.endDate
      ? `${formatDate(data.dateRange.startDate)} – ${formatDate(data.dateRange.endDate)}`
      : "";

  return (
    <div className="flex flex-col gap-6">
      {/* Period label + date range */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-(--color-black)">{periodLabel}</p>
        {dateRangeText && (
          <p className="text-sm text-(--color-black-shade-500)">{dateRangeText}</p>
        )}
      </div>

      {/* Top stat cards */}
      <div
        className={`flex flex-col sm:flex-row gap-4 transition-opacity duration-200 ${
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {topCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* Date selector */}
      <div className="flex justify-end">
        <DateSelector label="Today" onSelect={handleDateSelect} />
      </div>

      {/* Section stats */}
      <div
        className={`flex flex-col gap-4 transition-opacity duration-200 ${
          loading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {sections.map((section) => (
          <SectionStatsCard
            key={section.title}
            title={section.title}
            stats={section.stats}
          />
        ))}
      </div>
    </div>
  );
}

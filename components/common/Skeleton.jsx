"use client";

import GenericCard from "./GenericCard";

/**
 * Skeleton Loader Component
 * Shows placeholder while data is loading
 */

export function SkeletonLoader({ height = "h-4", width = "w-full", className = "", count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} ${width} ${className} bg-gradient-to-r from-(--color-black-shade-200) via-(--color-black-shade-100) to-(--color-black-shade-200) rounded animate-pulse`}
          style={{
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

/**
 * Job Card Skeleton
 * Skeleton loader matching JobCard layout in premium-job-developer
 */
export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-(--color-black-shade-200) p-5 sm:p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-md bg-(--color-black-shade-100) shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="h-4 bg-(--color-black-shade-100) rounded w-2/5" />
          <div className="h-3 bg-(--color-black-shade-100) rounded w-1/4" />
          <div className="h-3 bg-(--color-black-shade-100) rounded w-3/5" />
        </div>
        <div className="h-10 w-24 bg-(--color-black-shade-100) rounded-xl shrink-0" />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-3 bg-(--color-black-shade-100) rounded w-full" />
        <div className="h-3 bg-(--color-black-shade-100) rounded w-4/5" />
      </div>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-(--color-black-shade-100) rounded-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Developer Card Skeleton
 * Skeleton loader matching DeveloperCard layout in premiumDevelopers
 */
export function DeveloperCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-(--color-black-shade-200) p-4 sm:p-6 animate-pulse">
      <div className="flex flex-row gap-5">
        <div className="shrink-0 w-36 sm:w-40 flex flex-col gap-3">
          <div className="w-full aspect-3/4 rounded-xl bg-(--color-black-shade-100)" />
          <div className="h-10 bg-(--color-black-shade-100) rounded-xl" />
        </div>
        <div className="flex-1 flex flex-col gap-3 pt-1">
          <div className="h-5 bg-(--color-black-shade-100) rounded w-3/5" />
          <div className="h-4 bg-(--color-black-shade-100) rounded w-2/5" />
          <div className="h-3 bg-(--color-black-shade-100) rounded w-1/2" />
          <div className="h-3 bg-(--color-black-shade-100) rounded w-4/5 mt-2" />
          <div className="h-3 bg-(--color-black-shade-100) rounded w-full" />
          <div className="flex gap-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-(--color-black-shade-100) rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Card Skeleton
 */
export function ProfileCardSkeleton() {
  return (
    <div className="rounded-2xl shadow-md bg-(--pure-white) p-6 space-y-4">
      <div className="space-y-3">
        <SkeletonLoader height="h-6" width="w-48" />
        <SkeletonLoader height="h-4" width="w-full" />
        <SkeletonLoader height="h-4" width="w-96" />
      </div>
    </div>
  );
}

/**
 * List Skeleton - Multiple items
 */
export function ListSkeleton({ count = 3, variant = "job" }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {variant === "job" && <JobCardSkeleton />}
          {variant === "profile" && <ProfileCardSkeleton />}
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <SkeletonLoader key={idx} height="h-5" width="flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <SkeletonLoader key={colIdx} height="h-4" width="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Specific Job Page Skeleton
 * Mirrors the full layout of SpecificJobPage
 */
export function SpecificJobSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:p-8 space-y-6 md:space-y-8 pb-16">
      {/* Back button placeholder */}
      <SkeletonLoader height="h-5" width="w-16" />

      {/* Header card */}
      <div className="rounded-2xl border border-(--color-black-shade-200) bg-(--pure-white) px-12 py-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              {/* Logo */}
              <div className="h-16 w-16 rounded-2xl bg-(--color-black-shade-200) animate-pulse shrink-0" />

              <div className="space-y-3">
                {/* Job title */}
                <SkeletonLoader height="h-7" width="w-64" />
                {/* Company name */}
                <SkeletonLoader height="h-4" width="w-40" />
                {/* Meta: experience, salary, location */}
                <div className="flex flex-wrap gap-6 mt-3">
                  <SkeletonLoader height="h-4" width="w-24" />
                  <SkeletonLoader height="h-4" width="w-28" />
                  <SkeletonLoader height="h-4" width="w-32" />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-(--color-black-shade-200)" />

          {/* Bottom row: posted / openings / applicants + action buttons */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-6 items-center">
              <SkeletonLoader height="h-4" width="w-28" />
              <SkeletonLoader height="h-4" width="w-24" />
              <SkeletonLoader height="h-4" width="w-28" />
            </div>

            <div className="flex items-center gap-3">
              {/* Bookmark button */}
              <div className="h-10 w-10 rounded-lg bg-(--color-black-shade-200) animate-pulse" />
              {/* Share button */}
              <div className="h-10 w-10 rounded-lg bg-(--color-black-shade-200) animate-pulse" />
              {/* Apply button */}
              <div className="h-10 w-32 rounded-lg bg-(--color-black-shade-200) animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Skills card */}
      <div className="rounded-2xl border border-(--color-black-shade-200) bg-(--pure-white) px-12 py-14">
        <SkeletonLoader height="h-6" width="w-40" className="mb-6" />
        <div className="flex flex-wrap gap-3">
          {[80, 72, 96, 64, 88].map((w, i) => (
            <div
              key={i}
              className={`h-7 rounded-full bg-(--color-black-shade-200) animate-pulse`}
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
      </div>

      {/* Job Description card */}
      <div className="rounded-2xl border border-(--color-black-shade-200) bg-(--pure-white) px-12 py-14">
        <SkeletonLoader height="h-6" width="w-48" className="mb-6" />
        <div className="space-y-3">
          <SkeletonLoader height="h-4" width="w-full" />
          <SkeletonLoader height="h-4" width="w-full" />
          <SkeletonLoader height="h-4" width="w-11/12" />
          <SkeletonLoader height="h-4" width="w-10/12" />
          <SkeletonLoader height="h-4" width="w-full" />
          <SkeletonLoader height="h-4" width="w-9/12" />
        </div>
        {/* Qualifications */}
        <SkeletonLoader height="h-5" width="w-32" className="mt-8 mb-3" />
        <div className="space-y-2 pl-5">
          <SkeletonLoader height="h-4" width="w-10/12" />
          <SkeletonLoader height="h-4" width="w-9/12" />
          <SkeletonLoader height="h-4" width="w-11/12" />
        </div>
      </div>

      {/* About Company card */}
      <div className="rounded-2xl border border-(--color-black-shade-200) bg-(--pure-white) px-12 py-14">
        <SkeletonLoader height="h-6" width="w-48" className="mb-6" />

        {/* Company header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-(--color-black-shade-200) animate-pulse shrink-0" />
            <div className="space-y-3">
              <SkeletonLoader height="h-5" width="w-48" />
              <div className="flex flex-wrap gap-2 mt-2">
                {[60, 120, 96, 120].map((w, i) => (
                  <div
                    key={i}
                    className="h-6 rounded-full bg-(--color-black-shade-200) animate-pulse"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <SkeletonLoader height="h-4" width="w-32" />
        </div>

        {/* Overview */}
        <SkeletonLoader height="h-5" width="w-24" className="mb-3" />
        <div className="space-y-2 mb-8">
          <SkeletonLoader height="h-4" width="w-full" />
          <SkeletonLoader height="h-4" width="w-full" />
          <SkeletonLoader height="h-4" width="w-10/12" />
        </div>

        {/* Pictures */}
        <SkeletonLoader height="h-5" width="w-20" className="mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((_, i) => (
            <div
              key={i}
              className="h-24 sm:h-28 min-w-[220px] sm:w-64 rounded-xl bg-(--color-black-shade-200) animate-pulse shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Header Card Skeleton
 * Mirrors the full layout of ProfileHeaderCard
 */
export function ProfileHeaderCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-(--color-black-shade-200) bg-(--pure-white) px-6 md:px-10 py-6 md:py-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start gap-6 md:gap-8 flex-1">
          {/* Avatar */}
          <div className="relative flex flex-col items-center shrink-0">
            <div className="size-28 rounded-full bg-(--color-black-shade-200) animate-pulse" />
            <div className="absolute -bottom-2 h-5 w-16 rounded-full bg-(--color-black-shade-200) animate-pulse" />
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 w-full">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <SkeletonLoader height="h-6" width="w-48" />
                <SkeletonLoader height="h-4" width="w-36" />
                <SkeletonLoader height="h-3" width="w-24" />
              </div>
              <SkeletonLoader height="h-3" width="w-36" />
            </div>

            {/* Divider */}
            <div className="mt-6 border-t border-(--color-black-shade-100)" />

            {/* Details columns */}
            <div className="pt-6 flex flex-col sm:flex-row sm:justify-between gap-6">
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-4 rounded bg-(--color-black-shade-200) animate-pulse shrink-0" />
                    <SkeletonLoader height="h-4" width="w-28" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-4 rounded bg-(--color-black-shade-200) animate-pulse shrink-0" />
                    <SkeletonLoader height="h-4" width="w-40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Professional Card Skeleton
 * Skeleton loader matching the ProfessionalCard layout in MeetProfessionals
 */
export function ProfessionalCardSkeleton({ gridMode = false }) {
  return (
    <GenericCard
      width={gridMode ? "w-full" : "w-68"}
      height={gridMode ? "h-full" : ""}
      padding="p-0"
      className="flex flex-col overflow-hidden"
    >
      <div className="w-full h-44 bg-(--color-black-shade-200) animate-pulse" />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="h-3 bg-(--color-black-shade-200) rounded-full animate-pulse w-3/4" />
        <div className="h-3 bg-(--color-black-shade-200) rounded-full animate-pulse w-1/2" />
        <div className="h-3 bg-(--color-black-shade-200) rounded-full animate-pulse w-2/3" />
        <div className="mt-auto h-10 bg-(--color-black-shade-200) rounded-lg animate-pulse" />
      </div>
    </GenericCard>
  );
}

/**
 * Card Grid Skeleton
 */
export function CardGridSkeleton({ count = 6, cols = 3 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-2xl bg-(--color-black-shade-200) aspect-square animate-pulse" />
      ))}
    </div>
  );
}

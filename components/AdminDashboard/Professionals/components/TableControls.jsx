"use client";

import Icon from "@/components/common/Icon";

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export default function TableControls({
  search,
  onSearch,
  perPage,
  onPerPageChange,
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPageChange,
  onFilterClick,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-black-shade-400) pointer-events-none"
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          value={search ?? ""}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Search..."
          className="h-8 w-40 rounded-full border border-(--color-black-shade-200) bg-(--pure-white) pl-8 pr-3 text-14 text-(--color-black-shade-600) outline-none focus:border-(--color-primary) transition-colors"
        />
      </div>

      {/* Per-page selector */}
      <div className="relative flex items-center h-8 border border-(--color-black-shade-200) rounded overflow-hidden bg-(--pure-white)">
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="h-full pl-2.5 pr-7 text-14 text-(--color-black-shade-700) bg-transparent outline-none cursor-pointer appearance-none"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-(--color-black-shade-500)">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <span className="text-14 text-(--color-black-shade-600) whitespace-nowrap">
        Per Page
      </span>

      {/* First page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={!hasPrevPage}
        className="h-8 w-8 flex items-center justify-center rounded bg-(--color-primary) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition-opacity"
        aria-label="First page"
      >
        <Icon name="statics/developersList/left-arrow.svg" width={7} height={11} alt="<<" />
        <Icon name="statics/developersList/left-arrow.svg" width={7} height={11} alt="" />
      </button>

      {/* Previous page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="h-8 w-8 flex items-center justify-center rounded bg-(--color-primary) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition-opacity"
        aria-label="Previous page"
      >
        <Icon name="statics/developersList/left-arrow.svg" width={12} height={12} alt="<" />
      </button>

      {/* Page indicator */}
      <span className="text-14 text-(--color-black-shade-700) whitespace-nowrap px-1">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="h-8 w-8 flex items-center justify-center rounded bg-(--color-primary) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition-opacity"
        aria-label="Next page"
      >
        <Icon name="statics/developersList/right-arrow.svg" width={12} height={12} alt=">" />
      </button>

      {/* Filter icon */}
      <button
        onClick={onFilterClick}
        className="h-8 w-8 flex items-center justify-center cursor-pointer hover:bg-(--color-black-shade-50) rounded transition-colors"
        aria-label="Filter"
      >
        <Icon name="statics/Employee-Dashboard/filter.svg" width={20} height={20} alt="filter" />
      </button>
    </div>
  );
}

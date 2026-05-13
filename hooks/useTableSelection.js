import { useState, useCallback, useEffect } from "react";

/**
 * Manages row-level selection state for a data table.
 * Automatically resets when the data array reference changes
 * (tab switch, page change, search, etc.).
 */
export function useTableSelection(data) {
  const [selectedRows, setSelectedRows] = useState(new Set());

  const total = data.length;
  const count = selectedRows.size;
  const isAllSelected = total > 0 && count === total;
  const isIndeterminate = count > 0 && !isAllSelected;
  const hasSelection = count > 0;

  useEffect(() => {
    setSelectedRows(new Set());
  }, [data]);

  const toggleRow = useCallback((index) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedRows(isAllSelected ? new Set() : new Set(data.map((_, i) => i)));
  }, [isAllSelected, data]);

  const selectAll = useCallback(() => {
    setSelectedRows(new Set(data.map((_, i) => i)));
  }, [data]);

  const clearSelection = useCallback(() => setSelectedRows(new Set()), []);

  const getSelectedItems = useCallback(
    () => data.filter((_, i) => selectedRows.has(i)),
    [data, selectedRows]
  );

  return {
    selectedRows,
    count,
    total,
    isAllSelected,
    isIndeterminate,
    hasSelection,
    toggleRow,
    toggleAll,
    selectAll,
    clearSelection,
    getSelectedItems,
  };
}

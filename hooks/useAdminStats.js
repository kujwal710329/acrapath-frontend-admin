"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/utilities/api";

/**
 * Hook to fetch admin overview stats from GET /api/v1/admin/stats
 * @param {{ startDate?: string, endDate?: string }} params - Optional YYYY-MM-DD date strings
 */
export function useAdminStats({ startDate, endDate } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (startDate) query.set("startDate", startDate);
      if (endDate) query.set("endDate", endDate);
      const qs = query.toString() ? `?${query}` : "";

      const res = await apiRequest(
        `/admin/stats${qs}`,
        {},
        { useCache: false }
      );

      if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}

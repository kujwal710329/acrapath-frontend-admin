"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAllMetadata,
  addMetadataItem,
  removeMetadataItem,
  updateMetadata,
  seedAllMetadata,
} from "@/services/metadata.service";
import { logger } from "@/utilities/logger";
import { showSuccess, showError } from "@/utilities/toast";

// ── Module-level cache (used by useMetadataData) ──────────────────────────────
// Shared across every hook instance so metadata is fetched only once per session.
// React Strict Mode double-invokes are also deduplicated via the inflight promise.
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const EMPTY_METADATA = Object.freeze({
  jobCategories: [],
  jobRolesByCategory: {},
  strategicSkillsByCategory: {},
  techSkillsByCategory: {},
  fieldsOfStudy: [],
  commonJobRoles: [],
  jobCategoryApiMap: {},
});

let cachedData = null;
let cacheExpiresAt = 0;
let inflight = null; // deduplicates concurrent fetches

function fetchAllMetadata() {
  const now = Date.now();

  // 1. Serve from warm cache
  if (cachedData && now < cacheExpiresAt) {
    return Promise.resolve(cachedData);
  }

  // 2. Re-use an already in-flight request
  if (inflight) {
    return inflight;
  }

  // 3. Issue new network request via the shared admin service
  inflight = getAllMetadata()
    .then((res) => {
      cachedData = res?.data ?? EMPTY_METADATA;
      cacheExpiresAt = Date.now() + CACHE_TTL;
      return cachedData;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/**
 * Valid metadata type keys returned from the API
 */
export const METADATA_TYPES = [
  "jobCategories",
  "jobCategoryApiMap",
  "jobRolesByCategory",
  "techSkillsByCategory",
  "strategicSkillsByCategory",
  "commonJobRoles",
  "fieldsOfStudy",
];

/** Types whose values are plain arrays of strings */
export const ARRAY_TYPES = new Set([
  "jobCategories",
  "commonJobRoles",
  "fieldsOfStudy",
]);

/** Types whose values are objects { key: string[] | string } */
export const OBJECT_TYPES = new Set([
  "jobCategoryApiMap",
  "jobRolesByCategory",
  "techSkillsByCategory",
  "strategicSkillsByCategory",
]);

/**
 * Manages all metadata state and operations for the admin Metadata page.
 */
export function useMetadata() {
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Per-action pending flags keyed by a string descriptor
  const [pending, setPending] = useState({});
  const reqIdRef = useRef(0);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    const id = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getAllMetadata();
      if (reqIdRef.current !== id) return;
      setAllData(result?.data ?? {});
      logger.debug("[useMetadata] loaded all data");
    } catch (err) {
      if (reqIdRef.current !== id) return;
      logger.error("[useMetadata] load error", { error: err.message });
      setError(err.message || "Failed to load metadata");
    } finally {
      if (reqIdRef.current === id) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const startPending = (key) =>
    setPending((prev) => ({ ...prev, [key]: true }));
  const stopPending = (key) =>
    setPending((prev) => ({ ...prev, [key]: false }));

  // ─── Add item (array type) ────────────────────────────────────────────────

  const addItem = useCallback(
    async (type, item) => {
      const trimmed = item.trim();
      if (!trimmed) return;

      const current = allData[type] ?? [];
      if (Array.isArray(current) && current.includes(trimmed)) {
        showError(`"${trimmed}" already exists in ${type}`);
        return;
      }

      const key = `add-${type}`;
      startPending(key);
      try {
        await addMetadataItem(type, trimmed);
        showSuccess(`Added "${trimmed}" to ${type}`);
        await load();
      } catch {
        // error toast handled by apiRequest
      } finally {
        stopPending(key);
      }
    },
    [allData, load]
  );

  // ─── Remove item (array type) ─────────────────────────────────────────────

  const removeItem = useCallback(
    async (type, item) => {
      const key = `remove-${type}-${item}`;
      startPending(key);
      try {
        await removeMetadataItem(type, item);
        showSuccess(`Removed "${item}" from ${type}`);
        await load();
      } catch {
        // error toast handled by apiRequest
      } finally {
        stopPending(key);
      }
    },
    [load]
  );

  // ─── Add item to object sub-array ─────────────────────────────────────────

  const addItemToCategory = useCallback(
    async (type, category, item) => {
      const trimmed = item.trim();
      if (!trimmed) return;

      const obj = allData[type] ?? {};
      const arr = obj[category];
      if (Array.isArray(arr) && arr.includes(trimmed)) {
        showError(`"${trimmed}" already exists in ${category}`);
        return;
      }

      // For object types, the API accepts { item: { key, value } } or similar.
      // We send { item: { category, value } } — backend determines structure.
      const key = `add-${type}-${category}`;
      startPending(key);
      try {
        await addMetadataItem(type, { category, value: trimmed });
        showSuccess(`Added "${trimmed}" to ${category}`);
        await load();
      } catch {
        // error toast handled by apiRequest
      } finally {
        stopPending(key);
      }
    },
    [allData, load]
  );

  // ─── Remove item from object sub-array ───────────────────────────────────

  const removeItemFromCategory = useCallback(
    async (type, category, item) => {
      const key = `remove-${type}-${category}-${item}`;
      startPending(key);
      try {
        await removeMetadataItem(type, { category, value: item });
        showSuccess(`Removed "${item}" from ${category}`);
        await load();
      } catch {
        // error toast handled by apiRequest
      } finally {
        stopPending(key);
      }
    },
    [load]
  );

  // ─── Replace all (PUT) ────────────────────────────────────────────────────

  const replaceAll = useCallback(
    async (type, values) => {
      const key = `replace-${type}`;
      startPending(key);
      try {
        await updateMetadata(type, values);
        showSuccess(`${type} replaced successfully`);
        await load();
      } catch {
        // error toast handled by apiRequest
      } finally {
        stopPending(key);
      }
    },
    [load]
  );

  // ─── Seed all ─────────────────────────────────────────────────────────────

  const seedAll = useCallback(
    async (payload) => {
      const key = "seed-all";
      startPending(key);
      try {
        await seedAllMetadata(payload);
        showSuccess("All metadata seeded successfully");
        await load();
      } catch {
        // error toast handled by apiRequest
      } finally {
        stopPending(key);
      }
    },
    [load]
  );

  // ─── isPending helper ─────────────────────────────────────────────────────

  const isPending = useCallback(
    (key) => !!pending[key],
    [pending]
  );

  return {
    allData,
    loading,
    error,
    refresh: load,
    addItem,
    removeItem,
    addItemToCategory,
    removeItemFromCategory,
    replaceAll,
    seedAll,
    isPending,
  };
}

/**
 * Read-only hook that returns all metadata from GET /api/v1/metadata/all.
 *
 * This is intentionally separate from `useMetadata` (the admin CRUD management
 * hook). This hook is designed for form components that only need to read data.
 *
 * Fetched once per session (module-level cache, 5-min TTL).
 * Safe defaults are returned immediately so consumers never receive undefined.
 *
 * @returns {{
 *   metadata: {
 *     jobCategories: string[],
 *     jobRolesByCategory: Record<string, string[]>,
 *     strategicSkillsByCategory: Record<string, string[]>,
 *     techSkillsByCategory: Record<string, string[]>,
 *     fieldsOfStudy: string[],
 *     commonJobRoles: string[],
 *     jobCategoryApiMap: Record<string, string>,
 *   },
 *   loading: boolean,
 *   error: string | null,
 * }}
 */
export function useMetadataData() {
  const isCacheWarm = cachedData !== null && Date.now() < cacheExpiresAt;

  const [metadata, setMetadata] = useState(isCacheWarm ? cachedData : EMPTY_METADATA);
  const [loading, setLoading] = useState(!isCacheWarm);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Already have fresh data — nothing to do
    if (cachedData && Date.now() < cacheExpiresAt) {
      setMetadata(cachedData);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAllMetadata()
      .then((data) => {
        if (cancelled) return;
        setMetadata(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Failed to load metadata. Please refresh the page.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { metadata, loading, error };
}

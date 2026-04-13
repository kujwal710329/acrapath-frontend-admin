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

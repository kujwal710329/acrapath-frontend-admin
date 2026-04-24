"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchBooksAdmin,
  createBook,
  updateBook,
  updateBookCover,
  deleteBook,
  uploadToS3,
} from "@/services/library.service";
import { DEBOUNCE_CONFIG } from "@/utilities/config";
import { logger } from "@/utilities/logger";
import { showSuccess, showError } from "@/utilities/toast";

const DEFAULT_PAGINATION = {
  page: 1,
  totalPages: 1,
  totalCount: 0,
  hasPrevPage: false,
  hasNextPage: false,
};

function tabToIsActive(tab) {
  if (tab === "active") return true;
  if (tab === "inactive") return false;
  return undefined; // "all" — no filter
}

/**
 * Manages fetching, pagination, search, toggle-active, and CRUD
 * for the Library admin section.
 *
 * Search is performed client-side against the current page because
 * the manage-all endpoint does not expose a search param.
 */
export function useLibrary({ tab, perPage }) {
  const [allRows, setAllRows] = useState([]); // raw rows from API
  const [rows, setRows] = useState([]);        // filtered rows shown in table
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const reqIdRef = useRef(0);
  const curRef = useRef({ page: 1, search: "" });
  const debounceRef = useRef(null);
  // Tracks IDs soft-deleted this session so they don't reappear on Refresh.
  // The backend DELETE is a soft-delete (sets isActive=false), so manage-all
  // still returns the record. This ref keeps them hidden until page navigation.
  const deletedIdsRef = useRef(new Set());

  const applySearch = useCallback((books, query) => {
    if (!query.trim()) return books;
    const q = query.trim().toLowerCase();
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.authorName?.toLowerCase().includes(q)
    );
  }, []);

  const load = useCallback(
    async (nextPage, nextSearch) => {
      const id = ++reqIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const isActive = tabToIsActive(tab);
        const result = await fetchBooksAdmin({
          page: nextPage,
          limit: perPage,
          isActive,
        });

        if (reqIdRef.current !== id) return;

        const raw = result?.data?.books ?? [];
        // Filter out IDs deleted this session (soft-delete leaves the record
        // in the DB; without this they reappear on every Refresh).
        const books = raw.filter((b) => !deletedIdsRef.current.has(b._id));
        setAllRows(books);
        setRows(applySearch(books, nextSearch));

        const pag = result?.data?.pagination ?? {};
        setPagination({
          page: pag.page ?? nextPage,
          totalPages: pag.totalPages ?? 1,
          totalCount: pag.total ?? 0,
          hasPrevPage: pag.hasPrevPage ?? false,
          hasNextPage: pag.hasNextPage ?? false,
        });
        logger.debug("[useLibrary] loaded", {
          count: books.length,
          tab,
          page: nextPage,
        });
      } catch (err) {
        if (reqIdRef.current !== id) return;
        logger.error("[useLibrary] load error", { error: err.message });
        setError(err.message || "Failed to load books");
        setAllRows([]);
        setRows([]);
      } finally {
        if (reqIdRef.current === id) setLoading(false);
      }
    },
    [tab, perPage, applySearch]
  );

  // Reset + reload whenever tab or perPage changes
  useEffect(() => {
    curRef.current = { page: 1, search: "" };
    setPage(1);
    setSearch("");
    clearTimeout(debounceRef.current);
    load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, perPage]);

  // Refresh event listener
  useEffect(() => {
    const handleRefresh = () =>
      load(curRef.current.page, curRef.current.search);
    window.addEventListener("admin-refresh", handleRefresh);
    return () => window.removeEventListener("admin-refresh", handleRefresh);
  }, [load]);

  const goToPage = useCallback(
    (nextPage) => {
      curRef.current.page = nextPage;
      setPage(nextPage);
      load(nextPage, curRef.current.search);
    },
    [load]
  );

  const handleSearch = useCallback(
    (query) => {
      curRef.current.search = query;
      setSearch(query);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // Filter client-side against already-fetched rows
        setRows(applySearch(allRows, query));
      }, DEBOUNCE_CONFIG.SEARCH_DELAY ?? 500);
    },
    [allRows, applySearch]
  );

  const refresh = useCallback(() => {
    load(curRef.current.page, curRef.current.search);
  }, [load]);

  /**
   * Toggle isActive for a book — optimistic update, rollback on failure.
   */
  const toggleActive = useCallback(async (bookId) => {
    let previousAllRows;
    let previousRows;
    const flip = (list) =>
      list.map((r) =>
        r._id === bookId ? { ...r, isActive: !r.isActive } : r
      );

    setAllRows((prev) => { previousAllRows = prev; return flip(prev); });
    setRows((prev) => { previousRows = prev; return flip(prev); });

    try {
      const targetBook = previousAllRows.find((r) => r._id === bookId);
      const result = await updateBook(bookId, { isActive: !targetBook?.isActive });
      const serverValue = result?.data?.book?.isActive;
      if (serverValue !== undefined) {
        const reconcile = (list) =>
          list.map((r) =>
            r._id === bookId ? { ...r, isActive: serverValue } : r
          );
        setAllRows(reconcile);
        setRows(reconcile);
      }
      showSuccess(result?.message ?? "Book status updated");
      logger.debug("[useLibrary] active toggled", { bookId });
    } catch (err) {
      setAllRows(previousAllRows);
      setRows(previousRows);
      showError(err.message || "Failed to update book status");
      logger.error("[useLibrary] toggle active failed", { error: err.message });
    }
  }, []);

  /**
   * Create a book:
   *   1. POST metadata → backend returns presigned PUT URLs
   *   2. Upload document (and optional cover) to S3
   *
   * Callers are responsible for showing per-upload progress;
   * this function handles the full orchestration and throws on any failure.
   */
  const addBook = useCallback(
    async ({ formData, coverFile, documentFile, onProgress }) => {
      const payload = {
        title: formData.title.trim(),
        authorName: formData.authorName.trim(),
        category: formData.category,
        documentFileName: documentFile.name,
      };
      if (formData.pages !== "" && formData.pages !== undefined)
        payload.pages = Number(formData.pages);
      if (formData.description?.trim())
        payload.description = formData.description.trim();
      if (coverFile) payload.coverFileName = coverFile.name;

      onProgress?.("metadata");
      const result = await createBook(payload);
      const { documentUploadUrl, coverUploadUrl } = result?.data ?? {};

      onProgress?.("document");
      await uploadToS3(documentUploadUrl, documentFile);

      if (coverFile && coverUploadUrl) {
        onProgress?.("cover");
        await uploadToS3(coverUploadUrl, coverFile);
      }

      showSuccess("Book added successfully");
      logger.debug("[useLibrary] book created", { id: result?.data?.bookId });
      load(curRef.current.page, curRef.current.search);
      return result;
    },
    [load]
  );

  /**
   * Update book metadata and optionally replace the cover image.
   * Reconciles the updated row from the server response.
   */
  const editBook = useCallback(
    async (bookId, { formData, newCoverFile, onProgress }) => {
      const updates = {};
      if (formData.title !== undefined) updates.title = formData.title.trim();
      if (formData.authorName !== undefined)
        updates.authorName = formData.authorName.trim();
      if (formData.category !== undefined) updates.category = formData.category;
      if (formData.pages !== undefined)
        updates.pages =
          formData.pages === "" ? 0 : Number(formData.pages);
      if (formData.description !== undefined)
        updates.description = formData.description;

      onProgress?.("metadata");
      const result = await updateBook(bookId, updates);

      if (newCoverFile) {
        onProgress?.("cover");
        const coverResult = await updateBookCover(bookId, {
          coverFileName: newCoverFile.name,
        });
        const { coverUploadUrl } = coverResult?.data ?? {};
        if (coverUploadUrl) {
          await uploadToS3(coverUploadUrl, newCoverFile);
        }
      }

      const updatedBook = result?.data?.book;
      if (updatedBook) {
        const reconcile = (list) =>
          list.map((r) => (r._id === bookId ? { ...r, ...updatedBook } : r));
        setAllRows(reconcile);
        setRows(reconcile);
      }

      showSuccess(result?.message ?? "Book updated successfully");
      logger.debug("[useLibrary] book updated", { bookId });
      return result;
    },
    []
  );

  /**
   * Soft-delete a book — optimistic removal, rollback on failure.
   */
  const removeBook = useCallback(async (bookId) => {
    let previousAllRows;
    let previousRows;
    setAllRows((prev) => { previousAllRows = prev; return prev.filter((r) => r._id !== bookId); });
    setRows((prev) => { previousRows = prev; return prev.filter((r) => r._id !== bookId); });

    try {
      await deleteBook(bookId);
      // Remember this ID so load() keeps filtering it out on every Refresh.
      deletedIdsRef.current.add(bookId);
      showSuccess("Book deleted successfully");
      logger.debug("[useLibrary] book deleted", { bookId });
    } catch (err) {
      setAllRows(previousAllRows);
      setRows(previousRows);
      showError(err.message || "Failed to delete book");
      logger.error("[useLibrary] delete failed", { error: err.message });
    }
  }, []);

  return {
    rows,
    pagination,
    loading,
    error,
    page,
    search,
    goToPage,
    handleSearch,
    refresh,
    toggleActive,
    addBook,
    editBook,
    removeBook,
  };
}

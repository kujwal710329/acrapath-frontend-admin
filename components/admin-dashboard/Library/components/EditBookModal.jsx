"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { showError } from "@/utilities/toast";
import Heading from "@/components/common/Heading";
import Label from "@/components/common/Label";
import Button from "@/components/common/Button";
import CreatableSelect from "@/components/common/CreatableSelect";
import {
  BOOK_CATEGORY_OPTIONS,
  BOOK_CATEGORY_LABELS,
  LABEL_TO_BOOK_CATEGORY,
} from "@/constants/bookCategories";

// ─── Shared style tokens ──────────────────────────────────────────────────────

const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-all duration-200 placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError =
  "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-(--color-red)">{msg}</p>;
}

function Spinner({ white }) {
  return (
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full border-2 ${
        white ? "border-white border-t-transparent" : "border-(--color-primary) border-t-transparent"
      } animate-spin`}
      aria-label="Loading"
    />
  );
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PROGRESS_LABELS = {
  metadata: "Saving changes…",
  cover: "Uploading new cover image…",
};

function UploadProgress({ step }) {
  if (!step) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-(--color-primary-shade-100) border border-(--color-primary-shade-200) px-4 py-3">
      <Spinner />
      <span className="text-14 text-(--color-primary) font-medium">
        {PROGRESS_LABELS[step] ?? "Processing…"}
      </span>
    </div>
  );
}

// ─── Cover image section (show existing + optional replacement) ───────────────

const COVER_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
const COVER_MAX_BYTES = 5 * 1024 * 1024;

function CoverSection({ existingUrl, newFile, newPreview, onSelectNew, onClearNew, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const validate = (f) => {
    if (!f.type.startsWith("image/")) return "Cover must be an image file (JPG, PNG, or WEBP)";
    if (f.size > COVER_MAX_BYTES) return `Cover image must be under 5 MB (selected: ${formatBytes(f.size)})`;
    return null;
  };

  const handleFile = (f) => {
    if (!f) return;
    const err = validate(f);
    if (err) { showError(err); return; }
    onSelectNew(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const displayPreview = newPreview ?? existingUrl;

  return (
    <div className="flex items-start gap-4">
      {/* Preview (existing or new) */}
      {displayPreview ? (
        <div className="relative shrink-0">
          <img
            src={displayPreview}
            alt="Book cover"
            className={`h-32 w-24 rounded-xl object-cover border-2 ${
              newPreview
                ? "border-(--color-primary)"
                : "border-(--color-black-shade-200)"
            }`}
          />
          {newFile && (
            <button
              type="button"
              onClick={onClearNew}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-(--color-black-shade-200) flex items-center justify-center text-(--color-black-shade-500) hover:text-(--color-red) hover:border-(--color-red) transition-colors cursor-pointer shadow-sm"
              aria-label="Undo cover replacement"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {newFile && (
            <p className="mt-1.5 text-11 text-(--color-primary) font-medium">New cover</p>
          )}
        </div>
      ) : null}

      {/* Replacement upload zone */}
      <div className="flex-1">
        <p className="text-13 text-(--color-black-shade-500) mb-2">
          {displayPreview ? "Replace cover (optional)" : "Upload cover (optional)"}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full h-20 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer text-13 ${
            dragging
              ? "border-(--color-primary) bg-(--color-primary-shade-100) text-(--color-primary)"
              : "border-(--color-black-shade-200) text-(--color-black-shade-500) hover:border-(--color-primary) hover:bg-(--color-primary-shade-100)"
          }`}
          aria-label="Upload replacement cover image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Click or drag image here</span>
          <span className="text-12 text-(--color-black-shade-400)">JPG, PNG, WEBP · max 5 MB</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={COVER_ACCEPT}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {error && <FieldError msg={error} />}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function EditBookModal({ open, book, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    authorName: "",
    category: "",
    pages: "",
    description: "",
  });
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newCoverPreview, setNewCoverPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState(null);
  const [errors, setErrors] = useState({});

  // Sync form when book changes or modal opens
  useEffect(() => {
    if (open && book) {
      setForm({
        title: book.title ?? "",
        authorName: book.authorName ?? "",
        category: BOOK_CATEGORY_LABELS[book.category] ?? book.category ?? "",
        pages: book.pages > 0 ? String(book.pages) : "",
        description: book.description ?? "",
      });
      setNewCoverFile(null);
      setNewCoverPreview(null);
      setSubmitting(false);
      setUploadStep(null);
      setErrors({});
    }
  }, [open, book]);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (newCoverPreview) URL.revokeObjectURL(newCoverPreview);
    };
  }, [newCoverPreview]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape" && !submitting) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, submitting]);

  const set = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleNewCoverSelect = useCallback((file) => {
    setNewCoverFile(file);
    const url = URL.createObjectURL(file);
    setNewCoverPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
  }, []);

  const handleNewCoverClear = useCallback(() => {
    setNewCoverFile(null);
    setNewCoverPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    else if (form.title.trim().length > 200) errs.title = "Title must be 200 characters or less";
    if (!form.authorName.trim()) errs.authorName = "Author name is required";
    else if (form.authorName.trim().length < 2) errs.authorName = "Author name must be at least 2 characters";
    if (!form.category) errs.category = "Category is required";
    if (form.pages !== "" && form.pages !== undefined) {
      const n = Number(form.pages);
      if (!Number.isInteger(n) || n < 0 || n > 50000)
        errs.pages = "Pages must be a whole number between 0 and 50,000";
    }
    if (form.description.length > 2000)
      errs.description = "Description must be 2,000 characters or less";
    return errs;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errs = validate();
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setSubmitting(true);
      setUploadStep(null);
      try {
        await onSubmit(book._id, {
          formData: {
            ...form,
            category: LABEL_TO_BOOK_CATEGORY[form.category] ?? form.category,
          },
          newCoverFile: newCoverFile ?? null,
          onProgress: setUploadStep,
        });
        onClose();
      } catch (err) {
        showError(err.message || "Failed to update book");
      } finally {
        setSubmitting(false);
        setUploadStep(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, newCoverFile, book, onSubmit, onClose]
  );

  if (!open || !book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-2xl bg-(--pure-white) shadow-2xl border border-(--color-black-shade-100) flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-black-shade-100)">
          <Heading as="h2" className="text-16">
            Edit Book
          </Heading>
          <button
            type="button"
            onClick={() => { if (!submitting) onClose(); }}
            disabled={submitting}
            className="h-8 w-8 flex items-center justify-center rounded-full text-(--color-black-shade-400) hover:bg-(--color-black-shade-100) hover:text-(--color-black-shade-800) active:bg-(--color-black-shade-200) transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-18"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Upload progress */}
            <UploadProgress step={uploadStep} />

            {/* Cover section */}
            <div>
              <Label className="mb-2!">Cover Image</Label>
              <CoverSection
                existingUrl={book.coverImageUrl ?? null}
                newFile={newCoverFile}
                newPreview={newCoverPreview}
                onSelectNew={handleNewCoverSelect}
                onClearNew={handleNewCoverClear}
                error={errors.cover}
              />
            </div>

            {/* Title */}
            <div>
              <Label required className="mb-2!">Title</Label>
              <input
                type="text"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Performance Marketing Interview Questions"
                maxLength={200}
                className={`${inputBase} ${errors.title ? inputError : inputNormal}`}
              />
              <FieldError msg={errors.title} />
            </div>

            {/* Author */}
            <div>
              <Label required className="mb-2!">Author</Label>
              <input
                type="text"
                value={form.authorName}
                onChange={set("authorName")}
                placeholder="e.g. John Doe"
                maxLength={100}
                className={`${inputBase} ${errors.authorName ? inputError : inputNormal}`}
              />
              <FieldError msg={errors.authorName} />
            </div>

            {/* Category + Pages */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required className="mb-2!">Category</Label>
                <CreatableSelect
                  options={BOOK_CATEGORY_OPTIONS}
                  value={form.category}
                  onChange={(v) => {
                    setForm((prev) => ({ ...prev, category: v }));
                    setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  placeholder="Select category"
                  allowCreate={false}
                  showAllOnOpen={true}
                  className="mb-0!"
                />
                <FieldError msg={errors.category} />
              </div>
              <div>
                <Label className="mb-2!">Pages</Label>
                <input
                  type="number"
                  value={form.pages}
                  onChange={set("pages")}
                  placeholder="e.g. 120"
                  min={0}
                  max={50000}
                  className={`${inputBase} ${errors.pages ? inputError : inputNormal}`}
                />
                <FieldError msg={errors.pages} />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="mb-2!">Description</Label>
              <textarea
                value={form.description}
                onChange={set("description")}
                placeholder="Brief description of the book…"
                rows={4}
                maxLength={2000}
                className={`w-full rounded-xl border px-5 py-3.5 text-[0.9375rem] font-medium outline-none transition-all duration-200 resize-none placeholder:text-(--color-black-shade-400) ${
                  errors.description
                    ? "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)"
                    : "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)"
                }`}
              />
              <div className="flex items-center justify-between mt-0.5">
                <FieldError msg={errors.description} />
                <span
                  className={`text-12 ml-auto tabular-nums font-medium transition-colors ${
                    form.description.length >= 1800
                      ? "text-(--color-red)"
                      : form.description.length >= 1500
                      ? "text-amber-500"
                      : "text-(--color-black-shade-400)"
                  }`}
                >
                  {form.description.length}/2000
                </span>
              </div>
            </div>

            {/* Document info — read-only (no replacement endpoint) */}
            <div className="rounded-xl border border-(--color-black-shade-200) bg-(--color-black-shade-50) px-4 py-3 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 shrink-0" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-13 text-(--color-black-shade-600) font-medium">PDF document</p>
                <p className="text-12 text-(--color-black-shade-400)">
                  Document replacement is not supported. Delete and re-upload the book to change the PDF.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-(--color-black-shade-100) flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { if (!submitting) onClose(); }}
              disabled={submitting}
              className="w-auto! px-6 h-10!"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-auto! px-6 h-10!"
            >
              {submitting && <Spinner white />}
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { showError } from "@/utilities/toast";
import Heading from "@/components/common/Heading";
import Label from "@/components/common/Label";
import Button from "@/components/common/Button";
import CreatableSelect from "@/components/common/CreatableSelect";
import {
  BOOK_CATEGORY_OPTIONS,
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

// ─── File size formatter ──────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Image file drop zone ─────────────────────────────────────────────────────

const COVER_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
const COVER_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function CoverUploadZone({ file, preview, onSelect, onClear, error }) {
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
    onSelect(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  if (preview) {
    return (
      <div className="relative w-24">
        <img
          src={preview}
          alt="Cover preview"
          className="h-32 w-24 rounded-xl object-cover border-2 border-(--color-primary-shade-200)"
        />
        <button
          type="button"
          onClick={onClear}
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-(--color-black-shade-200) flex items-center justify-center text-(--color-black-shade-500) hover:text-(--color-red) hover:border-(--color-red) transition-colors cursor-pointer shadow-sm"
          aria-label="Remove cover image"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <p className="mt-2 text-11 text-(--color-black-shade-500) truncate max-w-24" title={file?.name}>
          {file?.name}
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full h-28 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer ${
          dragging
            ? "border-(--color-primary) bg-(--color-primary-shade-100)"
            : error
            ? "border-(--color-red) bg-red-50"
            : "border-(--color-black-shade-200) hover:border-(--color-primary) hover:bg-(--color-primary-shade-100)"
        }`}
        aria-label="Upload cover image"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-black-shade-400)" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-13 text-(--color-black-shade-500)">
          Click or drag cover image here
        </span>
        <span className="text-12 text-(--color-black-shade-400)">
          JPG, PNG, WEBP · max 5 MB
        </span>
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
  );
}

// ─── PDF file drop zone ───────────────────────────────────────────────────────

const PDF_MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function DocumentUploadZone({ file, onSelect, onClear, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const validate = (f) => {
    if (f.type !== "application/pdf") return "Document must be a PDF file";
    if (f.size > PDF_MAX_BYTES) return `PDF must be under 50 MB (selected: ${formatBytes(f.size)})`;
    return null;
  };

  const handleFile = (f) => {
    if (!f) return;
    const err = validate(f);
    if (err) { showError(err); return; }
    onSelect(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-(--color-black-shade-200) bg-(--color-black-shade-50) px-4 py-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-14 font-medium text-(--color-black-shade-800) truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-12 text-(--color-black-shade-500)">
            {formatBytes(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="h-7 w-7 flex items-center justify-center rounded-full text-(--color-black-shade-400) hover:text-(--color-red) hover:bg-red-50 transition-colors cursor-pointer"
          aria-label="Remove document"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full h-28 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer ${
          dragging
            ? "border-(--color-primary) bg-(--color-primary-shade-100)"
            : error
            ? "border-(--color-red) bg-red-50"
            : "border-(--color-black-shade-200) hover:border-(--color-primary) hover:bg-(--color-primary-shade-100)"
        }`}
        aria-label="Upload PDF document"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-black-shade-400)" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span className="text-13 text-(--color-black-shade-500)">
          Click or drag PDF here
        </span>
        <span className="text-12 text-(--color-black-shade-400)">
          PDF only · max 50 MB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <FieldError msg={error} />}
    </div>
  );
}

// ─── Upload progress indicator ────────────────────────────────────────────────

const PROGRESS_LABELS = {
  metadata: "Saving book details…",
  document: "Uploading PDF document…",
  cover: "Uploading cover image…",
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

// ─── Modal ────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  authorName: "",
  category: "",
  pages: "",
  description: "",
};

export default function AddBookModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState(null);
  const [errors, setErrors] = useState({});

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setCoverFile(null);
      setCoverPreview(null);
      setDocumentFile(null);
      setSubmitting(false);
      setUploadStep(null);
      setErrors({});
    }
  }, [open]);

  // Close on Escape (disabled while uploading)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, submitting]);

  const set = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleCoverSelect = useCallback((file) => {
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    setErrors((prev) => ({ ...prev, cover: undefined }));
  }, []);

  const handleCoverClear = useCallback(() => {
    setCoverFile(null);
    setCoverPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    else if (form.title.trim().length > 200) errs.title = "Title must be 200 characters or less";
    if (!form.authorName.trim()) errs.authorName = "Author name is required";
    else if (form.authorName.trim().length < 2) errs.authorName = "Author name must be at least 2 characters";
    if (!form.category) errs.category = "Category is required";
    if (!documentFile) errs.document = "A PDF document is required";
    if (form.pages !== "" && form.pages !== undefined) {
      const n = Number(form.pages);
      if (!Number.isInteger(n) || n < 0 || n > 50000) errs.pages = "Pages must be a whole number between 0 and 50,000";
    }
    if (form.description.length > 2000) errs.description = "Description must be 2,000 characters or less";
    return errs;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errs = validate();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setSubmitting(true);
      setUploadStep(null);
      try {
        await onSubmit({
          formData: {
            ...form,
            category: LABEL_TO_BOOK_CATEGORY[form.category] ?? form.category,
          },
          coverFile: coverFile ?? null,
          documentFile,
          onProgress: setUploadStep,
        });
        onClose();
      } catch (err) {
        showError(err.message || "Failed to add book");
      } finally {
        setSubmitting(false);
        setUploadStep(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, coverFile, documentFile, onSubmit, onClose]
  );

  if (!open) return null;

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
            Add Book
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

            {/* Cover image + Title/Author row */}
            <div className="flex gap-4 items-start">
              {/* Cover image */}
              <div className="shrink-0">
                <Label className="mb-2!">Cover Image</Label>
                <CoverUploadZone
                  file={coverFile}
                  preview={coverPreview}
                  onSelect={handleCoverSelect}
                  onClear={handleCoverClear}
                  error={errors.cover}
                />
              </div>

              {/* Title + Author stacked */}
              <div className="flex-1 flex flex-col gap-4">
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
              </div>
            </div>

            {/* Category + Pages row */}
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

            {/* Document upload */}
            <div>
              <Label required className="mb-2!">PDF Document</Label>
              <DocumentUploadZone
                file={documentFile}
                onSelect={(f) => {
                  setDocumentFile(f);
                  setErrors((prev) => ({ ...prev, document: undefined }));
                }}
                onClear={() => setDocumentFile(null)}
                error={errors.document}
              />
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
              {submitting ? "Uploading…" : "Add Book"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

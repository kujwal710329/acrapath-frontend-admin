"use client";

import { useState, useCallback, useEffect } from "react";
import { showError } from "@/utilities/toast";
import Heading from "@/components/common/Heading";
import Label from "@/components/common/Label";
import Button from "@/components/common/Button";
import CreatableSelect from "@/components/common/CreatableSelect";

const EMPTY_FORM = {
  userName: "",
  userRole: "Employee",
  designation: "",
  companyName: "",
  title: "",
  content: "",
  rating: 5,
};

const ROLE_OPTIONS = ["Employee", "Employer"];

// ── Shared input style helpers (matches JobPost pattern) ──────────────────────
const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError =
  "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-(--color-red)">{msg}</p>;
}

function RatingPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition-colors cursor-pointer ${
            n <= value ? "text-amber-400" : "text-(--color-black-shade-200)"
          }`}
          aria-label={`Rate ${n}`}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
      <span className="ml-2 text-14 text-(--color-black-shade-500)">{value} / 5</span>
    </div>
  );
}

export default function CreateTestimonialModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form each time modal opens
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    else if (form.title.trim().length < 5) errs.title = "Title must be at least 5 characters";
    if (!form.content.trim()) errs.content = "Content is required";
    else if (form.content.trim().length < 10) errs.content = "Content must be at least 10 characters";
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
      try {
        await onSubmit({
          title: form.title.trim(),
          content: form.content.trim(),
          rating: form.rating,
          userName: form.userName.trim() || undefined,
          designation: form.designation.trim() || undefined,
          companyName: form.companyName.trim() || undefined,
          userRole: form.userRole?.toLowerCase() || undefined,
        });
        onClose();
      } catch (err) {
        showError(err.message || "Failed to create testimonial");
      } finally {
        setSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, onSubmit, onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl bg-(--pure-white) shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-black-shade-100)">
          <Heading as="h2" className="text-16">
            Create Testimonial
          </Heading>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full text-(--color-black-shade-500) hover:bg-(--color-black-shade-100) transition-colors cursor-pointer text-18"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Name + Role row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="mb-4!">Name</Label>
                <input
                  type="text"
                  value={form.userName}
                  onChange={set("userName")}
                  placeholder="Michael Brown"
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
              <div className="w-40">
                <Label className="mb-4!">Role</Label>
                <CreatableSelect
                  options={ROLE_OPTIONS}
                  allowCreate={false}
                  showAllOnOpen
                  value={form.userRole}
                  onChange={(val) => setForm((prev) => ({ ...prev, userRole: val }))}
                  className="mb-0!"
                />
              </div>
            </div>

            {/* Designation + Company row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="mb-4!">Designation</Label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={set("designation")}
                  placeholder="UI/UX Designer"
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
              <div className="flex-1">
                <Label className="mb-4!">Company</Label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={set("companyName")}
                  placeholder="Creative Labs"
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label required className="mb-4!">Title</Label>
              <input
                type="text"
                value={form.title}
                onChange={set("title")}
                placeholder="Good work-life balance"
                className={`${inputBase} ${errors.title ? inputError : inputNormal}`}
              />
              <FieldError msg={errors.title} />
            </div>

            {/* Content */}
            <div>
              <Label required className="mb-4!">Content</Label>
              <textarea
                value={form.content}
                onChange={set("content")}
                placeholder="Flexible hours and a healthy work environment make this a great place to work."
                rows={4}
                className={`w-full rounded-xl border px-5 py-3.5 text-[0.9375rem] font-medium outline-none transition-colors resize-none placeholder:text-(--color-black-shade-400) ${
                  errors.content
                    ? "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)"
                    : "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)"
                }`}
              />
              <div className="flex items-center justify-between mt-0.5">
                <FieldError msg={errors.content} />
                <span className="text-12 text-(--color-black-shade-400) ml-auto">
                  {form.content.length}/1000
                </span>
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label className="mb-4!">Rating</Label>
              <RatingPicker
                value={form.rating}
                onChange={(val) => setForm((prev) => ({ ...prev, rating: val }))}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-(--color-black-shade-100) flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
              {submitting && (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              {submitting ? "Creating…" : "Create Testimonial"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

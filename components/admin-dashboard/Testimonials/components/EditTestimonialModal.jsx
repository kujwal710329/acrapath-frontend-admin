"use client";

import { useState, useCallback, useEffect } from "react";
import { showError } from "@/utilities/toast";
import Heading from "@/components/common/Heading";
import Label from "@/components/common/Label";
import Button from "@/components/common/Button";

// ── Shared input style helpers (matches CreateTestimonialModal) ───────────────
const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-all duration-200 placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError =
  "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";
const inputReadOnly =
  "border-(--color-black-shade-200) bg-(--color-black-shade-50) text-(--color-black-shade-500) cursor-default";

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-(--color-red)">{msg}</p>;
}

function RatingPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? value;
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          className={`text-[1.75rem] leading-none transition-all duration-100 cursor-pointer hover:scale-110 active:scale-95 ${
            n <= display ? "text-amber-400" : "text-(--color-black-shade-200)"
          }`}
          aria-label={`Rate ${n}`}
        >
          ★
        </button>
      ))}
      <span className="ml-3 text-13 font-semibold text-(--color-black-shade-600) tabular-nums">{value} / 5</span>
    </div>
  );
}

// ── Shared user field resolvers ───────────────────────────────────────────────
function resolveCurrentExperience(user) {
  const work = user?.professionalInfo?.workExperience ?? [];
  const intern = user?.professionalInfo?.internshipExperience ?? [];
  // Prefer currentlyWorking, else most recent by joiningDate
  const sortedWork = [...work].sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
  const sortedIntern = [...intern].sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
  return (
    sortedWork.find((w) => w.currentlyWorking) ??
    sortedWork[0] ??
    sortedIntern.find((i) => i.currentlyWorking) ??
    sortedIntern[0] ??
    null
  );
}

function resolveDesignation(user) {
  if (!user) return "—";
  if (user.personalInfo?.currentDesignation) return user.personalInfo.currentDesignation;
  const exp = resolveCurrentExperience(user);
  return exp?.role || "—";
}

function resolveCompany(user) {
  if (!user) return "—";
  if (user.companyName) return user.companyName;
  const exp = resolveCurrentExperience(user);
  return exp?.companyName || "—";
}

// ── Read-only user info strip ─────────────────────────────────────────────────
function UserInfoStrip({ testimonial }) {
  const userId = testimonial?.userId;

  const name = userId
    ? (`${userId.firstName ?? ""} ${userId.lastName ?? ""}`.trim() || userId.email || "—")
    : "—";
  const role = userId?.role
    ? userId.role.charAt(0).toUpperCase() + userId.role.slice(1)
    : "—";
  const designation = resolveDesignation(userId);
  const company = resolveCompany(userId);

  return (
    <div className="rounded-xl border border-(--color-black-shade-200) bg-(--color-black-shade-50) px-4 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[0.9375rem] font-semibold text-(--color-black-shade-900) truncate">{name}</p>
          <span className="text-12 text-(--color-black-shade-300) shrink-0">·</span>
          <p className="text-12 text-(--color-black-shade-500) truncate">{userId?.email || "—"}</p>
        </div>
        <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-(--color-black-shade-400) bg-(--color-black-shade-100) rounded-md px-2 py-1 leading-none">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Read-only
        </span>
      </div>
      <div className="flex flex-wrap gap-2 pt-2.5 border-t border-(--color-black-shade-100)">
        {/* Role */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-(--color-black-shade-200) px-3 py-1.5 text-12 font-medium text-(--color-black-shade-700) shadow-sm">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-(--color-black-shade-400) shrink-0">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          {role}
        </span>
        {/* Designation */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-(--color-black-shade-200) px-3 py-1.5 text-12 font-medium text-(--color-black-shade-700) shadow-sm">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-(--color-black-shade-400) shrink-0">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          {designation}
        </span>
        {/* Company */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-(--color-black-shade-200) px-3 py-1.5 text-12 font-medium text-(--color-black-shade-700) shadow-sm">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-(--color-black-shade-400) shrink-0">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          {company}
        </span>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function EditTestimonialModal({ open, testimonial, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", content: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync form whenever testimonial changes or modal opens
  useEffect(() => {
    if (open && testimonial) {
      setForm({
        title: testimonial.title ?? "",
        content: testimonial.content ?? "",
        rating: testimonial.rating ?? 5,
      });
      setErrors({});
    }
  }, [open, testimonial]);

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
        await onSubmit(testimonial._id, {
          title: form.title.trim(),
          content: form.content.trim(),
          rating: form.rating,
        });
        onClose();
      } catch (err) {
        showError(err.message || "Failed to update testimonial");
      } finally {
        setSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, testimonial, onSubmit, onClose]
  );

  if (!open || !testimonial) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl bg-(--pure-white) shadow-2xl border border-(--color-black-shade-100) flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-black-shade-100)">
          <Heading as="h2" className="text-16">
            Edit Testimonial
          </Heading>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-(--color-black-shade-400) hover:bg-(--color-black-shade-100) hover:text-(--color-black-shade-800) active:bg-(--color-black-shade-200) transition-all duration-150 cursor-pointer text-18"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Read-only user info */}
            <div>
              <Label className="mb-4!">User</Label>
              <UserInfoStrip testimonial={testimonial} />
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
                className={`w-full rounded-xl border px-5 py-3.5 text-[0.9375rem] font-medium outline-none transition-all duration-200 resize-none placeholder:text-(--color-black-shade-400) ${
                  errors.content
                    ? "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)"
                    : "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)"
                }`}
              />
              <div className="flex items-center justify-between mt-0.5">
                <FieldError msg={errors.content} />
                <span className={`text-12 ml-auto tabular-nums transition-colors font-medium ${
                  form.content.length >= 900 ? "text-(--color-red)" :
                  form.content.length >= 700 ? "text-amber-500" :
                  "text-(--color-black-shade-400)"
                }`}>
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
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { showError } from "@/utilities/toast";
import Heading from "@/components/common/Heading";
import Label from "@/components/common/Label";
import Button from "@/components/common/Button";
import { searchUsersForTestimonial } from "@/services/testimonials.service";

const EMPTY_FORM = {
  title: "",
  content: "",
  rating: 5,
};

// ── Shared input style helpers ────────────────────────────────────────────────
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

// ── Async user search combobox ────────────────────────────────────────────────
function UserSearchDropdown({ selectedUser, onSelect, error }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openDropdown = () => {
    if (containerRef.current) {
      const { bottom } = containerRef.current.getBoundingClientRect();
      setDropUp(window.innerHeight - bottom < 260);
    }
    setOpen(true);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    openDropdown();
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchUsersForTestimonial(val);
        setResults(res?.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleFocus = async () => {
    openDropdown();
    if (results.length === 0 && !query) {
      setSearching(true);
      try {
        const res = await searchUsersForTestimonial("");
        setResults(res?.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }
  };

  const handleSelect = (user) => {
    onSelect(user);
    setQuery("");
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setResults([]);
  };

  const displayValue = selectedUser
    ? `${selectedUser.firstName ?? ""} ${selectedUser.lastName ?? ""}`.trim() ||
      selectedUser.email
    : query;

  let borderClass;
  if (error) {
    borderClass = "border-(--color-red) focus:border-(--color-red)";
  } else if (open) {
    borderClass = "border-(--color-primary)";
  } else {
    borderClass =
      "border-(--color-black-shade-300) hover:border-(--color-black-shade-400) focus:border-(--color-primary)";
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={selectedUser ? undefined : handleInputChange}
          onFocus={!selectedUser ? handleFocus : undefined}
          readOnly={!!selectedUser}
          placeholder="Search by name or email…"
          className={`${inputBase} ${selectedUser ? inputReadOnly + " pr-10" : borderClass + " pr-10"}`}
        />
        {selectedUser ? (
          <button
            type="button"
            aria-label="Clear selected user"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-black-shade-400) hover:text-(--color-black-shade-700) cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--color-black-shade-400)">
            {searching ? (
              <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-(--color-primary) border-t-transparent animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </span>
        )}
      </div>

      {open && !selectedUser && (
        <ul
          className={`absolute z-30 max-h-56 w-full overflow-auto rounded-xl border border-(--color-black-shade-100) bg-white py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.10)] ${
            dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {results.length > 0 ? (
            results.map((user) => {
              const fullName =
                `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—";
              const sub = [
                user.email,
                user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : null,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <li
                  key={user._id}
                  onMouseDown={() => handleSelect(user)}
                  className="mx-1.5 cursor-pointer rounded-lg px-3.5 py-2.5 hover:bg-(--color-black-shade-50) transition-colors"
                >
                  <p className="text-sm font-medium text-(--color-black-shade-900)">{fullName}</p>
                  <p className="text-xs text-(--color-black-shade-500)">{sub}</p>
                </li>
              );
            })
          ) : (
            <li className="px-5 py-3 text-sm text-(--color-black-shade-400)">
              {searching ? "Searching…" : "No users found"}
            </li>
          )}
        </ul>
      )}

      {error && <p className="mt-1.5 text-xs text-(--color-red)">{error}</p>}
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
function UserInfoStrip({ user }) {
  if (!user) return null;
  const role = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "—";
  const designation = resolveDesignation(user);
  const company = resolveCompany(user);

  return (
    <div className="rounded-xl border border-(--color-black-shade-200) bg-(--color-black-shade-50) px-4 py-3.5 flex flex-wrap gap-2">
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
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function CreateTestimonialModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form each time modal opens
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setSelectedUser(null);
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
    if (!selectedUser) errs.user = "Please select a user";
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
          userId: selectedUser._id,
          title: form.title.trim(),
          content: form.content.trim(),
          rating: form.rating,
        });
        onClose();
      } catch (err) {
        showError(err.message || "Failed to create testimonial");
      } finally {
        setSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, selectedUser, onSubmit, onClose]
  );

  if (!open) return null;

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
            Create Testimonial
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
            {/* User search */}
            <div>
              <Label required className="mb-4!">User</Label>
              <UserSearchDropdown
                selectedUser={selectedUser}
                onSelect={(u) => {
                  setSelectedUser(u);
                  setErrors((prev) => ({ ...prev, user: undefined }));
                }}
                error={errors.user}
              />
            </div>

            {/* Auto-populated user info (read-only) */}
            <UserInfoStrip user={selectedUser} />

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
              {submitting ? "Creating…" : "Create Testimonial"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

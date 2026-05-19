"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import RichTextEditor from "@/components/common/RichTextEditor";
import CreatableSelect from "@/components/common/CreatableSelect";
import Label from "@/components/common/Label";
import { SelectPill } from "@/components/admin-dashboard/JobPost/components/AddNewJobPost/pills";
import { TagInput } from "@/components/admin-dashboard/JobPost/components/AddNewJobPost/pills";
import TemplatePreviewCard from "./TemplatePreviewCard";

// ── Static options ────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = ["development", "marketing", "sales", "design", "consultancy"];
const CATEGORY_LABELS = {
  development: "Development",
  marketing: "Marketing",
  sales: "Sales",
  design: "Design",
  consultancy: "Consultancy",
};

const JOB_TYPE_OPTIONS = ["Full-time", "Part-time", "Freelance", "Contract"];
const LOCATION_TYPE_OPTIONS = ["Remote", "Onsite", "Hybrid"];
const JOB_SCHEDULE_OPTIONS = [
  "Monday to Friday",
  "Monday to Saturday",
  "Rotational Shift",
  "Night Shift",
  "Flexible",
  "Weekend",
];
// PAY_RATE_OPTIONS — display labels shown in the dropdown (form state stores these)
const PAY_RATE_OPTIONS = ["Per Hour", "Per Day", "Per Week", "Per Month", "Per Year"];
// API key → display label (used when loading a saved template)
const PAY_RATE_LABELS  = { hour: "Per Hour", day: "Per Day", week: "Per Week", month: "Per Month", year: "Per Year" };
// Display label → API key (used when building the payload to send to the backend)
const PAY_RATE_API     = { "Per Hour": "hour", "Per Day": "day", "Per Week": "week", "Per Month": "month", "Per Year": "year" };
const EXPERIENCE_OPTIONS = ["Entry", "Mid", "Senior"];
const EDUCATION_OPTIONS = ["Graduate", "Post Graduate", "Diploma", "12th Pass"];
const BENEFITS_OPTIONS = [
  "PF", "Health insurance", "Paid leaves", "Gratuity", "ESOPs",
  "Travel allowance", "Food allowance", "Work from home allowance",
  "Gym membership", "Internet allowance", "Mobile allowance",
];
const SUPPLEMENT_PAY_OPTIONS = [
  "Performance bonus", "Joining bonus", "Quarterly bonus",
  "Annual bonus", "Sales commission", "Retention bonus",
  "Project completion bonus",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function isFormDirty(current, initial) {
  return JSON.stringify(current) !== JSON.stringify(initial);
}

const EMPTY_FORM = {
  // Section 1 — Template info
  title: "",
  description: "",
  previewTags: [],
  category: "",
  subcategory: "",
  isFeatured: false,
  isPopular: false,
  // Section 2 — Job details
  jobTitle: "",
  jobCategory: "",
  jobType: "",
  jobLocationType: "",
  jobSchedule: "",
  payMinRange: "",
  payMaxRange: "",
  payRateType: "Per Year",
  numberOfOpenings: 1,
  // Section 3 — Requirements
  experienceLevel: "",
  skills: [],
  educationStream: [],
  minimumEducation: "",
  qualifications: [],
  languages: [],
  // Section 4 — Compensation
  benefits: [],
  supplementPay: [],
  // Section 5 — Description
  jobDescription: "",
  isDreamJob: false,
};

function formToPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    previewTags: form.previewTags,
    category: form.category,
    subcategory: form.subcategory.trim(),
    isFeatured: form.isFeatured,
    isPopular: form.isPopular,
    templateData: {
      jobTitle: form.jobTitle,
      jobCategory: form.jobCategory,
      jobType: form.jobType,
      location: { type: form.jobLocationType },
      jobSchedule: form.jobSchedule,
      compensation: {
        minRange: form.payMinRange ? Number(form.payMinRange) : 0,
        maxRange: form.payMaxRange ? Number(form.payMaxRange) : 0,
        rateType: PAY_RATE_API[form.payRateType] ?? form.payRateType,
        benefits: form.benefits,
        supplementPay: form.supplementPay,
      },
      numberOfOpenings: Number(form.numberOfOpenings) || 1,
      experienceLevel: form.experienceLevel,
      requirements: {
        skills: form.skills,
        educationStream: form.educationStream,
        qualifications: form.qualifications,
      },
      minimumEducation: form.minimumEducation,
      languages: form.languages,
      jobDescription: form.jobDescription,
      isDreamJob: form.isDreamJob,
    },
  };
}

function templateToForm(t) {
  const td = t.templateData ?? {};
  return {
    title: t.title ?? "",
    description: t.description ?? "",
    previewTags: t.previewTags ?? [],
    category: t.category ?? "",
    subcategory: t.subcategory ?? "",
    isFeatured: t.isFeatured ?? false,
    isPopular: t.isPopular ?? false,
    jobTitle: td.jobTitle ?? "",
    jobCategory: td.jobCategory ?? "",
    jobType: td.jobType ?? "",
    jobLocationType: td.location?.type ?? "",
    jobSchedule: td.jobSchedule ?? "",
    payMinRange: td.compensation?.minRange ? String(td.compensation.minRange) : "",
    payMaxRange: td.compensation?.maxRange ? String(td.compensation.maxRange) : "",
    payRateType: PAY_RATE_LABELS[td.compensation?.rateType] ?? "Per Year",
    numberOfOpenings: td.numberOfOpenings ?? 1,
    experienceLevel: td.experienceLevel ?? "",
    skills: td.requirements?.skills ?? [],
    educationStream: td.requirements?.educationStream ?? [],
    minimumEducation: td.minimumEducation ?? "",
    qualifications: td.requirements?.qualifications ?? [],
    languages: td.languages ?? [],
    benefits: td.compensation?.benefits ?? [],
    supplementPay: td.compensation?.supplementPay ?? [],
    jobDescription: td.jobDescription ?? "",
    isDreamJob: td.isDreamJob ?? false,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }) {
  return (
    <div className="mb-4 pb-2 border-b border-(--color-black-shade-100)">
      <p className="text-sm font-semibold text-(--color-black-shade-900)">{title}</p>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <div className="mb-3">
      <label className="text-[0.875rem] font-medium text-(--color-black-shade-800)">
        {children}
        {required && <span className="ml-1 text-(--color-red)">*</span>}
      </label>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-150 focus:outline-none"
        style={{ background: checked ? "var(--color-primary)" : "var(--color-black-shade-300)" }}
      >
        <span
          className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-150"
          style={{ transform: checked ? "translateX(18px)" : "translateX(3px)" }}
        />
      </button>
      <span className="text-sm font-medium text-(--color-black-shade-800)">{label}</span>
    </label>
  );
}

// ── Input style ───────────────────────────────────────────────────────────────
const inputBase = "h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400) text-(--color-black-shade-900)";
const inputNormal = "border-(--color-black-shade-300) focus:border-(--color-primary)";
const inputError = "border-(--color-red) focus:border-(--color-red)";

// ── Validation ────────────────────────────────────────────────────────────────
function validate(form) {
  const errs = {};
  if (!form.title.trim()) errs.title = "Template title is required.";
  if (!form.category) errs.category = "Category is required.";
  if (form.description.length > 200) errs.description = "Description cannot exceed 200 characters.";
  if (form.previewTags.length > 5) errs.previewTags = "Maximum 5 tags allowed.";
  return errs;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TemplateFormDrawer({
  template = null,    // null = create mode, object = edit mode
  onClose,
  onSave,             // async (data) => { success, error }
  submitting = false,
}) {
  const isEdit = !!template;
  const initialFormRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (template) {
      const populated = templateToForm(template);
      setForm(populated);
      initialFormRef.current = populated;
    } else {
      setForm(EMPTY_FORM);
      initialFormRef.current = EMPTY_FORM;
    }
    setTouched({});
    setSaveError("");
    setDiscardConfirm(false);
    setPreviewOpen(false);
  }, [template]);

  const currentErrors = validate(form);
  const isValid = Object.keys(currentErrors).length === 0;

  const set = useCallback((field) => (val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  }, []);

  const handle = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }, []);

  const touch = useCallback((field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const err = (field) => (touched[field] ? currentErrors[field] : "");

  // ── Close with dirty check ────────────────────────────────────────────────
  const requestClose = useCallback(() => {
    const dirty = isFormDirty(form, initialFormRef.current ?? EMPTY_FORM);
    if (dirty) {
      setDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [form, onClose]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [requestClose]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Touch all required fields
    setTouched({ title: true, category: true, description: true, previewTags: true });
    if (!isValid) return;

    setSaveError("");
    const result = await onSave(formToPayload(form));
    if (result?.success) {
      onClose();
    } else {
      setSaveError(result?.error ?? "Something went wrong. Please try again.");
    }
  }, [form, isValid, onSave, onClose]);

  // Live preview shape (matches TemplatePreviewCard's expected template shape)
  const livePreviewTemplate = {
    ...form,
    title: form.title || "Untitled Template",
    usageCount: template?.usageCount ?? 0,
    isActive: template?.isActive ?? true,
    createdAt: template?.createdAt,
    updatedAt: template?.updatedAt,
    templateData: {
      jobTitle: form.jobTitle,
      jobCategory: form.jobCategory,
      jobType: form.jobType,
      location: { type: form.jobLocationType },
      jobSchedule: form.jobSchedule,
      experienceLevel: form.experienceLevel,
      requirements: {
        skills: form.skills,
        educationStream: form.educationStream,
        qualifications: form.qualifications,
      },
      minimumEducation: form.minimumEducation,
      languages: form.languages,
      compensation: {
        minRange: form.payMinRange ? Number(form.payMinRange) : 0,
        maxRange: form.payMaxRange ? Number(form.payMaxRange) : 0,
        rateType: form.payRateType,
        benefits: form.benefits,
        supplementPay: form.supplementPay,
      },
      numberOfOpenings: form.numberOfOpenings,
      jobDescription: form.jobDescription,
      isDreamJob: form.isDreamJob,
    },
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity"
        onMouseDown={requestClose}
        onWheel={(e) => e.stopPropagation()}
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex flex-col bg-(--pure-white) shadow-2xl overflow-hidden"
        style={{ width: "min(600px, 100vw)" }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-start justify-between px-5 py-4 border-b border-(--color-black-shade-100)">
          <div>
            <h2 className="text-base font-semibold text-(--color-black-shade-900)">
              {isEdit ? "Edit Template" : "Create Template"}
            </h2>
            <p className="mt-0.5 text-xs text-(--color-black-shade-500)">
              {isEdit
                ? "Update the template details below"
                : "Fill in the details to create a new job template"}
            </p>
            {isEdit && (
              <div className="mt-1.5 flex items-center gap-3">
                <span className="text-xs text-(--color-black-shade-400)">
                  Used {template.usageCount ?? 0} time{template.usageCount !== 1 ? "s" : ""}
                </span>
                {template.updatedAt && (
                  <span className="text-xs text-(--color-black-shade-400)">
                    · Last updated: {formatDate(template.updatedAt)}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close drawer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-black-shade-500) hover:bg-(--color-black-shade-100) hover:text-(--color-black-shade-900) transition-colors cursor-pointer flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Unsaved changes warning ──────────────────────────────────── */}
        {discardConfirm && (
          <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-amber-50 border-b border-amber-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="flex-1 text-sm font-medium text-amber-800">
              You have unsaved changes. Close anyway?
            </p>
            <button
              type="button"
              onClick={() => setDiscardConfirm(false)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-(--color-red) hover:text-red-700 cursor-pointer"
            >
              Discard changes
            </button>
          </div>
        )}

        {/* ── Body (scrollable) ────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-8">

          {/* ── SECTION 1: Template Info ─────────────────────────────── */}
          <div>
            <SectionHeader title="1. Template Info" />

            {/* Template Title */}
            <div className="mb-4">
              <FieldLabel required>Template Title</FieldLabel>
              <input
                type="text"
                value={form.title}
                onChange={handle("title")}
                onBlur={touch("title")}
                placeholder="e.g. Senior React Developer"
                className={`${inputBase} ${err("title") ? inputError : inputNormal}`}
              />
              {err("title") && <p className="mt-1 text-xs text-(--color-red)">{err("title")}</p>}
            </div>

            {/* Short Description */}
            <div className="mb-4">
              <FieldLabel>Short Description</FieldLabel>
              <textarea
                value={form.description}
                onChange={handle("description")}
                onBlur={touch("description")}
                placeholder="Brief description for internal reference…"
                rows={3}
                maxLength={200}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-colors resize-none placeholder:text-(--color-black-shade-400) text-(--color-black-shade-900) ${err("description") ? inputError : inputNormal}`}
              />
              <div className="mt-1 flex justify-between">
                {err("description") ? (
                  <p className="text-xs text-(--color-red)">{err("description")}</p>
                ) : <span />}
                <p className={`text-xs ml-auto ${form.description.length > 200 ? "text-(--color-red)" : "text-(--color-black-shade-400)"}`}>
                  {form.description.length} / 200
                </p>
              </div>
            </div>

            {/* Preview Tags */}
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[0.875rem] font-medium text-(--color-black-shade-800)">
                  Preview Tags
                </label>
                <span className={`text-xs ${form.previewTags.length > 5 ? "text-(--color-red)" : "text-(--color-black-shade-400)"}`}>
                  {form.previewTags.length} / 5 tags
                </span>
              </div>
              <TagInput
                options={[]}
                value={form.previewTags}
                onChange={(tags) => {
                  set("previewTags")(tags.slice(0, 5));
                  touch("previewTags")();
                }}
                placeholder="Type and press Enter to add tags…"
                allowCreate
                error={err("previewTags")}
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <FieldLabel required>Category</FieldLabel>
              <CreatableSelect
                placeholder="Select a category"
                options={CATEGORY_OPTIONS.map((c) => CATEGORY_LABELS[c])}
                allowCreate={false}
                showAllOnOpen
                value={form.category ? CATEGORY_LABELS[form.category] : ""}
                error={err("category")}
                onChange={(val) => {
                  const key = CATEGORY_OPTIONS.find((c) => CATEGORY_LABELS[c] === val) ?? "";
                  set("category")(key);
                  touch("category")();
                }}
                onBlur={touch("category")}
                className="mb-0!"
              />
              {err("category") && <p className="mt-1 text-xs text-(--color-red)">{err("category")}</p>}
            </div>

            {/* Subcategory */}
            <div className="mb-4">
              <FieldLabel>Subcategory</FieldLabel>
              <input
                type="text"
                value={form.subcategory}
                onChange={handle("subcategory")}
                placeholder="e.g. Frontend, Full Stack"
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3">
              <ToggleSwitch checked={form.isFeatured} onChange={set("isFeatured")} label="Mark as Featured" />
              <ToggleSwitch checked={form.isPopular} onChange={set("isPopular")} label="Mark as Popular" />
            </div>
          </div>

          {/* ── SECTION 2: Job Details ───────────────────────────────── */}
          <div>
            <SectionHeader title="2. Job Details" />

            {/* Job Title */}
            <div className="mb-4">
              <FieldLabel>Job Title</FieldLabel>
              <input
                type="text"
                value={form.jobTitle}
                onChange={handle("jobTitle")}
                placeholder="e.g. Senior React Developer"
                className={`${inputBase} ${inputNormal}`}
              />
            </div>

            {/* Job Category */}
            <div className="mb-4">
              <FieldLabel>Job Category</FieldLabel>
              <CreatableSelect
                placeholder="Select job category"
                options={CATEGORY_OPTIONS.map((c) => CATEGORY_LABELS[c])}
                allowCreate={false}
                showAllOnOpen
                value={form.jobCategory ? CATEGORY_LABELS[form.jobCategory] ?? form.jobCategory : ""}
                onChange={(val) => {
                  const key = CATEGORY_OPTIONS.find((c) => CATEGORY_LABELS[c] === val) ?? val;
                  set("jobCategory")(key);
                }}
                className="mb-0!"
              />
            </div>

            {/* Job Type */}
            <div className="mb-4">
              <FieldLabel>Job Type</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <SelectPill
                    key={opt}
                    label={opt}
                    isSelected={form.jobType === opt}
                    onSelect={() => set("jobType")(form.jobType === opt ? "" : opt)}
                  />
                ))}
              </div>
            </div>

            {/* Location Type */}
            <div className="mb-4">
              <FieldLabel>Location Type</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {LOCATION_TYPE_OPTIONS.map((opt) => (
                  <SelectPill
                    key={opt}
                    label={opt}
                    isSelected={form.jobLocationType === opt}
                    onSelect={() => set("jobLocationType")(form.jobLocationType === opt ? "" : opt)}
                  />
                ))}
              </div>
            </div>

            {/* Job Schedule */}
            <div className="mb-4">
              <FieldLabel>Job Schedule</FieldLabel>
              <CreatableSelect
                placeholder="Select or type schedule"
                options={JOB_SCHEDULE_OPTIONS}
                allowCreate
                showAllOnOpen
                value={form.jobSchedule}
                onChange={set("jobSchedule")}
                className="mb-0!"
              />
            </div>

            {/* Pay Range */}
            <div className="mb-4">
              <FieldLabel>Pay Range</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={form.payMinRange}
                  onChange={handle("payMinRange")}
                  placeholder="Min"
                  className={`h-11 flex-1 rounded-xl border px-4 text-sm font-medium outline-none transition-colors text-(--color-black-shade-900) placeholder:text-(--color-black-shade-400) ${inputNormal}`}
                />
                <span className="text-sm text-(--color-black-shade-500) flex-shrink-0">to</span>
                <input
                  type="number"
                  min="0"
                  value={form.payMaxRange}
                  onChange={handle("payMaxRange")}
                  placeholder="Max"
                  className={`h-11 flex-1 rounded-xl border px-4 text-sm font-medium outline-none transition-colors text-(--color-black-shade-900) placeholder:text-(--color-black-shade-400) ${inputNormal}`}
                />
                <div className="w-36 flex-shrink-0">
                  <CreatableSelect
                    placeholder="Rate"
                    options={PAY_RATE_OPTIONS}
                    allowCreate={false}
                    showAllOnOpen
                    value={form.payRateType}
                    onChange={set("payRateType")}
                    className="mb-0!"
                  />
                </div>
              </div>
            </div>

            {/* Number of Openings */}
            <div className="mb-4">
              <FieldLabel>Number of Openings</FieldLabel>
              <input
                type="number"
                min="1"
                value={form.numberOfOpenings}
                onChange={handle("numberOfOpenings")}
                className={`${inputBase} ${inputNormal}`}
                style={{ width: 120 }}
              />
            </div>
          </div>

          {/* ── SECTION 3: Requirements ──────────────────────────────── */}
          <div>
            <SectionHeader title="3. Requirements" />

            {/* Experience Level */}
            <div className="mb-4">
              <FieldLabel>Experience Level</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectPill
                    key={opt}
                    label={opt}
                    isSelected={form.experienceLevel === opt}
                    onSelect={() => set("experienceLevel")(form.experienceLevel === opt ? "" : opt)}
                  />
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <FieldLabel>Skills</FieldLabel>
              <TagInput
                options={[]}
                value={form.skills}
                onChange={set("skills")}
                placeholder="Type skill and press Enter…"
                allowCreate
              />
            </div>

            {/* Education Stream */}
            <div className="mb-4">
              <FieldLabel>Education Stream</FieldLabel>
              <TagInput
                options={["Computer Science", "Information Technology", "MBA", "Electronics", "Mechanical", "Commerce"]}
                value={form.educationStream}
                onChange={set("educationStream")}
                placeholder="e.g. Computer Science…"
                allowCreate
              />
            </div>

            {/* Minimum Education */}
            <div className="mb-4">
              <FieldLabel>Minimum Education</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_OPTIONS.map((opt) => (
                  <SelectPill
                    key={opt}
                    label={opt}
                    isSelected={form.minimumEducation === opt}
                    onSelect={() => set("minimumEducation")(form.minimumEducation === opt ? "" : opt)}
                  />
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="mb-4">
              <FieldLabel>Qualifications</FieldLabel>
              <TagInput
                options={["B.Tech", "M.Tech", "MBA", "B.Sc", "B.Com", "BCA", "MCA"]}
                value={form.qualifications}
                onChange={set("qualifications")}
                placeholder="e.g. B.Tech…"
                allowCreate
              />
            </div>

            {/* Languages */}
            <div className="mb-4">
              <FieldLabel>Languages</FieldLabel>
              <TagInput
                options={["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi"]}
                value={form.languages}
                onChange={set("languages")}
                placeholder="e.g. English…"
                allowCreate
              />
            </div>
          </div>

          {/* ── SECTION 4: Compensation & Perks ─────────────────────── */}
          <div>
            <SectionHeader title="4. Compensation &amp; Perks" />

            {/* Benefits */}
            <div className="mb-4">
              <FieldLabel>Benefits</FieldLabel>
              <TagInput
                options={BENEFITS_OPTIONS}
                value={form.benefits}
                onChange={set("benefits")}
                placeholder="Select or type benefit…"
                allowCreate
              />
            </div>

            {/* Supplement Pay */}
            <div className="mb-4">
              <FieldLabel>Additional Perks / Supplement Pay</FieldLabel>
              <TagInput
                options={SUPPLEMENT_PAY_OPTIONS}
                value={form.supplementPay}
                onChange={set("supplementPay")}
                placeholder="Select or type perk…"
                allowCreate
              />
            </div>
          </div>

          {/* ── SECTION 5: Job Description ───────────────────────────── */}
          <div>
            <SectionHeader title="5. Job Description" />

            <div className="mb-4">
              <FieldLabel>Job Description</FieldLabel>
              <RichTextEditor
                value={form.jobDescription}
                onChange={set("jobDescription")}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting…"
                minHeight={180}
              />
            </div>

            {/* Dream Job toggle */}
            <ToggleSwitch
              checked={form.isDreamJob}
              onChange={set("isDreamJob")}
              label="Mark as Dream Job"
            />
          </div>

          {/* ── LIVE PREVIEW (collapsible) ───────────────────────────── */}
          <div className="border border-(--color-black-shade-200) rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setPreviewOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-(--color-black-shade-800) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
                Live Preview
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-transform ${previewOpen ? "rotate-180" : "rotate-0"}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {previewOpen && (
              <div className="border-t border-(--color-black-shade-100)">
                <TemplatePreviewCard template={livePreviewTemplate} inline />
              </div>
            )}
          </div>

          {/* API error */}
          {saveError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-(--color-red)">
              {saveError}
            </div>
          )}
        </div>

        {/* ── Footer (sticky) ──────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-(--color-black-shade-100) bg-(--pure-white)">
          <button
            type="button"
            onClick={requestClose}
            disabled={submitting}
            className="h-10 rounded-xl border border-(--color-black-shade-300) px-5 text-sm font-semibold text-(--color-black-shade-700) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !isValid}
            className="h-10 flex items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--color-primary)" }}
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Saving…
              </>
            ) : (
              "Save Template"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

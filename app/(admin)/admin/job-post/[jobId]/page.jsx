"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/utilities/api";
import { adminUpdateJobPost } from "@/services/jobPost.service";
import { updateJobPostStatus } from "@/services/jobPost.service";
import { showSuccess, showError } from "@/utilities/toast";
import Button from "@/components/common/Button";
import Icon from "@/components/common/Icon";
import Label from "@/components/common/Label";
import FixedBackButton from "@/components/common/FixedBackButton";
import ProfileSectionCard from "@/components/common/ProfileSectionCard";
import { SpecificJobSkeleton } from "@/components/common/Skeleton";
import JobPostStatusDropdown from "@/components/admin-dashboard/JobPost/components/JobPostStatusDropdown";
import CompanyAvatar from "@/components/common/CompanyAvatar";
import EditSectionModal from "@/components/common/EditSectionModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import CreatableSelect from "@/components/common/CreatableSelect";
import { useMetadataData } from "@/hooks/useMetadata";
import RichTextEditor from "@/components/common/RichTextEditor";

/* ─── Constants ────────────────────────────────────────────────────── */

const JOB_CATEGORIES = ["development", "marketing", "sales", "design", "consultancy"];
const JOB_CATEGORY_LABELS = { development: "Development", marketing: "Marketing", sales: "Sales", design: "Design", consultancy: "Consultancy" };

const JOB_TYPES_DISPLAY = ["Full-time", "Part-time", "Contract/Freelance"];
const JOB_TYPE_TO_MODEL = { "Full-time": "full time", "Part-time": "part time", "Contract/Freelance": "contractual" };
const JOB_TYPE_FROM_MODEL = { "full time": "Full-time", "part time": "Part-time", contractual: "Contract/Freelance" };

const LOCATION_TYPES = ["onsite", "remote", "hybrid"];
const LOCATION_LABELS = { onsite: "On-site", remote: "Remote", hybrid: "Hybrid" };

const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior"];
const EXPERIENCE_LEVEL_LABELS = { Entry: "Entry Level (0–2 yrs)", Mid: "Mid Level (3–5 yrs)", Senior: "Senior Level (6+ yrs)" };

const SUPPLEMENT_PAY_OPTIONS = ["performance bonus", "joining bonus"];
const BENEFITS_OPTIONS = ["PF", "Health insurance"];

const PERKS_ALL = ["Health insurance", "PF", "performance bonus", "joining bonus"];

/* ─── Helpers ─────────────────────────────────────────────────────── */

const formatExperience = (level) => {
  const map = { "entry-level": "0–2 Yrs", "mid-level": "3–5 Yrs", "senior-level": "6+ Yrs", Entry: "0–2 Yrs", Mid: "3–5 Yrs", Senior: "6+ Yrs" };
  return map[level] || level || "";
};

function stripHtml(html) {
  return (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

/* ─── Shared input style ───────────────────────────────────────────── */

const inputBase = "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400) border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError = "border-(--color-red)! focus:border-(--color-red)!";

/* ─── Pencil icon button ───────────────────────────────────────────── */

function EditButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center w-7 h-7 rounded-full text-(--color-black-shade-400) hover:text-(--color-primary) hover:bg-(--color-primary-shade-100) transition-colors cursor-pointer shrink-0"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  );
}

/* ─── Pill toggle (for job type, location type, experience level) ──── */

function SelectPill({ label, isSelected, onSelect, disabled }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
        isSelected
          ? "bg-(--color-primary) border-(--color-primary) text-white"
          : "bg-(--pure-white) border-(--color-black-shade-300) text-(--color-black-shade-700) hover:border-(--color-primary)"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

/* ─── Tag pill (for skills, supplements, benefits) ─────────────────── */

function TagPill({ label, onRemove, disabled }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-shade-100) px-3 py-1 text-xs font-medium text-(--color-black-shade-900)">
      {label}
      {!disabled && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="flex items-center text-(--color-black-shade-500) hover:text-(--color-red) cursor-pointer">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
}

/* ─── useEditSection ───────────────────────────────────────────────── */

function useEditSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const open = useCallback(() => { setIsOpen(true); setIsDirty(false); }, []);

  const requestClose = useCallback(() => {
    if (isDirty) { setConfirmDiscard(true); return; }
    setIsOpen(false);
  }, [isDirty]);

  const forceClose = useCallback(() => { setIsOpen(false); setConfirmDiscard(false); setIsDirty(false); }, []);

  return { isOpen, isLoading, setIsLoading, isDirty, setIsDirty, open, requestClose, forceClose, confirmDiscard, setConfirmDiscard };
}

/* ─── EDIT MODALS ──────────────────────────────────────────────────── */

/* Header edit — jobTitle, companyName, jobCategory, jobLocationType, jobType */
function JobHeaderModal({ job, onSave, onClose, isLoading, onSetDirty }) {
  const [form, setForm] = useState({
    jobTitle: job.jobTitle || "",
    companyName: job.companyName || "",
    jobCategory: job.jobCategory || "",
    jobLocationType: job.jobLocationType || "onsite",
    jobType: JOB_TYPE_FROM_MODEL[job.jobType] || job.jobType || "",
    numberOfOpenings: String(job.numberOfOpenings ?? 1),
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => { setForm((p) => ({ ...p, [field]: val })); setErrors((p) => { const n = { ...p }; delete n[field]; return n; }); onSetDirty(); };

  const validate = () => {
    const e = {};
    if (!form.jobTitle.trim()) e.jobTitle = "Job title is required.";
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.jobCategory) e.jobCategory = "Job category is required.";
    if (!form.jobType) e.jobType = "Job type is required.";
    if (!form.numberOfOpenings || Number(form.numberOfOpenings) < 1) e.numberOfOpenings = "At least 1 opening required.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      jobTitle: form.jobTitle.trim(),
      companyName: form.companyName.trim(),
      jobCategory: form.jobCategory,
      jobLocationType: form.jobLocationType,
      jobType: JOB_TYPE_TO_MODEL[form.jobType] ?? form.jobType,
      numberOfOpenings: Number(form.numberOfOpenings),
    });
  };

  return (
    <EditSectionModal title="Edit Job Header" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Job Title</Label>
        <input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="e.g. Senior React Developer" className={`${inputBase} ${errors.jobTitle ? inputError : ""}`} />
        {errors.jobTitle && <p className="mt-1 text-xs text-(--color-red)">{errors.jobTitle}</p>}
      </div>

      <div className="mb-4">
        <Label required>Company Name</Label>
        <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Acrapath Technologies" className={`${inputBase} ${errors.companyName ? inputError : ""}`} />
        {errors.companyName && <p className="mt-1 text-xs text-(--color-red)">{errors.companyName}</p>}
      </div>

      <div className="mb-4">
        <Label required>Job Category</Label>
        <CreatableSelect
          options={JOB_CATEGORIES.map((c) => JOB_CATEGORY_LABELS[c] ?? c)}
          value={JOB_CATEGORY_LABELS[form.jobCategory] || form.jobCategory}
          allowCreate={false}
          showAllOnOpen
          placeholder="Select category"
          error={errors.jobCategory}
          onChange={(label) => { const val = JOB_CATEGORIES.find((c) => JOB_CATEGORY_LABELS[c] === label) ?? label.toLowerCase(); set("jobCategory", val); }}
          className="mb-0!"
        />
      </div>

      <div className="mb-4">
        <Label required>Job Type</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {JOB_TYPES_DISPLAY.map((t) => (
            <SelectPill key={t} label={t} isSelected={form.jobType === t} onSelect={() => set("jobType", t)} disabled={isLoading} />
          ))}
        </div>
        {errors.jobType && <p className="mt-1 text-xs text-(--color-red)">{errors.jobType}</p>}
      </div>

      <div className="mb-4">
        <Label required>Work Mode</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {LOCATION_TYPES.map((t) => (
            <SelectPill key={t} label={LOCATION_LABELS[t]} isSelected={form.jobLocationType === t} onSelect={() => set("jobLocationType", t)} disabled={isLoading} />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <Label required>Number of Openings</Label>
        <input
          type="number"
          min="1"
          value={form.numberOfOpenings}
          onChange={(e) => set("numberOfOpenings", e.target.value)}
          placeholder="1"
          className={`${inputBase} ${errors.numberOfOpenings ? inputError : ""}`}
        />
        {errors.numberOfOpenings && <p className="mt-1 text-xs text-(--color-red)">{errors.numberOfOpenings}</p>}
      </div>
    </EditSectionModal>
  );
}

/* Location edit — city, state, pincode, streetAddress1 */
function LocationModal({ job, onSave, onClose, isLoading, onSetDirty }) {
  const [form, setForm] = useState({
    city: job.city || "",
    state: job.state || "",
    pincode: job.pincode || "",
    streetAddress1: job.streetAddress1 || "",
  });
  const [errors, setErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const set = (field, val) => { setForm((p) => ({ ...p, [field]: val })); setErrors((p) => { const n = { ...p }; delete n[field]; return n; }); onSetDirty(); };

  const fetchPincode = async (pin) => {
    if (!/^[0-9]{6}$/.test(pin)) return;
    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setForm((p) => ({ ...p, city: po.District, state: po.State }));
      }
    } catch { /* ignore */ } finally {
      setPincodeLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!form.pincode.trim()) e.pincode = "Pincode is required.";
    else if (!/^[0-9]{6}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ city: form.city.trim(), state: form.state.trim(), pincode: form.pincode.trim(), streetAddress1: form.streetAddress1.trim() });
  };

  return (
    <EditSectionModal title="Edit Location" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Pincode</Label>
        <input
          value={form.pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            set("pincode", val);
            if (val.length === 6) fetchPincode(val);
          }}
          placeholder="e.g. 400001"
          className={`${inputBase} ${errors.pincode ? inputError : ""}`}
          maxLength={6}
        />
        {errors.pincode && <p className="mt-1 text-xs text-(--color-red)">{errors.pincode}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label required>City</Label>
          <input value={pincodeLoading ? "" : form.city} onChange={(e) => set("city", e.target.value)} placeholder={pincodeLoading ? "Fetching…" : "e.g. Mumbai"} disabled={pincodeLoading} className={`${inputBase} ${errors.city ? inputError : ""}`} />
          {errors.city && <p className="mt-1 text-xs text-(--color-red)">{errors.city}</p>}
        </div>
        <div>
          <Label required>State</Label>
          <input value={pincodeLoading ? "" : form.state} onChange={(e) => set("state", e.target.value)} placeholder={pincodeLoading ? "Fetching…" : "e.g. Maharashtra"} disabled={pincodeLoading} className={`${inputBase} ${errors.state ? inputError : ""}`} />
          {errors.state && <p className="mt-1 text-xs text-(--color-red)">{errors.state}</p>}
        </div>
      </div>

      <div className="mb-4">
        <Label>Street Address</Label>
        <input value={form.streetAddress1} onChange={(e) => set("streetAddress1", e.target.value)} placeholder="Building, floor, street…" className={inputBase} />
      </div>
    </EditSectionModal>
  );
}

/* Compensation edit — payMinRange, payMaxRange, supplementPay, benefits */
function CompensationModal({ job, onSave, onClose, isLoading, onSetDirty }) {
  const toL = (v) => v ? String(Math.round(v / 100000)) : "";
  const fromL = (v) => Number(v) * 100000;

  const [form, setForm] = useState({
    payMinRange: toL(job.payMinRange),
    payMaxRange: toL(job.payMaxRange),
    supplementPay: job.supplementPay?.slice() || [],
    benefits: job.benefits?.slice() || [],
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => { setForm((p) => ({ ...p, [field]: val })); setErrors((p) => { const n = { ...p }; delete n[field]; return n; }); onSetDirty(); };

  const toggleList = (field, val) => {
    setForm((p) => ({ ...p, [field]: p[field].includes(val) ? p[field].filter((v) => v !== val) : [...p[field], val] }));
    onSetDirty();
  };

  const validate = () => {
    const e = {};
    if (!form.payMinRange || Number(form.payMinRange) <= 0) e.payMinRange = "Enter a valid minimum salary.";
    if (!form.payMaxRange || Number(form.payMaxRange) <= 0) e.payMaxRange = "Enter a valid maximum salary.";
    else if (Number(form.payMaxRange) < Number(form.payMinRange)) e.payMaxRange = "Maximum must be greater than minimum.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      payMinRange: fromL(form.payMinRange),
      payMaxRange: fromL(form.payMaxRange),
      payRateType: "per year",
      supplementPay: form.supplementPay,
      benefits: form.benefits,
    });
  };

  return (
    <EditSectionModal title="Edit Compensation" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label required>Min CTC (LPA)</Label>
          <input type="number" min="0" value={form.payMinRange} onChange={(e) => set("payMinRange", e.target.value)} placeholder="e.g. 5" className={`${inputBase} ${errors.payMinRange ? inputError : ""}`} />
          {errors.payMinRange && <p className="mt-1 text-xs text-(--color-red)">{errors.payMinRange}</p>}
        </div>
        <div>
          <Label required>Max CTC (LPA)</Label>
          <input type="number" min="0" value={form.payMaxRange} onChange={(e) => set("payMaxRange", e.target.value)} placeholder="e.g. 10" className={`${inputBase} ${errors.payMaxRange ? inputError : ""}`} />
          {errors.payMaxRange && <p className="mt-1 text-xs text-(--color-red)">{errors.payMaxRange}</p>}
        </div>
      </div>

      <div className="mb-4">
        <Label>Supplement Pay</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {SUPPLEMENT_PAY_OPTIONS.map((opt) => (
            <SelectPill key={opt} label={opt} isSelected={form.supplementPay.includes(opt)} onSelect={() => toggleList("supplementPay", opt)} disabled={isLoading} />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <Label>Benefits</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {BENEFITS_OPTIONS.map((opt) => (
            <SelectPill key={opt} label={opt} isSelected={form.benefits.includes(opt)} onSelect={() => toggleList("benefits", opt)} disabled={isLoading} />
          ))}
        </div>
      </div>
    </EditSectionModal>
  );
}

/* Experience Level edit */
function JobDetailsModal({ job, onSave, onClose, isLoading, onSetDirty }) {
  const [experienceLevel, setExperienceLevel] = useState(job.experienceLevel || "");
  const [jobSchedule, setJobSchedule] = useState(job.jobSchedule || "");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!experienceLevel) { setError("Experience level is required."); return; }
    onSave({ experienceLevel, jobSchedule: jobSchedule.trim() || undefined });
  };

  return (
    <EditSectionModal title="Edit Job Details" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Experience Level</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {EXPERIENCE_LEVELS.map((l) => (
            <SelectPill key={l} label={EXPERIENCE_LEVEL_LABELS[l]} isSelected={experienceLevel === l} onSelect={() => { setExperienceLevel(l); setError(""); onSetDirty(); }} disabled={isLoading} />
          ))}
        </div>
        {error && <p className="mt-1 text-xs text-(--color-red)">{error}</p>}
      </div>
      <div className="mb-4">
        <Label>Job Schedule</Label>
        <input value={jobSchedule} onChange={(e) => { setJobSchedule(e.target.value); onSetDirty(); }} placeholder="e.g. Monday to Friday, Night shift…" className={inputBase} />
      </div>
    </EditSectionModal>
  );
}

/* Skills edit */
function SkillsModal({ job, onSave, onClose, isLoading, onSetDirty }) {
  const { metadata } = useMetadataData();
  const [skills, setSkills] = useState(job.skills?.slice() || []);
  const [error, setError] = useState("");

  const addSkill = (skill) => {
    if (!skill) return;
    if (skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())) return;
    setSkills((p) => [...p, skill]);
    setError("");
    onSetDirty();
  };

  const removeSkill = (skill) => { setSkills((p) => p.filter((s) => s !== skill)); onSetDirty(); };

  const metaSkills = [
    ...Object.values(metadata.techSkillsByCategory || {}).flat(),
    ...Object.values(metadata.strategicSkillsByCategory || {}).flat(),
  ].filter((v, i, arr) => arr.indexOf(v) === i);
  const available = metaSkills.filter((s) => !skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()));

  const handleSave = () => {
    if (skills.length < 4) { setError("At least 4 skills are required."); return; }
    onSave({ skills });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => { if (e.key === "Escape" && !isLoading) onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [isLoading, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-[fadeIn_0.15s_ease]"
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label="Edit Skills Required"
    >
      <div className="w-full max-w-lg rounded-2xl bg-(--pure-white) shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-black-shade-100) shrink-0">
          <h2 className="text-16 font-semibold text-(--color-black-shade-900)">Edit Skills Required</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-full text-(--color-black-shade-500) hover:bg-(--color-black-shade-100) transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <fieldset disabled={isLoading} className="contents">
          <div className="px-6 pt-5 shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <Label required>Skills (min 4)</Label>
              <span className="text-xs text-(--color-black-shade-500)">{skills.length} added</span>
            </div>
            {skills.length > 0 && (
              <div className="mb-3 max-h-24 overflow-y-auto flex flex-wrap gap-2 pr-1">
                {skills.map((s) => <TagPill key={s} label={s} onRemove={() => removeSkill(s)} />)}
              </div>
            )}
          </div>
          <div className="px-6 pb-5 shrink-0">
            <CreatableSelect
              placeholder="Search or add a skill"
              options={available}
              value=""
              allowCreate
              showAllOnOpen={false}
              error={error}
              onChange={addSkill}
              className="mb-0!"
            />
          </div>
        </fieldset>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-(--color-black-shade-100) shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-auto! h-10! px-5">
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSave} disabled={isLoading} className="w-auto! h-10! px-6 gap-2">
            {isLoading && <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />}
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* Job Description edit */
function DescriptionModal({ job, onSave, onClose, isLoading, onSetDirty }) {
  const [description, setDescription] = useState(job.jobDescription || "");
  const [qualificationsText, setQualificationsText] = useState((job.qualifications || []).join("\n"));
  const [error, setError] = useState("");

  const handleSave = () => {
    const len = stripHtml(description).length;
    if (len < 10) { setError("Job description must be at least 10 characters."); return; }
    const qualifications = qualificationsText.split("\n").map((q) => q.trim()).filter(Boolean);
    onSave({ jobDescription: description, qualifications });
  };

  return (
    <EditSectionModal title="Edit Job Description" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Job Description</Label>
        <RichTextEditor
          value={description}
          onChange={(v) => { setDescription(v); setError(""); onSetDirty(); }}
          placeholder="Describe the role, responsibilities, and requirements…"
          hasError={!!error}
        />
        {error && <p className="mt-1 text-xs text-(--color-red)">{error}</p>}
      </div>
      <div className="mb-4">
        <Label>Qualifications (one per line)</Label>
        <textarea
          value={qualificationsText}
          onChange={(e) => { setQualificationsText(e.target.value); onSetDirty(); }}
          rows={4}
          placeholder="Bachelor's degree in Computer Science&#10;2+ years of experience with React&#10;…"
          className="w-full rounded-xl border px-5 py-4 text-[0.9375rem] font-medium outline-none transition-colors resize-none placeholder:text-(--color-black-shade-400) border-(--color-black-shade-300) focus:border-(--color-primary)"
        />
      </div>
    </EditSectionModal>
  );
}

/* Company Description edit */
function CompanyDescriptionModal({ job, onSave, onClose, isLoading, onSetDirty }) {
  const [description, setDescription] = useState(job.companyDescription || "");
  const [error, setError] = useState("");

  const handleSave = () => {
    const len = stripHtml(description).length;
    if (len < 50) { setError("Company description must be at least 50 characters."); return; }
    if (len > 2000) { setError("Company description must not exceed 2000 characters."); return; }
    onSave({ companyDescription: description });
  };

  return (
    <EditSectionModal title="Edit Company Description" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <Label required>Company Description</Label>
      <RichTextEditor
        value={description}
        onChange={(v) => { setDescription(v); setError(""); onSetDirty(); }}
        placeholder="Describe the company — culture, mission, what makes it a great place to work…"
        hasError={!!error}
      />
      <div className="mt-1 flex items-center justify-between">
        {error ? <p className="text-xs text-(--color-red)">{error}</p> : <span />}
        <p className="ml-auto text-xs text-(--color-black-shade-400)">{stripHtml(description).length} / 2000</p>
      </div>
    </EditSectionModal>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function AdminJobDetailPage() {
  const { jobId } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  /* ── Edit state per section ─────────────────────────────────────── */
  const headerEdit = useEditSection();
  const locationEdit = useEditSection();
  const compensationEdit = useEditSection();
  const detailsEdit = useEditSection();
  const skillsEdit = useEditSection();
  const descriptionEdit = useEditSection();
  const companyDescEdit = useEditSection();

  const allEdits = [headerEdit, locationEdit, compensationEdit, detailsEdit, skillsEdit, descriptionEdit, companyDescEdit];

  useEffect(() => {
    if (!jobId) return;
    const load = async () => {
      try {
        const res = await apiRequest(`/jobs/${jobId}`);
        setJob(res.data);
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  /* ── Status change (existing flow — unchanged) ──────────────────── */
  const handleStatusChange = async (val) => {
    setUpdatingStatus(true);
    try {
      await updateJobPostStatus(jobId, val);
      setJob((prev) => ({ ...prev, status: val }));
      showSuccess("Status updated successfully");
    } catch { /* toast shown by apiRequest */ } finally {
      setUpdatingStatus(false);
    }
  };

  /* ── Shared save handler ────────────────────────────────────────── */
  const handleSave = useCallback(async (editState, payload, successMsg) => {
    editState.setIsLoading(true);
    const snapshot = job;
    try {
      const res = await adminUpdateJobPost(jobId, payload);
      setJob((prev) => ({ ...prev, ...res.data, dreamjob: prev.dreamjob }));
      showSuccess(successMsg ?? "Changes saved successfully.");
      editState.forceClose();
    } catch {
      setJob(snapshot);
      showError("Failed to save changes. Please try again.");
    } finally {
      editState.setIsLoading(false);
    }
  }, [jobId, job]);

  const formatSalaryLPA = (j) => {
    if (!j?.payMinRange || !j?.payMaxRange) return "Not disclosed";
    const min = (j.payMinRange / 100000).toFixed(0);
    const max = (j.payMaxRange / 100000).toFixed(0);
    return `${min}–${max} LPA`;
  };

  if (loading) return <SpecificJobSkeleton />;

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Icon name="statics/login/cross-icon.svg" width={48} height={48} className="mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-(--color-black-shade-800)">Job not found</h2>
        <p className="text-(--color-black-shade-600) mt-2">This job may have been removed or the link is invalid.</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-(--color-primary) text-white rounded-lg hover:opacity-90 transition cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  const experienceLabel = formatExperience(job.experienceLevel);

  return (
    <>
      <FixedBackButton variant="admin" />

      {/* ── Discard-change confirmation modals ─────────────────────── */}
      {allEdits.map((edit, idx) => (
        <ConfirmModal
          key={idx}
          open={edit.confirmDiscard}
          onClose={() => edit.setConfirmDiscard(false)}
          onConfirm={edit.forceClose}
          title="Discard changes?"
          description="You have unsaved changes. Are you sure you want to discard them?"
          confirmLabel="Discard"
          confirmVariant="danger"
        />
      ))}

      {/* ── Section edit modals ─────────────────────────────────────── */}
      {headerEdit.isOpen && (
        <JobHeaderModal job={job} onSave={(p) => handleSave(headerEdit, p, "Job header updated.")} onClose={headerEdit.requestClose} isLoading={headerEdit.isLoading} onSetDirty={() => headerEdit.setIsDirty(true)} />
      )}
      {locationEdit.isOpen && (
        <LocationModal job={job} onSave={(p) => handleSave(locationEdit, p, "Location updated.")} onClose={locationEdit.requestClose} isLoading={locationEdit.isLoading} onSetDirty={() => locationEdit.setIsDirty(true)} />
      )}
      {compensationEdit.isOpen && (
        <CompensationModal job={job} onSave={(p) => handleSave(compensationEdit, p, "Compensation updated.")} onClose={compensationEdit.requestClose} isLoading={compensationEdit.isLoading} onSetDirty={() => compensationEdit.setIsDirty(true)} />
      )}
      {detailsEdit.isOpen && (
        <JobDetailsModal job={job} onSave={(p) => handleSave(detailsEdit, p, "Job details updated.")} onClose={detailsEdit.requestClose} isLoading={detailsEdit.isLoading} onSetDirty={() => detailsEdit.setIsDirty(true)} />
      )}
      {skillsEdit.isOpen && (
        <SkillsModal job={job} onSave={(p) => handleSave(skillsEdit, p, "Skills updated.")} onClose={skillsEdit.requestClose} isLoading={skillsEdit.isLoading} onSetDirty={() => skillsEdit.setIsDirty(true)} />
      )}
      {descriptionEdit.isOpen && (
        <DescriptionModal job={job} onSave={(p) => handleSave(descriptionEdit, p, "Job description updated.")} onClose={descriptionEdit.requestClose} isLoading={descriptionEdit.isLoading} onSetDirty={() => descriptionEdit.setIsDirty(true)} />
      )}
      {companyDescEdit.isOpen && (
        <CompanyDescriptionModal job={job} onSave={(p) => handleSave(companyDescEdit, p, "Company description updated.")} onClose={companyDescEdit.requestClose} isLoading={companyDescEdit.isLoading} onSetDirty={() => companyDescEdit.setIsDirty(true)} />
      )}

      <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6 md:px-8 space-y-3 md:space-y-4">

        {/* ── Header Card ──────────────────────────────────────────── */}
        <ProfileSectionCard className="px-5! py-5! sm:px-6! sm:py-6!">
          <div className="flex flex-col gap-4 sm:gap-3">

            {/* Title + Avatar + Edit */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-(--color-black-shade-900)">{job.jobTitle}</h1>
                <p className="mt-1 text-sm font-medium text-(--color-black-shade-700)">{job.companyName}</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <CompanyAvatar companyName={job.companyName} size="lg" className="rounded-xl" />
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between text-xs font-medium text-(--color-black-shade-700)">
              <div className="flex flex-1 sm:flex-none flex-nowrap sm:flex-wrap items-center justify-between sm:justify-start gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <Icon name="static/Icons/bag.svg" width={16} height={16} />
                  <span>{experienceLabel} Exp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="static/Icons/rupee.svg" width={16} height={16} />
                  <span>{formatSalaryLPA(job)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="static/Icons/location.svg" width={16} height={16} />
                  <span>{job.city}</span>
                </div>
              </div>
              <p className="hidden sm:block text-sm font-medium text-(--color-black-shade-700) shrink-0 ml-4">{job.companyName}</p>
            </div>

            <div className="h-px w-full bg-(--color-black-shade-100)" />

            {/* Stats + Status + Edit button row */}
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-1.5 text-xs font-medium text-(--color-black-shade-700)">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Openings: <span className="font-semibold">{job.numberOfOpenings}</span></span>
                  <div className="h-4 w-px bg-(--color-black-shade-300)" />
                  <span>Applicants: <span className="font-semibold">{job.applicationCount}</span></span>
                  <div className="h-4 w-px bg-(--color-black-shade-300)" />
                  <span>Type: <span className="font-semibold capitalize">{JOB_TYPE_FROM_MODEL[job.jobType] ?? job.jobType}</span></span>
                  <div className="h-4 w-px bg-(--color-black-shade-300)" />
                  <span>Mode: <span className="font-semibold capitalize">{LOCATION_LABELS[job.jobLocationType] ?? job.jobLocationType}</span></span>
                </div>
                <p className="text-[11px] text-(--color-black-shade-400) font-mono tracking-wide">ID: {job.jobId}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <EditButton onClick={headerEdit.open} label="Edit job header" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-(--color-black-shade-500)">Status:</span>
                  <JobPostStatusDropdown value={job.status ?? "requests"} onChange={handleStatusChange} disabled={updatingStatus} />
                </div>
              </div>
            </div>
          </div>
        </ProfileSectionCard>

        {/* ── Location Card ────────────────────────────────────────── */}
        <ProfileSectionCard className="px-5! py-5! sm:px-6! sm:py-6!">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Location</h2>
            <EditButton onClick={locationEdit.open} label="Edit location" />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-(--color-black-shade-700)">
            {job.city && <span><span className="font-medium">City:</span> {job.city}</span>}
            {job.state && <span><span className="font-medium">State:</span> {job.state}</span>}
            {job.pincode && <span><span className="font-medium">Pincode:</span> {job.pincode}</span>}
            {job.streetAddress1 && <span><span className="font-medium">Address:</span> {job.streetAddress1}</span>}
          </div>
        </ProfileSectionCard>

        {/* ── Job Details Card ─────────────────────────────────────── */}
        <ProfileSectionCard className="px-5! py-5! sm:px-6! sm:py-6!">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Job Details</h2>
            <EditButton onClick={detailsEdit.open} label="Edit job details" />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-(--color-black-shade-700)">
            <span><span className="font-medium">Experience:</span> {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] ?? job.experienceLevel ?? "—"}</span>
            {job.jobSchedule && <span><span className="font-medium">Schedule:</span> {job.jobSchedule}</span>}
          </div>
        </ProfileSectionCard>

        {/* ── Compensation Card ────────────────────────────────────── */}
        <ProfileSectionCard className="px-5! py-5! sm:px-6! sm:py-6!">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Compensation</h2>
            <EditButton onClick={compensationEdit.open} label="Edit compensation" />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-(--color-black-shade-700)">
            <span><span className="font-medium">CTC:</span> {formatSalaryLPA(job)}</span>
            {job.supplementPay?.length > 0 && <span><span className="font-medium">Supplement:</span> {job.supplementPay.join(", ")}</span>}
            {job.benefits?.length > 0 && <span><span className="font-medium">Benefits:</span> {job.benefits.join(", ")}</span>}
          </div>
        </ProfileSectionCard>

        {/* ── Skills Required ───────────────────────────────────────── */}
        <ProfileSectionCard className="px-5! py-5! sm:px-6! sm:py-6!">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Skills Required</h2>
              <div className="flex items-center gap-1 text-xs text-(--color-black-shade-600)">
                <span>Key skills highlighted with</span>
                <Icon name="statics/Employee-Dashboard/Star.svg" width={14} height={14} />
              </div>
            </div>
            <EditButton onClick={skillsEdit.open} label="Edit skills" />
          </div>
          <div className="flex flex-wrap gap-2">
            {job?.skills?.length > 0 ? (
              job.skills.map((skill, index) => (
                <span key={index} className={`rounded-full px-4 py-1.5 text-xs font-medium bg-(--color-primary-shade-100) text-(--color-black-shade-800) ${index === 0 ? "flex items-center gap-1" : ""}`}>
                  {index === 0 && <Icon name="statics/Employee-Dashboard/Star.svg" width={12} height={12} />}
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-(--color-black-shade-600)">No skills mentioned</p>
            )}
          </div>
        </ProfileSectionCard>

        {/* ── Job Description ───────────────────────────────────────── */}
        <ProfileSectionCard className="px-5! py-5! sm:px-6! sm:py-6!">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Job Description</h2>
            <EditButton onClick={descriptionEdit.open} label="Edit job description" />
          </div>
          <div className="rte-content text-[0.9375rem] font-medium text-black" dangerouslySetInnerHTML={{ __html: job.jobDescription }} />
          {job.qualifications?.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-3 text-sm font-semibold text-(--color-black-shade-900)">Qualifications</h3>
              <ul className="list-disc list-inside space-y-1">
                {job.qualifications.map((q, i) => (
                  <li key={i} className="text-sm text-(--color-black-shade-700)">{q}</li>
                ))}
              </ul>
            </div>
          )}
        </ProfileSectionCard>

        {/* ── About the Company ─────────────────────────────────────── */}
        <ProfileSectionCard className="px-5! py-5! sm:px-6! sm:py-6!">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-(--color-black-shade-900)">About the Company</h2>
            <EditButton onClick={companyDescEdit.open} label="Edit company description" />
          </div>
          <div className="flex gap-4 mb-4">
            <CompanyAvatar companyName={job.companyName} size="lg" className="rounded-xl" />
            <div>
              <h3 className="text-base font-semibold text-(--color-black-shade-900)">{job.companyName}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {job.city && (
                  <span className="rounded-full bg-(--color-primary-shade-100) px-3 py-1 text-xs font-medium">
                    Head Office: {job.city}
                  </span>
                )}
              </div>
            </div>
          </div>
          {job.companyDescription && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-(--color-black-shade-900)">Overview</h4>
              <div className="rte-content text-[0.9375rem] font-medium text-black" dangerouslySetInnerHTML={{ __html: job.companyDescription }} />
            </div>
          )}
        </ProfileSectionCard>

      </div>
    </>
  );
}

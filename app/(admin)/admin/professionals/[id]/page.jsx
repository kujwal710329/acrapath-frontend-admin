"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/utilities/api";
import { adminUpdateProfessionalProfile, adminDocumentPresignedUrl, adminSaveDocument, adminDeleteDocument } from "@/services/professionals.service";
import { showSuccess, showError } from "@/utilities/toast";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Icon from "@/components/common/Icon";
import Label from "@/components/common/Label";
import FixedBackButton from "@/components/common/FixedBackButton";
import Carousel from "@/components/common/Carousel";
import EditSectionModal from "@/components/common/EditSectionModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import CreatableSelect from "@/components/common/CreatableSelect";
import { useMetadataData } from "@/hooks/useMetadata";

/* ─── Constants ────────────────────────────────────────────────────── */

const PROFESSIONAL_CATEGORIES = [
  { value: "developer", label: "Developer" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "designer", label: "Designer" },
  { value: "consultant", label: "Consultant" },
];

const ENUM_TO_METADATA_KEY = {
  developer: "Development",
  marketing: "Marketing",
  sales: "Sales",
  designer: "Design",
  consultant: "Consultancy",
};


const DEGREE_LEVEL_OPTIONS = [
  "Bachelor's",
  "Master's",
  "Doctorate (PhD)",
  "Diploma",
  "Certificate",
  "12th / Higher Secondary",
  "10th / Secondary",
  "Other",
];

const GRADE_TYPE_OPTIONS = ["Percentage", "CGPA", "GPA", "Grade"];

const SALARY_PERIOD_OPTIONS = ["per annum", "per month"];

/* ─── Helpers ─────────────────────────────────────────────────────── */

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatDuration(joiningDate, relievingDate, currentlyWorking) {
  const start = formatDate(joiningDate);
  const end = currentlyWorking ? "Present" : formatDate(relievingDate);
  if (!start && !end) return null;
  return [start, end].filter(Boolean).join(" to ");
}

function formatSalaryAmt(amount, period) {
  if (!amount) return null;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} LPA`;
  return `₹${amount.toLocaleString("en-IN")} ${period ?? ""}`.trim();
}

function formatStipend(amount, period) {
  if (!amount) return null;
  return `₹${amount.toLocaleString("en-IN")} ${period ?? ""}`.trim();
}

function toInputDate(iso) {
  if (!iso) return "";
  return String(iso).split("T")[0];
}

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

/* ─── Delete icon button ───────────────────────────────────────────── */

function DeleteButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center w-7 h-7 rounded-full text-(--color-black-shade-400) hover:text-(--color-red) hover:bg-red-50 transition-colors cursor-pointer shrink-0"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}

/* ─── Add button ───────────────────────────────────────────────────── */

function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer"
      style={{ color: "var(--color-primary)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {label}
    </button>
  );
}

/* ─── Tag pill ─────────────────────────────────────────────────────── */

function TagPill({ label, onRemove, disabled }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-shade-100) px-3 py-1 text-xs font-medium text-(--color-black-shade-900)">
      {label}
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="flex items-center text-(--color-black-shade-500) hover:text-(--color-red) cursor-pointer"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
}

/* ─── Shared input style ───────────────────────────────────────────── */

const inputBase = "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400) border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError = "border-(--color-red)! focus:border-(--color-red)!";

/* ─── Reusable sub-components ─────────────────────────────────────── */

function MetaRow({ icon, text }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon} width={16} height={16} />
      <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
        {text}
      </span>
    </div>
  );
}

function ContactRow({ icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} width={16} height={16} alt={label} />
      <div className="min-w-0">
        <p className="text-12 font-semibold" style={{ color: "var(--color-black-shade-700)" }}>{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-12 break-all hover:underline" style={{ color: "var(--color-primary)" }}>
            {value}
          </a>
        ) : (
          <p className="text-12 break-all" style={{ color: "var(--color-black-shade-600)" }}>{value}</p>
        )}
      </div>
    </div>
  );
}

function SidebarCard({ title, children, onEdit, editLabel }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-14 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>{title}</p>
        {onEdit && <EditButton onClick={onEdit} label={editLabel ?? `Edit ${title}`} />}
      </div>
      <div className="relative rounded-xl border border-(--color-black-shade-200) overflow-hidden">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function StatusBadges({ user }) {
  const hasAny = user.profileVerificationStatus || user.accountStatus || user.workPreference?.status || user.score != null;
  if (!hasAny) return null;
  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      {user.profileVerificationStatus && (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${user.profileVerificationStatus === "verified" ? "bg-green-100 text-green-700" : user.profileVerificationStatus === "pending" ? "bg-yellow-100 text-yellow-700" : user.profileVerificationStatus === "rejected" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
          {user.profileVerificationStatus === "verified" && <Icon name="static/Icons/Verified.png" width={13} height={13} alt="verified" />}
          {user.profileVerificationStatus === "verified" ? "Profile Verified" : user.profileVerificationStatus === "pending" ? "Verification Pending" : user.profileVerificationStatus}
        </span>
      )}
      {user.accountStatus && (
        <span className={`px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${user.accountStatus === "active" ? "bg-green-100 text-green-700" : user.accountStatus === "inactive" || user.accountStatus === "suspended" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
          {user.accountStatus}
        </span>
      )}
      {user.workPreference?.status && (
        <span className={`px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${user.workPreference.status === "actively-looking" ? "bg-blue-100 text-blue-700" : user.workPreference.status === "open" ? "bg-purple-100 text-purple-700" : user.workPreference.status === "not-looking" ? "bg-gray-100 text-gray-500" : "bg-gray-100 text-gray-600"}`}>
          {user.workPreference.status.replace(/-/g, " ")}
        </span>
      )}
      {user.score != null && (
        <span className="px-2.5 py-0.5 rounded-full text-12 font-semibold bg-(--color-primary-shade-100)" style={{ color: "var(--color-primary)" }}>
          Score: {user.score}
        </span>
      )}
    </div>
  );
}

function TimelineSection({ title, isOpen, onToggle, hasContent, children, onAdd, addLabel }) {
  return (
    <div className="rounded-xl p-5 md:p-6 border border-(--color-black-shade-200)">
      <button onClick={onToggle} className="w-full flex items-center justify-between lg:pointer-events-none" aria-expanded={isOpen}>
        <h2 className="text-18 md:text-20 font-bold" style={{ color: "var(--color-black-shade-900)" }}>{title}</h2>
        <svg className={`w-5 h-5 shrink-0 transition-transform duration-200 lg:hidden ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--color-black-shade-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`mt-6 ${isOpen ? "block" : "hidden"} lg:block`}>
        {hasContent ? children : <p className="text-14" style={{ color: "var(--color-black-shade-400)" }}>No data added yet.</p>}
        {onAdd && <AddButton onClick={onAdd} label={addLabel ?? "Add Entry"} />}
      </div>
    </div>
  );
}

function TimelineDot() {
  return <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full z-10 shrink-0 bg-(--color-primary) border-2 border-white ring-2 ring-(--color-primary-shade-300)" />;
}

/* ─── Skeleton ─────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="container-80 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8 animate-pulse">
      <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-5">
        <div className="w-88 h-80 mx-auto lg:w-full lg:h-auto rounded-xl bg-(--color-black-shade-100) lg:aspect-square" />
        <div className="h-10 rounded-xl bg-(--color-black-shade-100)" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-(--color-black-shade-100)" />
        ))}
      </aside>
      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="h-32 rounded-xl bg-(--color-black-shade-100)" />
        <div className="h-px bg-(--color-black-shade-100)" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-(--color-black-shade-100)" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-(--color-black-shade-100)" />
        ))}
      </main>
    </div>
  );
}

/* ─── DocSlot — per-document upload/view/replace/remove row ───────── */

function DocSlot({ label, url, uploading, error, fileName, onUpload, onRemove }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-14 font-semibold" style={{ color: "var(--color-black-shade-700)" }}>{label}</p>
      {uploading ? (
        <div className="mt-1 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ color: "var(--color-primary)" }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-12" style={{ color: "var(--color-black-shade-500)" }}>Uploading…</span>
        </div>
      ) : url ? (
        <div>
          {fileName && <p className="text-11 mt-0.5 truncate" style={{ color: "var(--color-black-shade-500)" }}>{fileName}</p>}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-12 font-medium hover:underline" style={{ color: "var(--color-primary)" }}>View</a>
            <button type="button" onClick={onUpload} className="text-12 font-medium hover:underline cursor-pointer" style={{ color: "var(--color-black-shade-600)" }}>Replace</button>
            <button type="button" onClick={onRemove} className="text-12 font-medium hover:underline cursor-pointer" style={{ color: "var(--color-red)" }}>Remove</button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-400)" }}>Not uploaded</p>
          <button type="button" onClick={onUpload} className="mt-1.5 text-12 font-medium hover:underline cursor-pointer" style={{ color: "var(--color-primary)" }}>Upload File</button>
        </div>
      )}
      {error && <p className="mt-1 text-11" style={{ color: "var(--color-red)" }}>{error}</p>}
    </div>
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

/* ─── useArrayModal — for add/edit/delete on array sections ───────── */

function useArrayModal() {
  const [state, setState] = useState({ open: false, entry: null, idx: -1, loading: false });
  const openAdd = useCallback(() => setState({ open: true, entry: null, idx: -1, loading: false }), []);
  const openEdit = useCallback((entry, idx) => setState({ open: true, entry, idx, loading: false }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false, entry: null, idx: -1 })), []);
  const setLoading = useCallback((v) => setState((s) => ({ ...s, loading: v })), []);
  return { ...state, openAdd, openEdit, close, setLoading };
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  EDIT MODALS                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

/* Professional Info (name, designation, category, experience, roles) */
function ProfessionalInfoModal({ user, onSave, onClose, isLoading, onSetDirty }) {
  const { metadata } = useMetadataData();
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    middleName: user.middleName || "",
    lastName: user.lastName || "",
    currentDesignation: user.currentDesignation || user.designation || "",
    professionalCategory: user.professionalCategory || "",
    yearsOfExperience: user.yearsOfExperience || "",
    openToRoles: user.openToRoles?.slice() || [],
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === "professionalCategory") next.openToRoles = [];
      return next;
    });
    setErrors((prev) => { const n = { ...prev }; delete n[field]; if (field === "professionalCategory") delete n.openToRoles; return n; });
    onSetDirty();
  };

  const metaKey = ENUM_TO_METADATA_KEY[form.professionalCategory];
  const roleOptions = (metaKey && metadata.jobRolesByCategory?.[metaKey]) || metadata.commonJobRoles || [];
  const availableRoles = roleOptions.filter((r) => !form.openToRoles.includes(r));

  const addRole = (role) => {
    if (!role || form.openToRoles.includes(role) || form.openToRoles.length >= 3) return;
    set("openToRoles", [...form.openToRoles, role]);
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.professionalCategory) e.professionalCategory = "Category is required.";
    if (form.yearsOfExperience === "") e.yearsOfExperience = "Experience is required.";
    if (!form.openToRoles.length) e.openToRoles = "Select at least one role.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      personalInfo: { currentDesignation: form.currentDesignation.trim(), professionalCategory: form.professionalCategory, yearsOfExperience: parseFloat(form.yearsOfExperience), openToRoles: form.openToRoles },
    });
  };

  return (
    <EditSectionModal title="Edit Professional Info" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>First Name</Label>
        <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="First name" className={`${inputBase} ${errors.firstName ? inputError : ""}`} />
        {errors.firstName && <p className="mt-1 text-xs text-(--color-red)">{errors.firstName}</p>}
      </div>
      <div className="mb-4">
        <Label>Middle Name</Label>
        <input value={form.middleName} onChange={(e) => set("middleName", e.target.value)} placeholder="Middle name (optional)" className={inputBase} />
      </div>
      <div className="mb-4">
        <Label required>Last Name</Label>
        <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Last name" className={`${inputBase} ${errors.lastName ? inputError : ""}`} />
        {errors.lastName && <p className="mt-1 text-xs text-(--color-red)">{errors.lastName}</p>}
      </div>
      <div className="mb-4">
        <Label>Current Designation</Label>
        <input value={form.currentDesignation} onChange={(e) => set("currentDesignation", e.target.value)} placeholder="e.g. Senior Developer" className={inputBase} />
      </div>
      <div className="mb-4">
        <Label required>Professional Category</Label>
        <CreatableSelect
          options={PROFESSIONAL_CATEGORIES.map((c) => c.label)}
          value={PROFESSIONAL_CATEGORIES.find((c) => c.value === form.professionalCategory)?.label || ""}
          allowCreate={false} showAllOnOpen placeholder="Select category"
          error={errors.professionalCategory}
          onChange={(label) => { const cat = PROFESSIONAL_CATEGORIES.find((c) => c.label === label); set("professionalCategory", cat?.value || ""); }}
          className="mb-0!"
        />
      </div>
      <div className="mb-4">
        <Label required>Years of Experience</Label>
        <Input
          type="number"
          min="0"
          step="0.5"
          placeholder="e.g. 0 for fresher, 1.5, 2, 5.5"
          value={form.yearsOfExperience}
          onChange={(e) => { set("yearsOfExperience", e.target.value); if (e.target.value !== "") setErrors((p) => { const n = { ...p }; delete n.yearsOfExperience; return n; }); }}
        />
        {errors.yearsOfExperience && <p className="mt-1 text-xs text-(--color-red)">{errors.yearsOfExperience}</p>}
      </div>
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <Label required>Open to Roles</Label>
          <span className="text-xs text-(--color-black-shade-500)">{form.openToRoles.length} / 3</span>
        </div>
        {form.openToRoles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {form.openToRoles.map((role) => (
              <TagPill key={role} label={role} onRemove={() => set("openToRoles", form.openToRoles.filter((r) => r !== role))} />
            ))}
          </div>
        )}
        {form.professionalCategory ? (
          <CreatableSelect
            placeholder={form.openToRoles.length >= 3 ? "Maximum 3 roles selected" : "Type or select role"}
            options={availableRoles} value="" allowCreate showAllOnOpen
            isDisabled={form.openToRoles.length >= 3}
            error={errors.openToRoles} onChange={addRole} className="mb-0!"
          />
        ) : (
          <p className="text-sm text-(--color-black-shade-400) italic">Select a category above to see available roles.</p>
        )}
      </div>
    </EditSectionModal>
  );
}

/* Profile Summary */
function ProfileSummaryModal({ user, onSave, onClose, isLoading, onSetDirty }) {
  const [summary, setSummary] = useState(user.profileSummary || "");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!summary.trim()) { setError("Profile summary cannot be empty."); return; }
    onSave({ professionalInfo: { profileSummary: summary.trim() } });
  };

  return (
    <EditSectionModal title="Edit Profile Summary" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <Label required>Profile Summary</Label>
      <textarea
        value={summary}
        onChange={(e) => { setSummary(e.target.value); setError(""); onSetDirty(); }}
        rows={6} placeholder="Write a brief professional summary…"
        className={`w-full rounded-xl border px-5 py-4 text-[0.9375rem] font-medium outline-none transition-colors resize-none placeholder:text-(--color-black-shade-400) ${error ? "border-(--color-red)" : "border-(--color-black-shade-300) focus:border-(--color-primary)"}`}
      />
      <div className="mt-1 flex items-center justify-between">
        {error && <p className="text-xs text-(--color-red)">{error}</p>}
        <p className="ml-auto text-xs text-(--color-black-shade-400)">{summary.length} / 3000</p>
      </div>
    </EditSectionModal>
  );
}

function SkillsModal({ user, onSave, onClose, isLoading, onSetDirty }) {
  const { metadata } = useMetadataData();
  const rawSkills = user.skills ?? [];
  const initialSkills = rawSkills.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean);
  const [skills, setSkills] = useState(initialSkills);
  const [error, setError] = useState("");

  const addSkill = (skill) => {
    if (!skill) return;
    if (skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())) return;
    if (skills.length >= 15) { setError("Maximum 15 skills allowed."); return; }
    setSkills((prev) => [...prev, skill]);
    setError("");
    onSetDirty();
  };

  const removeSkill = (skill) => { setSkills((prev) => prev.filter((s) => s !== skill)); onSetDirty(); };

  const metaSkills = [
    ...Object.values(metadata.techSkillsByCategory || {}).flat(),
    ...Object.values(metadata.strategicSkillsByCategory || {}).flat(),
  ].filter((v, i, arr) => arr.indexOf(v) === i);
  const availableSkills = metaSkills.filter((s) => !skills.map((x) => x.toLowerCase()).includes(s.toLowerCase()));

  const handleSave = () => {
    if (!skills.length) { setError("Add at least one skill."); return; }
    onSave({ professionalInfo: { skills: skills.map((name) => ({ name })) } });
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
      aria-label="Edit Skills"
    >
      <div className="w-full max-w-lg rounded-2xl bg-(--pure-white) shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-black-shade-100) shrink-0">
          <h2 className="text-16 font-semibold text-(--color-black-shade-900)">Edit Skills</h2>
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
              <Label required>Skills</Label>
              <span className="text-xs text-(--color-black-shade-500)">{skills.length} / 15</span>
            </div>
            {skills.length > 0 && (
              <div className="mb-3 max-h-24 overflow-y-auto flex flex-wrap gap-2 pr-1">
                {skills.map((s) => (
                  <TagPill key={s} label={s} onRemove={() => removeSkill(s)} />
                ))}
              </div>
            )}
          </div>
          <div className="px-6 pb-5 shrink-0">
            <CreatableSelect
              placeholder="Type to search or add a skill"
              options={availableSkills}
              value=""
              allowCreate
              showAllOnOpen={false}
              isDisabled={skills.length >= 15}
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

/* Top 3 Featured Skills */
function TopSkillsModal({ user, onSave, onClose, isLoading, onSetDirty }) {
  const rawSkills = (user.skills ?? []).map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean);
  const toName = (v) => (v && typeof v === "object" ? v.skillName : v) || "";
  const [top, setTop] = useState([
    toName(user.topSkills?.[0]),
    toName(user.topSkills?.[1]),
    toName(user.topSkills?.[2]),
  ]);

  const set = (idx, val) => {
    setTop((prev) => { const n = [...prev]; n[idx] = val; return n; });
    onSetDirty();
  };

  const availableFor = (idx) => rawSkills.filter((s) => !top.some((t, i) => i !== idx && t === s));

  const handleSave = () => {
    onSave({ topSkills: top.filter(Boolean).map((name) => ({ skillName: name })) });
  };

  return (
    <EditSectionModal title="Edit Top 3 Featured Skills" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <p className="mb-4 text-sm text-(--color-black-shade-500)">Select up to 3 skills to feature prominently on the profile.</p>
      {[0, 1, 2].map((idx) => (
        <div key={idx} className="mb-4">
          <Label>Skill {idx + 1}{idx === 0 ? " (Primary — shown with star)" : " (optional)"}</Label>
          <CreatableSelect
            options={availableFor(idx)} value={top[idx]} allowCreate={false} showAllOnOpen
            placeholder={`Select skill ${idx + 1}`}
            onChange={(v) => set(idx, v)} className="mb-0!"
          />
        </div>
      ))}
    </EditSectionModal>
  );
}

/* Preferred Locations */
function PreferredLocationsModal({ user, onSave, onClose, isLoading, onSetDirty }) {
  const existing = user.jobPreferences?.preferredLocations ?? user.preferredLocations ?? [];
  const [locs, setLocs] = useState([
    existing[0] || "",
    existing[1] || "",
    existing[2] || "",
  ]);

  const set = (idx, val) => {
    setLocs((prev) => { const n = [...prev]; n[idx] = val; return n; });
    onSetDirty();
  };

  const handleSave = () => {
    onSave({ jobPreferences: { preferredLocations: locs.map((l) => l.trim()).filter(Boolean) } });
  };

  return (
    <EditSectionModal title="Edit Preferred Locations" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <p className="mb-4 text-sm text-(--color-black-shade-500)">Enter up to 3 preferred work locations (city, state).</p>
      {[0, 1, 2].map((idx) => (
        <div key={idx} className="mb-4">
          <Label>{["1st", "2nd", "3rd"][idx]} Preference{idx > 0 ? " (optional)" : ""}</Label>
          <input
            value={locs[idx]} onChange={(e) => set(idx, e.target.value)}
            placeholder="e.g. Mumbai, Maharashtra" className={inputBase}
          />
        </div>
      ))}
    </EditSectionModal>
  );
}

/* Contact & Location */
function ContactModal({ user, onSave, onClose, isLoading, onSetDirty }) {
  const [form, setForm] = useState({
    contactNo: user.contactNo || "",
    countryCode: user.countryCode || "91",
    whatsappNo: user.whatsappNo || "",
    currentCity: user.currentLocation || user.currentCity || "",
    linkedin: user.linkedin || "",
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    onSetDirty();
  };

  const validate = () => {
    const e = {};
    if (!form.contactNo.trim()) e.contactNo = "Contact number is required.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = {};
    if (form.contactNo.trim()) payload.contactNo = form.contactNo.trim();
    if (form.countryCode.trim()) payload.countryCode = form.countryCode.trim();
    payload.whatsappNo = form.whatsappNo.trim();
    if (form.currentCity.trim()) payload.currentCity = form.currentCity.trim();
    payload.linkedin = form.linkedin.trim();
    onSave({ personalInfo: payload });
  };

  return (
    <EditSectionModal title="Edit Contact & Location" isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Country Code</Label>
          <input value={form.countryCode} onChange={(e) => set("countryCode", e.target.value.replace(/\D/g, ""))} placeholder="91" className={inputBase} maxLength={4} />
        </div>
        <div>
          <Label required>Contact Number</Label>
          <input value={form.contactNo} onChange={(e) => set("contactNo", e.target.value.replace(/\D/g, ""))} placeholder="9876543210" className={`${inputBase} ${errors.contactNo ? inputError : ""}`} />
          {errors.contactNo && <p className="mt-1 text-xs text-(--color-red)">{errors.contactNo}</p>}
        </div>
      </div>
      <div className="mb-4">
        <Label>WhatsApp Number</Label>
        <input value={form.whatsappNo} onChange={(e) => set("whatsappNo", e.target.value.replace(/\D/g, ""))} placeholder="Same as contact or different" className={inputBase} />
      </div>
      <div className="mb-4">
        <Label>Current City</Label>
        <input value={form.currentCity} onChange={(e) => set("currentCity", e.target.value)} placeholder="e.g. Mumbai" className={inputBase} />
      </div>
      <div className="mb-4">
        <Label>LinkedIn URL</Label>
        <input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." className={inputBase} />
      </div>
    </EditSectionModal>
  );
}

/* ─── Work Experience entry modal ──────────────────────────────────── */

function WorkExpEntryModal({ entry, onSave, onClose, isLoading }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    companyName: entry?.companyName || "",
    role: entry?.role || "",
    salary: entry?.salary ? String(Math.round(entry.salary / 100000 * 10) / 10) : "",
    salaryPeriod: entry?.salaryPeriod || "per annum",
    joiningDate: toInputDate(entry?.joiningDate),
    relievingDate: toInputDate(entry?.relievingDate),
    currentlyWorking: entry?.currentlyWorking || false,
    points: entry?.points?.filter(Boolean) || [],
  });
  const [errors, setErrors] = useState({});
  const [newPoint, setNewPoint] = useState("");

  const set = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const addPoint = () => {
    const trimmed = newPoint.trim();
    if (!trimmed || form.points.length >= 5) return;
    set("points", [...form.points, trimmed]);
    setNewPoint("");
  };

  const removePoint = (idx) => set("points", form.points.filter((_, i) => i !== idx));

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.role.trim()) e.role = "Role is required.";
    if (!form.joiningDate) e.joiningDate = "Start date is required.";
    if (!form.currentlyWorking && !form.relievingDate) e.relievingDate = "End date is required (or toggle Currently Working).";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const salaryLPA = parseFloat(form.salary);
    onSave({
      companyName: form.companyName.trim(),
      role: form.role.trim(),
      salary: !isNaN(salaryLPA) && salaryLPA > 0 ? Math.round(salaryLPA * 100000) : undefined,
      salaryPeriod: form.salaryPeriod,
      joiningDate: form.joiningDate || undefined,
      relievingDate: form.currentlyWorking ? undefined : (form.relievingDate || undefined),
      currentlyWorking: form.currentlyWorking,
      points: form.points.filter(Boolean),
    });
  };

  return (
    <EditSectionModal title={isEdit ? "Edit Work Experience" : "Add Work Experience"} isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Company Name</Label>
        <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Google" className={`${inputBase} ${errors.companyName ? inputError : ""}`} />
        {errors.companyName && <p className="mt-1 text-xs text-(--color-red)">{errors.companyName}</p>}
      </div>
      <div className="mb-4">
        <Label required>Role / Designation</Label>
        <input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Software Engineer" className={`${inputBase} ${errors.role ? inputError : ""}`} />
        {errors.role && <p className="mt-1 text-xs text-(--color-red)">{errors.role}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Salary (LPA)</Label>
          <input type="number" min="0" step="0.1" value={form.salary} onChange={(e) => set("salary", e.target.value)} placeholder="e.g. 12.5" className={inputBase} />
        </div>
        <div>
          <Label>Period</Label>
          <CreatableSelect options={SALARY_PERIOD_OPTIONS} value={form.salaryPeriod} allowCreate={false} showAllOnOpen onChange={(v) => set("salaryPeriod", v)} className="mb-0!" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label required>Start Date</Label>
          <input type="date" value={form.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} className={`${inputBase} ${errors.joiningDate ? inputError : ""}`} />
          {errors.joiningDate && <p className="mt-1 text-xs text-(--color-red)">{errors.joiningDate}</p>}
        </div>
        <div>
          <Label required={!form.currentlyWorking}>End Date</Label>
          <input type="date" value={form.relievingDate} disabled={form.currentlyWorking} onChange={(e) => set("relievingDate", e.target.value)} className={`${inputBase} ${errors.relievingDate ? inputError : ""} ${form.currentlyWorking ? "opacity-40 cursor-not-allowed" : ""}`} />
          {errors.relievingDate && <p className="mt-1 text-xs text-(--color-red)">{errors.relievingDate}</p>}
        </div>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.currentlyWorking} onChange={(e) => { set("currentlyWorking", e.target.checked); if (e.target.checked) set("relievingDate", ""); }} className="w-4 h-4 rounded accent-(--color-primary)" />
          <span className="text-sm font-medium text-(--color-black-shade-700)">Currently working here</span>
        </label>
      </div>
      <div className="mb-2">
        <Label>Key Points <span className="text-xs font-normal text-(--color-black-shade-400)">(optional, max 5)</span></Label>
        <div className="space-y-2 mb-2">
          {form.points.map((p, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-(--color-black-shade-200) px-3 py-2">
              <p className="flex-1 text-sm text-(--color-black-shade-700)">{p}</p>
              <button type="button" onClick={() => removePoint(i)} className="text-(--color-black-shade-400) hover:text-(--color-red) cursor-pointer shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ))}
        </div>
        {form.points.length < 5 && (
          <div className="flex gap-2">
            <input value={newPoint} onChange={(e) => setNewPoint(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPoint(); } }} placeholder="Add a bullet point…" className={`${inputBase} flex-1`} />
            <button type="button" onClick={addPoint} className="h-14 px-4 rounded-xl border border-(--color-black-shade-300) text-sm font-medium text-(--color-primary) hover:bg-(--color-primary-shade-100) transition-colors cursor-pointer">Add</button>
          </div>
        )}
      </div>
    </EditSectionModal>
  );
}

/* ─── Internship entry modal ───────────────────────────────────────── */

function InternshipEntryModal({ entry, onSave, onClose, isLoading }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    companyName: entry?.companyName || "",
    role: entry?.role || "",
    stipend: entry?.stipend ? String(entry.stipend) : "",
    stipendPeriod: entry?.stipendPeriod || "per month",
    joiningDate: toInputDate(entry?.joiningDate),
    relievingDate: toInputDate(entry?.relievingDate),
    currentlyWorking: entry?.currentlyWorking || false,
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.role.trim()) e.role = "Role is required.";
    if (!form.joiningDate) e.joiningDate = "Start date is required.";
    if (!form.currentlyWorking && !form.relievingDate) e.relievingDate = "End date is required.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const stipendNum = parseInt(form.stipend, 10);
    onSave({
      companyName: form.companyName.trim(),
      role: form.role.trim(),
      stipend: !isNaN(stipendNum) && stipendNum > 0 ? stipendNum : undefined,
      stipendPeriod: "per month",
      joiningDate: form.joiningDate || undefined,
      relievingDate: form.currentlyWorking ? undefined : (form.relievingDate || undefined),
      currentlyWorking: form.currentlyWorking,
    });
  };

  return (
    <EditSectionModal title={isEdit ? "Edit Internship" : "Add Internship"} isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Company Name</Label>
        <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Google" className={`${inputBase} ${errors.companyName ? inputError : ""}`} />
        {errors.companyName && <p className="mt-1 text-xs text-(--color-red)">{errors.companyName}</p>}
      </div>
      <div className="mb-4">
        <Label required>Role</Label>
        <input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. SDE Intern" className={`${inputBase} ${errors.role ? inputError : ""}`} />
        {errors.role && <p className="mt-1 text-xs text-(--color-red)">{errors.role}</p>}
      </div>
      <div className="mb-4">
        <Label>Stipend (per month, ₹)</Label>
        <input type="number" min="0" value={form.stipend} onChange={(e) => set("stipend", e.target.value)} placeholder="e.g. 15000" className={inputBase} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label required>Start Date</Label>
          <input type="date" value={form.joiningDate} onChange={(e) => set("joiningDate", e.target.value)} className={`${inputBase} ${errors.joiningDate ? inputError : ""}`} />
          {errors.joiningDate && <p className="mt-1 text-xs text-(--color-red)">{errors.joiningDate}</p>}
        </div>
        <div>
          <Label required={!form.currentlyWorking}>End Date</Label>
          <input type="date" value={form.relievingDate} disabled={form.currentlyWorking} onChange={(e) => set("relievingDate", e.target.value)} className={`${inputBase} ${errors.relievingDate ? inputError : ""} ${form.currentlyWorking ? "opacity-40 cursor-not-allowed" : ""}`} />
          {errors.relievingDate && <p className="mt-1 text-xs text-(--color-red)">{errors.relievingDate}</p>}
        </div>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.currentlyWorking} onChange={(e) => { set("currentlyWorking", e.target.checked); if (e.target.checked) set("relievingDate", ""); }} className="w-4 h-4 rounded accent-(--color-primary)" />
          <span className="text-sm font-medium text-(--color-black-shade-700)">Currently working here</span>
        </label>
      </div>
    </EditSectionModal>
  );
}

/* ─── Education entry modal ────────────────────────────────────────── */

function EducationEntryModal({ entry, onSave, onClose, isLoading }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    degreeLevel: entry?.degreeLevel || "",
    fieldOfStudy: entry?.fieldOfStudy || "",
    collegeName: entry?.collegeName || "",
    grade: entry?.grade || "",
    gradeType: entry?.gradeType || "Percentage",
    startDate: toInputDate(entry?.startDate),
    endDate: toInputDate(entry?.endDate),
    currentlyStudying: entry?.currentlyStudying || false,
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.degreeLevel) e.degreeLevel = "Degree level is required.";
    if (!form.collegeName.trim()) e.collegeName = "College / institution name is required.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      degreeLevel: form.degreeLevel,
      fieldOfStudy: form.fieldOfStudy.trim(),
      collegeName: form.collegeName.trim(),
      grade: form.grade.trim(),
      gradeType: form.gradeType,
      startDate: form.startDate || undefined,
      endDate: form.currentlyStudying ? undefined : (form.endDate || undefined),
      currentlyStudying: form.currentlyStudying,
    });
  };

  return (
    <EditSectionModal title={isEdit ? "Edit Education" : "Add Education"} isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Degree Level</Label>
        <CreatableSelect
          options={DEGREE_LEVEL_OPTIONS} value={form.degreeLevel} allowCreate={false} showAllOnOpen
          placeholder="Select degree" error={errors.degreeLevel}
          onChange={(v) => set("degreeLevel", v)} className="mb-0!"
        />
        {errors.degreeLevel && <p className="mt-1 text-xs text-(--color-red)">{errors.degreeLevel}</p>}
      </div>
      <div className="mb-4">
        <Label>Field of Study</Label>
        <input value={form.fieldOfStudy} onChange={(e) => set("fieldOfStudy", e.target.value)} placeholder="e.g. Computer Science" className={inputBase} />
      </div>
      <div className="mb-4">
        <Label required>College / Institution</Label>
        <input value={form.collegeName} onChange={(e) => set("collegeName", e.target.value)} placeholder="e.g. IIT Delhi" className={`${inputBase} ${errors.collegeName ? inputError : ""}`} />
        {errors.collegeName && <p className="mt-1 text-xs text-(--color-red)">{errors.collegeName}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Grade / Score</Label>
          <input value={form.grade} onChange={(e) => set("grade", e.target.value)} placeholder="e.g. 8.5 or 85" className={inputBase} />
        </div>
        <div>
          <Label>Grade Type</Label>
          <CreatableSelect options={GRADE_TYPE_OPTIONS} value={form.gradeType} allowCreate={false} showAllOnOpen onChange={(v) => set("gradeType", v)} className="mb-0!" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Start Date</Label>
          <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputBase} />
        </div>
        <div>
          <Label>End Date</Label>
          <input type="date" value={form.endDate} disabled={form.currentlyStudying} onChange={(e) => set("endDate", e.target.value)} className={`${inputBase} ${form.currentlyStudying ? "opacity-40 cursor-not-allowed" : ""}`} />
        </div>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.currentlyStudying} onChange={(e) => { set("currentlyStudying", e.target.checked); if (e.target.checked) set("endDate", ""); }} className="w-4 h-4 rounded accent-(--color-primary)" />
          <span className="text-sm font-medium text-(--color-black-shade-700)">Currently studying here</span>
        </label>
      </div>
    </EditSectionModal>
  );
}

/* ─── Project entry modal ──────────────────────────────────────────── */

function ProjectEntryModal({ entry, onSave, onClose, isLoading }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    projectName: entry?.projectName || "",
    description: entry?.description || "",
    projectLink: entry?.projectLink || "",
    points: entry?.points?.filter(Boolean) || [],
  });
  const [errors, setErrors] = useState({});
  const [newPoint, setNewPoint] = useState("");

  const set = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const addPoint = () => {
    const trimmed = newPoint.trim();
    if (!trimmed || form.points.length >= 5) return;
    set("points", [...form.points, trimmed]);
    setNewPoint("");
  };

  const removePoint = (idx) => set("points", form.points.filter((_, i) => i !== idx));

  const validate = () => {
    const e = {};
    if (!form.projectName.trim()) e.projectName = "Project name is required.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      projectName: form.projectName.trim(),
      description: form.description.trim(),
      projectLink: form.projectLink.trim(),
      points: form.points.filter(Boolean),
    });
  };

  return (
    <EditSectionModal title={isEdit ? "Edit Project" : "Add Project"} isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Project Name</Label>
        <input value={form.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="e.g. E-commerce Platform" className={`${inputBase} ${errors.projectName ? inputError : ""}`} />
        {errors.projectName && <p className="mt-1 text-xs text-(--color-red)">{errors.projectName}</p>}
      </div>
      <div className="mb-4">
        <Label>Description</Label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Brief description of the project…" className="w-full rounded-xl border border-(--color-black-shade-300) px-5 py-4 text-[0.9375rem] font-medium outline-none transition-colors resize-none placeholder:text-(--color-black-shade-400) focus:border-(--color-primary) text-(--color-black-shade-900)" />
      </div>
      <div className="mb-4">
        <Label>Project Link</Label>
        <input value={form.projectLink} onChange={(e) => set("projectLink", e.target.value)} placeholder="https://github.com/..." className={inputBase} />
      </div>
      <div className="mb-2">
        <Label>Key Points <span className="text-xs font-normal text-(--color-black-shade-400)">(optional, max 5)</span></Label>
        <div className="space-y-2 mb-2">
          {form.points.map((p, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-(--color-black-shade-200) px-3 py-2">
              <p className="flex-1 text-sm text-(--color-black-shade-700)">{p}</p>
              <button type="button" onClick={() => removePoint(i)} className="text-(--color-black-shade-400) hover:text-(--color-red) cursor-pointer shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ))}
        </div>
        {form.points.length < 5 && (
          <div className="flex gap-2">
            <input value={newPoint} onChange={(e) => setNewPoint(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPoint(); } }} placeholder="Add a bullet point…" className={`${inputBase} flex-1`} />
            <button type="button" onClick={addPoint} className="h-14 px-4 rounded-xl border border-(--color-black-shade-300) text-sm font-medium text-(--color-primary) hover:bg-(--color-primary-shade-100) transition-colors cursor-pointer">Add</button>
          </div>
        )}
      </div>
    </EditSectionModal>
  );
}

/* ─── Achievement entry modal ──────────────────────────────────────── */

function AchievementEntryModal({ entry, onSave, onClose, isLoading }) {
  const isEdit = !!entry;
  const [form, setForm] = useState({
    title: entry?.title || "",
    description: entry?.description || "",
    date: toInputDate(entry?.date),
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Achievement title is required.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ title: form.title.trim(), description: form.description.trim(), date: form.date || undefined });
  };

  return (
    <EditSectionModal title={isEdit ? "Edit Achievement" : "Add Achievement"} isOpen onClose={onClose} onSave={handleSave} isLoading={isLoading}>
      <div className="mb-4">
        <Label required>Title</Label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Best Employee of the Year" className={`${inputBase} ${errors.title ? inputError : ""}`} />
        {errors.title && <p className="mt-1 text-xs text-(--color-red)">{errors.title}</p>}
      </div>
      <div className="mb-4">
        <Label>Description</Label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="More details about this achievement…" className="w-full rounded-xl border border-(--color-black-shade-300) px-5 py-4 text-[0.9375rem] font-medium outline-none transition-colors resize-none placeholder:text-(--color-black-shade-400) focus:border-(--color-primary) text-(--color-black-shade-900)" />
      </div>
      <div className="mb-4">
        <Label>Date</Label>
        <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputBase} />
      </div>
    </EditSectionModal>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  PAGE                                                               */
/* ═══════════════════════════════════════════════════════════════════ */

export default function AdminProfessionalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const [openSections, setOpenSections] = useState({
    hiringInfo: true,
    workExperience: true,
    internship: true,
    projects: true,
    education: true,
    achievements: true,
  });

  /* ── Section edit state ─────────────────────────────────────────── */
  const profInfoEdit = useEditSection();
  const summaryEdit = useEditSection();
  const skillsEdit = useEditSection();
  const topSkillsEdit = useEditSection();
  const contactEdit = useEditSection();
  const locationsEdit = useEditSection();

  /* ── Array section modals ───────────────────────────────────────── */
  const workExpModal = useArrayModal();
  const internshipModal = useArrayModal();
  const educationModal = useArrayModal();
  const projectModal = useArrayModal();
  const achievementModal = useArrayModal();

  /* ── Confirm-delete state for array items ───────────────────────── */
  const [confirmDelete, setConfirmDelete] = useState(null); // { section, idx }

  /* ── Document upload state ──────────────────────────────────────── */
  const [docUrls, setDocUrls] = useState({}); // local URL overrides after upload
  const [docUpload, setDocUpload] = useState({}); // { [docKey]: { loading, error } }
  const [confirmRemoveDoc, setConfirmRemoveDoc] = useState(null); // pending remove target
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef(null); // { docKey, documentType, accept, maxSizeMB, experienceType?, experienceIndex? }

  const toggle = (section) => setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await apiRequest(`/users/${id}/details`);
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* ── Shared save handler (section modals) ───────────────────────── */
  const handleSave = useCallback(async (editState, payload, successMsg) => {
    editState.setIsLoading(true);
    const snapshot = user;
    try {
      const res = await adminUpdateProfessionalProfile(id, payload);
      setUser((prev) => ({ ...prev, ...res.data }));
      showSuccess(successMsg ?? "Changes saved successfully.");
      editState.forceClose();
    } catch {
      setUser(snapshot);
      showError("Failed to save changes. Please try again.");
    } finally {
      editState.setIsLoading(false);
    }
  }, [id, user]);

  /* ── Save handler for array entry modals ────────────────────────── */
  const handleSaveArrayEntry = useCallback(async (modal, payloadKey, newEntry, getArray) => {
    modal.setLoading(true);
    const currentArr = getArray();
    let newArr;
    if (modal.idx >= 0) {
      newArr = currentArr.map((item, i) => (i === modal.idx ? { ...item, ...newEntry } : item));
    } else {
      newArr = [...currentArr, newEntry];
    }
    const payload = payloadKey === "projects" || payloadKey === "achievements" || payloadKey === "topSkills"
      ? { [payloadKey]: newArr }
      : { professionalInfo: { [payloadKey]: newArr } };
    try {
      const res = await adminUpdateProfessionalProfile(id, payload);
      setUser((prev) => ({ ...prev, ...res.data }));
      showSuccess("Saved successfully.");
      modal.close();
    } catch {
      showError("Failed to save. Please try again.");
    } finally {
      modal.setLoading(false);
    }
  }, [id]);

  /* ── Delete array entry ─────────────────────────────────────────── */
  const handleDeleteArrayEntry = useCallback(async (payloadKey, idx, getArray) => {
    const currentArr = getArray();
    const newArr = currentArr.filter((_, i) => i !== idx);
    const payload = payloadKey === "projects" || payloadKey === "achievements"
      ? { [payloadKey]: newArr }
      : { professionalInfo: { [payloadKey]: newArr } };
    try {
      const res = await adminUpdateProfessionalProfile(id, payload);
      setUser((prev) => ({ ...prev, ...res.data }));
      showSuccess("Entry deleted.");
    } catch {
      showError("Failed to delete. Please try again.");
    }
  }, [id]);

  /* ── Document upload handlers ───────────────────────────────────── */
  const triggerDocUpload = useCallback((target) => {
    uploadTargetRef.current = target;
    if (fileInputRef.current) {
      fileInputRef.current.accept = target.accept;
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelected = useCallback(async (e) => {
    const file = e.target.files?.[0];
    const target = uploadTargetRef.current;
    if (!file || !target) return;
    const { docKey, documentType, maxSizeMB = 5, experienceType, experienceIndex } = target;
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setDocUpload((prev) => ({ ...prev, [docKey]: { loading: false, error: `File must be under ${maxSizeMB}MB.` } }));
      return;
    }
    setDocUpload((prev) => ({ ...prev, [docKey]: { loading: true, error: null } }));
    try {
      const { data: presigned } = await adminDocumentPresignedUrl(id, { documentType, fileName: file.name });
      const s3Res = await fetch(presigned.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!s3Res.ok) throw new Error("S3 upload failed");
      const { data: saved } = await adminSaveDocument(id, { documentType, documentKey: presigned.documentKey, experienceType, experienceIndex });
      setDocUrls((prev) => ({ ...prev, [docKey]: { s3PresignedUrl: saved.downloadUrl, s3BucketKeyInDB: presigned.documentKey, fileName: file.name } }));
      setDocUpload((prev) => ({ ...prev, [docKey]: { loading: false, error: null } }));
      showSuccess("Document uploaded successfully.");
    } catch {
      setDocUpload((prev) => ({ ...prev, [docKey]: { loading: false, error: "Upload failed. Please try again." } }));
    }
  }, [id]);

  const handleDocDelete = useCallback(async ({ docKey, documentType, experienceType, experienceIndex }) => {
    setDocUpload((prev) => ({ ...prev, [docKey]: { loading: true, error: null } }));
    try {
      await adminDeleteDocument(id, { documentType, experienceType, experienceIndex });
      setDocUrls((prev) => { const n = { ...prev }; delete n[docKey]; return n; });
      setDocUpload((prev) => ({ ...prev, [docKey]: { loading: false, error: null } }));
      showSuccess("Document removed.");
    } catch {
      setDocUpload((prev) => ({ ...prev, [docKey]: { loading: false, error: "Failed to remove document." } }));
    }
  }, [id]);

  if (loading) return <PageSkeleton />;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold" style={{ color: "var(--color-black-shade-800)" }}>User not found</h2>
        <p className="mt-2" style={{ color: "var(--color-black-shade-600)" }}>This profile may not exist or the ID is invalid.</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer text-white" style={{ background: "var(--color-primary)" }}>Go Back</button>
      </div>
    );
  }

  /* ── Derived data ───────────────────────────────────────────────── */
  const displayName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || user.fullName || user.name || "";
  const roleLabel = user.currentDesignation || user.designation || "";
  const company = user.company && user.company !== "N/A" ? user.company : "";
  const _rawExp = user.yearsOfExperience;
  const experience = _rawExp === null || _rawExp === undefined || _rawExp === ""
    ? ""
    : Number(_rawExp) === 0
    ? "Fresher"
    : `${_rawExp} years Experience`;
  const rawSkills = user.skills ?? [];
  const skills = rawSkills.map((s) => (typeof s === "string" ? s : s.name));
  const about = user.profileSummary || "";
  const workExperience = user.workExperience ?? [];
  const internshipExperience = user.internshipExperience ?? [];
  const projects = user.projects ?? [];
  const jobPreferences = user.jobPreferences ?? {};
  const openToRoles = user.openToRoles?.length ? user.openToRoles : [];
  const DEGREE_RANK = { "Doctorate (PhD)": 0, "Master's": 1, "Bachelor's": 2, Diploma: 3 };
  const educationDetails = (user.educationDetails ?? []).filter((e) => e.collegeName || e.degreeLevel).slice().sort((a, b) => (DEGREE_RANK[a.degreeLevel] ?? 99) - (DEGREE_RANK[b.degreeLevel] ?? 99));
  const achievements = (user.achievements ?? []).filter(Boolean);
  const documentUrls = user.documentUrls ?? {};

  // Resolve document URL: local upload override takes priority over backend presigned URL
  const getDocUrl = (key) => docUrls[key]?.s3PresignedUrl || documentUrls[key]?.s3PresignedUrl || null;

  // Resolve experience letter URL by experience type + index
  const getExpLetterUrl = (type, idx) => {
    const localKey = `exp_${type}_${idx}`;
    if (docUrls[localKey]?.s3PresignedUrl) return docUrls[localKey].s3PresignedUrl;
    const expArr = type === "work" ? workExperience : internshipExperience;
    const letter = user.experienceLetters?.find((l) => l.type === type && l.companyName === expArr[idx]?.companyName);
    return letter?.url || null;
  };

  const contactItems = [
    user.contactNo && { label: "Contact Number", icon: "statics/user-profile/phone.svg", value: `${user.countryCode ?? ""} ${user.contactNo}`.trim(), href: `tel:+${user.countryCode ?? ""}${user.contactNo}` },
    user.whatsappNo && { label: "WhatsApp Number", icon: "statics/user-profile/whatsapp.svg", value: user.whatsappNo, href: `https://wa.me/${user.countryCode ?? ""}${user.whatsappNo}` },
    user.email && { label: "Email", icon: "statics/user-profile/email.svg", value: user.email, href: `mailto:${user.email}` },
    user.linkedin && { label: "LinkedIn", icon: "statics/user-profile/LinkedIn.svg", value: user.linkedin, href: user.linkedin },
  ].filter(Boolean);

  const profileImage = docUrls.profilePhoto?.s3PresignedUrl || documentUrls.profilePhoto?.s3PresignedUrl || documentUrls.professionalPhoto?.s3PresignedUrl || null;
  const preferredLocations = jobPreferences.preferredLocations ?? user.preferredLocations ?? [];

  const summaryCards = [
    {
      key: "experience", title: "Experience (Full-time)", iconSrc: "statics/user-profile/brifcase.svg",
      items: workExperience.length > 0 ? workExperience.map((e) => ({ label: e.companyName || "—", value: formatDuration(e.joiningDate, e.relievingDate, e.currentlyWorking) || "—" })) : [{ label: "—", value: "No experience added" }],
      onEdit: () => workExpModal.openAdd(),
    },
    {
      key: "locations", title: "Preferred Location", iconSrc: "statics/user-profile/location.svg",
      items: preferredLocations.length > 0 ? preferredLocations.map((loc, i) => ({ label: `${["1st", "2nd", "3rd"][i] ?? `${i + 1}th`} Preference`, value: loc })) : [{ label: "—", value: "No preference added" }],
      onEdit: locationsEdit.open,
    },
    {
      key: "topSkills", title: "Top 3 Featured Skills", iconSrc: "statics/user-profile/skills.svg",
      items: (() => {
        const tsNames = (user.topSkills ?? []).map((s) => (s && typeof s === "object" ? s.skillName : s)).filter(Boolean);
        const display = tsNames.length ? tsNames : skills.slice(0, 3).map((s) => (typeof s === "string" ? s : s.name));
        return display.length > 0 ? display.map((name, i) => ({ label: `Skill ${i + 1}`, value: name })) : [{ label: "—", value: "No skills added" }];
      })(),
      onEdit: topSkillsEdit.open,
    },
  ];

  const visibleSkills = showAllSkills ? skills : skills.slice(0, 5);

  const SkillPills = ({ label }) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>{label}</h2>
        <div className="flex items-center gap-2">
          {skills.length > 5 && (
            <button type="button" onClick={() => setShowAllSkills((v) => !v)} className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-black-shade-700)" }}>
              {showAllSkills ? "View Less" : "View All"}
              <svg className={`w-4 h-4 transition-transform duration-200 ${showAllSkills ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <EditButton onClick={skillsEdit.open} label="Edit skills" />
        </div>
      </div>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {visibleSkills.map((skill, i) => (
            <span key={i} className={`rounded-full px-4 py-1.5 text-12 font-medium bg-(--color-primary-shade-100) ${i === 0 ? "flex items-center gap-1 text-(--color-black-shade-900)" : "text-(--color-black-shade-800)"}`}>
              {i === 0 && <Icon name="statics/Employee-Dashboard/Star.svg" width={12} height={12} />}
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-14 italic" style={{ color: "var(--color-black-shade-400)" }}>No skills added.</p>
      )}
    </div>
  );

  const renderSummaryCard = (card) => (
    <div className="relative rounded-xl border border-(--color-black-shade-200) overflow-hidden h-full min-h-37.5">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-14 font-semibold" style={{ color: "var(--color-black)" }}>{card.title}</h3>
          {card.onEdit && <EditButton onClick={card.onEdit} label={`Edit ${card.title}`} />}
        </div>
        <div className="space-y-3">
          {card.items.map((item, j) => (
            <div key={j} className="flex items-start gap-2.5">
              <Icon name={card.iconSrc} width={16} height={16} />
              <div>
                <p className="text-12 font-semibold leading-snug" style={{ color: "var(--color-black-shade-700)" }}>{item.label}</p>
                <p className="text-12 leading-snug" style={{ color: "var(--color-black-shade-500)" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─── Editable timeline components ─────────────────────────────── */

  const EditableTimeline = ({ entries, onEdit, onDelete, renderEntry }) => {
    if (!entries.length) return null;
    return (
      <div className="relative">
        <div className="absolute left-1.5 top-2 bottom-0 w-0.5" style={{ background: "var(--color-primary-shade-200)" }} />
        <div className="space-y-8">
          {entries.map((entry, i) => (
            <div key={entry._id ?? i} className="relative pl-7">
              <TimelineDot />
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">{renderEntry(entry, i)}</div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <EditButton onClick={() => onEdit(entry, i)} label="Edit entry" />
                  <DeleteButton onClick={() => onDelete(i)} label="Delete entry" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      <FixedBackButton variant="admin" />

      {/* ── Discard-change confirmation modals ─────────────────────── */}
      {[profInfoEdit, summaryEdit, skillsEdit, topSkillsEdit, contactEdit, locationsEdit].map((edit, idx) => (
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

      {/* ── Delete confirmation modal ───────────────────────────────── */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const { payloadKey, idx, getArray } = confirmDelete;
          handleDeleteArrayEntry(payloadKey, idx, getArray);
          setConfirmDelete(null);
        }}
        title="Delete entry?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      {/* ── Section edit modals ─────────────────────────────────────── */}
      {profInfoEdit.isOpen && (
        <ProfessionalInfoModal user={user} onSave={(p) => handleSave(profInfoEdit, p, "Professional info updated.")} onClose={profInfoEdit.requestClose} isLoading={profInfoEdit.isLoading} onSetDirty={() => profInfoEdit.setIsDirty(true)} />
      )}
      {summaryEdit.isOpen && (
        <ProfileSummaryModal user={user} onSave={(p) => handleSave(summaryEdit, p, "Profile summary updated.")} onClose={summaryEdit.requestClose} isLoading={summaryEdit.isLoading} onSetDirty={() => summaryEdit.setIsDirty(true)} />
      )}
      {skillsEdit.isOpen && (
        <SkillsModal user={user} onSave={(p) => handleSave(skillsEdit, p, "Skills updated.")} onClose={skillsEdit.requestClose} isLoading={skillsEdit.isLoading} onSetDirty={() => skillsEdit.setIsDirty(true)} />
      )}
      {topSkillsEdit.isOpen && (
        <TopSkillsModal user={user} onSave={(p) => handleSave(topSkillsEdit, p, "Featured skills updated.")} onClose={topSkillsEdit.requestClose} isLoading={topSkillsEdit.isLoading} onSetDirty={() => topSkillsEdit.setIsDirty(true)} />
      )}
      {contactEdit.isOpen && (
        <ContactModal user={user} onSave={(p) => handleSave(contactEdit, p, "Contact info updated.")} onClose={contactEdit.requestClose} isLoading={contactEdit.isLoading} onSetDirty={() => contactEdit.setIsDirty(true)} />
      )}
      {locationsEdit.isOpen && (
        <PreferredLocationsModal user={user} onSave={(p) => handleSave(locationsEdit, p, "Preferred locations updated.")} onClose={locationsEdit.requestClose} isLoading={locationsEdit.isLoading} onSetDirty={() => locationsEdit.setIsDirty(true)} />
      )}

      {/* ── Work Experience Modal ────────────────────────────────────── */}
      {workExpModal.open && (
        <WorkExpEntryModal
          entry={workExpModal.entry}
          isLoading={workExpModal.loading}
          onClose={workExpModal.close}
          onSave={(newEntry) => handleSaveArrayEntry(workExpModal, "workExperience", newEntry, () => workExperience)}
        />
      )}

      {/* ── Internship Modal ─────────────────────────────────────────── */}
      {internshipModal.open && (
        <InternshipEntryModal
          entry={internshipModal.entry}
          isLoading={internshipModal.loading}
          onClose={internshipModal.close}
          onSave={(newEntry) => handleSaveArrayEntry(internshipModal, "internshipExperience", newEntry, () => internshipExperience)}
        />
      )}

      {/* ── Education Modal ──────────────────────────────────────────── */}
      {educationModal.open && (
        <EducationEntryModal
          entry={educationModal.entry}
          isLoading={educationModal.loading}
          onClose={educationModal.close}
          onSave={(newEntry) => handleSaveArrayEntry(educationModal, "educationDetails", newEntry, () => educationDetails)}
        />
      )}

      {/* ── Project Modal ────────────────────────────────────────────── */}
      {projectModal.open && (
        <ProjectEntryModal
          entry={projectModal.entry}
          isLoading={projectModal.loading}
          onClose={projectModal.close}
          onSave={(newEntry) => handleSaveArrayEntry(projectModal, "projects", newEntry, () => projects)}
        />
      )}

      {/* ── Achievement Modal ────────────────────────────────────────── */}
      {achievementModal.open && (
        <AchievementEntryModal
          entry={achievementModal.entry}
          isLoading={achievementModal.loading}
          onClose={achievementModal.close}
          onSave={(newEntry) => handleSaveArrayEntry(achievementModal, "achievements", newEntry, () => achievements)}
        />
      )}

      {/* ── Document remove confirmation ─────────────────────────────── */}
      <ConfirmModal
        open={!!confirmRemoveDoc}
        onClose={() => setConfirmRemoveDoc(null)}
        onConfirm={() => {
          if (!confirmRemoveDoc) return;
          handleDocDelete(confirmRemoveDoc);
          setConfirmRemoveDoc(null);
        }}
        title="Remove document?"
        description="This will remove the document from this professional's profile."
        confirmLabel="Remove"
        confirmVariant="danger"
      />

      {/* ── Hidden file input shared by all document upload slots ───── */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="container-80 py-6 flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ═══ LEFT SIDEBAR ══════════════════════════════════════════ */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-5">

            {/* Profile Photo */}
            <div className="flex flex-col items-center lg:items-stretch gap-2">
              <button
                type="button"
                onClick={() => triggerDocUpload({ docKey: "profilePhoto", documentType: "profilePhoto", accept: "image/jpeg,image/png,image/webp", maxSizeMB: 2 })}
                className="w-88 h-80 mx-auto lg:w-full lg:h-auto overflow-hidden rounded-xl border border-(--color-black-shade-200) relative group cursor-pointer focus:outline-none"
                aria-label="Change profile photo"
                disabled={docUpload.profilePhoto?.loading}
              >
                {profileImage ? (
                  <img src={profileImage} alt={displayName} className="w-full aspect-square object-cover object-top" />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-5xl font-bold text-white" style={{ background: "var(--color-primary)" }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center">
                  {docUpload.profilePhoto?.loading ? (
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </button>
              {docUpload.profilePhoto?.error && (
                <p className="text-11 text-center" style={{ color: "var(--color-red)" }}>{docUpload.profilePhoto.error}</p>
              )}
              <button
                type="button"
                onClick={() => triggerDocUpload({ docKey: "profilePhoto", documentType: "profilePhoto", accept: "image/jpeg,image/png,image/webp", maxSizeMB: 2 })}
                disabled={docUpload.profilePhoto?.loading}
                className="text-12 font-medium hover:underline cursor-pointer disabled:opacity-50"
                style={{ color: "var(--color-primary)" }}
              >
                {docUpload.profilePhoto?.loading ? "Uploading…" : "Change Photo"}
              </button>
            </div>

            <Button className="w-auto! min-w-88 mx-auto lg:w-full! lg:mx-0 lg:min-w-44">Hire {displayName}</Button>

            {/* Mobile: Profile Details */}
            <div className="lg:hidden flex flex-col gap-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-24 font-bold leading-tight" style={{ color: "var(--color-black-shade-900)" }}>{displayName}</h1>
                  <EditButton onClick={profInfoEdit.open} label="Edit professional info" />
                </div>
                <StatusBadges user={user} />
              </div>
              <div className="flex flex-row flex-wrap gap-x-10 gap-y-1.5">
                <MetaRow icon="statics/user-profile/developer.svg" text={roleLabel} />
                <MetaRow icon="statics/user-profile/compnay.svg" text={company} />
                <MetaRow icon="statics/user-profile/brifcase.svg" text={experience} />
              </div>
              {skills.length > 0 && <SkillPills label="Key Expertise" />}
            </div>

            {/* Hiring Information */}
            <div className="flex flex-col gap-4">
              <button onClick={() => toggle("hiringInfo")} className="w-full flex items-center justify-between cursor-pointer">
                <p className="text-14 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>Hiring Information</p>
                <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openSections.hiringInfo ? "rotate-180" : ""}`} style={{ color: "var(--color-black-shade-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.hiringInfo && (
                <div className="flex flex-col gap-4">
                  <SidebarCard title="Contact Information" onEdit={contactEdit.open} editLabel="Edit contact info">
                    {contactItems.length > 0 ? (
                      <div className="space-y-3">
                        {contactItems.map((item, i) => (
                          <ContactRow key={i} icon={item.icon} label={item.label} value={item.value} href={item.href} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-12" style={{ color: "var(--color-black-shade-400)" }}>No contact info added.</p>
                    )}
                  </SidebarCard>

                  <SidebarCard title="Resume">
                    <div className="flex items-start gap-3">
                      <Icon name="statics/user-profile/user.svg" width={20} height={20} alt="resume" />
                      <DocSlot
                        label="Resume / CV"
                        url={getDocUrl("resumeCV")}
                        uploading={docUpload.resumeCV?.loading}
                        error={docUpload.resumeCV?.error}
                        fileName={docUrls.resumeCV?.fileName}
                        onUpload={() => triggerDocUpload({ docKey: "resumeCV", documentType: "resumeCV", accept: "application/pdf", maxSizeMB: 5 })}
                        onRemove={() => setConfirmRemoveDoc({ docKey: "resumeCV", documentType: "resumeCV" })}
                      />
                    </div>
                  </SidebarCard>

                  <SidebarCard title="Identity Proof">
                    <div className="flex items-start gap-3">
                      <Icon name="statics/user-profile/user.svg" width={20} height={20} alt="identity" />
                      <DocSlot
                        label={user.identityProofType || "Aadhar Card"}
                        url={getDocUrl("identityProof")}
                        uploading={docUpload.identityProof?.loading}
                        error={docUpload.identityProof?.error}
                        fileName={docUrls.identityProof?.fileName}
                        onUpload={() => triggerDocUpload({ docKey: "identityProof", documentType: "identityProofFile", accept: "application/pdf,image/jpeg,image/png,image/webp", maxSizeMB: 5 })}
                        onRemove={() => setConfirmRemoveDoc({ docKey: "identityProof", documentType: "identityProofFile" })}
                      />
                    </div>
                  </SidebarCard>

                  <SidebarCard title="Current Company Salary Proof">
                    <div className="flex items-start gap-3">
                      <Icon name="statics/user-profile/compnay.svg" width={20} height={20} alt="company" />
                      <div className="flex-1 min-w-0">
                        <p className="text-12 font-medium mb-1" style={{ color: "var(--color-black-shade-600)" }}>{company || "—"}</p>
                        <DocSlot
                          label="Offer Letter / Payslip"
                          url={getDocUrl("salaryProof")}
                          uploading={docUpload.salaryProof?.loading}
                          error={docUpload.salaryProof?.error}
                          fileName={docUrls.salaryProof?.fileName}
                          onUpload={() => triggerDocUpload({ docKey: "salaryProof", documentType: "salaryProof", accept: "application/pdf", maxSizeMB: 5 })}
                          onRemove={() => setConfirmRemoveDoc({ docKey: "salaryProof", documentType: "salaryProof" })}
                        />
                      </div>
                    </div>
                  </SidebarCard>

                  {workExperience.length > 0 && (
                    <SidebarCard title="Experience Letter">
                      <div className="space-y-4">
                        {workExperience.map((exp, i) => {
                          const docKey = `exp_work_${i}`;
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <Icon name="statics/user-profile/compnay.svg" width={20} height={20} alt="company" />
                              <div className="flex-1 min-w-0">
                                <p className="text-12 font-medium mb-1" style={{ color: "var(--color-black-shade-600)" }}>{exp.companyName || "Company"}</p>
                                <DocSlot
                                  label="Experience Letter"
                                  url={getExpLetterUrl("work", i)}
                                  uploading={docUpload[docKey]?.loading}
                                  error={docUpload[docKey]?.error}
                                  fileName={docUrls[docKey]?.fileName}
                                  onUpload={() => triggerDocUpload({ docKey, documentType: "experienceLetter", accept: "application/pdf", maxSizeMB: 5, experienceType: "work", experienceIndex: i })}
                                  onRemove={() => setConfirmRemoveDoc({ docKey, documentType: "experienceLetter", experienceType: "work", experienceIndex: i })}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </SidebarCard>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ═══ RIGHT CONTENT ═════════════════════════════════════════ */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Desktop: Profile Header */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-24 font-bold leading-tight" style={{ color: "var(--color-black-shade-900)" }}>{displayName}</h1>
                <StatusBadges user={user} />
              </div>
              <EditButton onClick={profInfoEdit.open} label="Edit professional info" />
            </div>
            <div className="flex flex-col gap-2.5">
              <MetaRow icon="statics/user-profile/developer.svg" text={roleLabel} />
              <MetaRow icon="statics/user-profile/compnay.svg" text={company} />
              <MetaRow icon="statics/user-profile/brifcase.svg" text={experience} />
              <MetaRow icon="statics/user-profile/location.svg" text={user.currentCity || user.currentLocation} />
              {openToRoles.length > 0 && (
                <MetaRow icon="statics/user-profile/developer.svg" text={`Open to: ${openToRoles.slice(0, 2).join(", ")}`} />
              )}
            </div>
            <SkillPills label="Expertise" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>Profile Summary</h2>
                <EditButton onClick={summaryEdit.open} label="Edit profile summary" />
              </div>
              {about ? (
                <p className="text-14 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>{about}</p>
              ) : (
                <button type="button" onClick={summaryEdit.open} className="text-14 italic text-left cursor-pointer hover:underline" style={{ color: "var(--color-black-shade-400)" }}>No profile summary — click to add.</button>
              )}
            </div>
          </div>

          <hr className="border-(--color-black-shade-100)" />

          {/* Summary Cards */}
          <div className="md:hidden">
            <Carousel items={summaryCards} visibleCards={1.2} autoPlay={false} renderItem={renderSummaryCard} />
          </div>
          <div className="hidden md:grid grid-cols-3 gap-4">
            {summaryCards.map((card) => <div key={card.key}>{renderSummaryCard(card)}</div>)}
          </div>

          {/* Mobile: Profile Summary */}
          <div className="lg:hidden flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>Profile Summary</h2>
              <EditButton onClick={summaryEdit.open} label="Edit profile summary" />
            </div>
            {about ? (
              <p className="text-14 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>{about}</p>
            ) : (
              <p className="text-14 italic" style={{ color: "var(--color-black-shade-400)" }}>No profile summary added.</p>
            )}
          </div>

          {/* Work Experience */}
          <TimelineSection
            title={`Work Experience${workExperience.length > 0 ? ` (${workExperience.length})` : ""}`}
            isOpen={openSections.workExperience} onToggle={() => toggle("workExperience")}
            hasContent={workExperience.length > 0}
            onAdd={() => workExpModal.openAdd()} addLabel="Add Work Experience"
          >
            <EditableTimeline
              entries={workExperience}
              onEdit={(entry, idx) => workExpModal.openEdit(entry, idx)}
              onDelete={(idx) => setConfirmDelete({ section: "workExperience", payloadKey: "workExperience", idx, getArray: () => workExperience })}
              renderEntry={(exp) => (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 mb-1">
                    <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>{exp.role}</h3>
                    <span className="text-12 shrink-0 uppercase tracking-wide sm:ml-4" style={{ color: "var(--color-black-shade-500)" }}>{formatDuration(exp.joiningDate, exp.relievingDate, exp.currentlyWorking)}</span>
                  </div>
                  <p className="text-14 mb-1" style={{ color: "var(--color-black-shade-600)" }}>{exp.companyName}</p>
                  {formatSalaryAmt(exp.salary, exp.salaryPeriod) && <p className="text-12" style={{ color: "var(--color-black-shade-500)" }}>Salary: {formatSalaryAmt(exp.salary, exp.salaryPeriod)}</p>}
                  {exp.points?.filter(Boolean).length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.points.filter(Boolean).map((pt, j) => (
                        <li key={j} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--color-black-shade-400)" }} /><p className="text-13 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>{pt}</p></li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />
          </TimelineSection>

          {/* Internship Experience */}
          <TimelineSection
            title={`Internship Experience${internshipExperience.length > 0 ? ` (${internshipExperience.length})` : ""}`}
            isOpen={openSections.internship} onToggle={() => toggle("internship")}
            hasContent={internshipExperience.length > 0}
            onAdd={() => internshipModal.openAdd()} addLabel="Add Internship"
          >
            <EditableTimeline
              entries={internshipExperience}
              onEdit={(entry, idx) => internshipModal.openEdit(entry, idx)}
              onDelete={(idx) => setConfirmDelete({ section: "internshipExperience", payloadKey: "internshipExperience", idx, getArray: () => internshipExperience })}
              renderEntry={(exp) => (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 mb-1">
                    <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>{exp.role}</h3>
                    <span className="text-12 shrink-0 uppercase tracking-wide sm:ml-4" style={{ color: "var(--color-black-shade-500)" }}>{formatDuration(exp.joiningDate, exp.relievingDate, exp.currentlyWorking)}</span>
                  </div>
                  <p className="text-14 mb-1" style={{ color: "var(--color-black-shade-600)" }}>{exp.companyName}</p>
                  {formatStipend(exp.stipend, exp.stipendPeriod) && <p className="text-12" style={{ color: "var(--color-black-shade-500)" }}>Stipend: {formatStipend(exp.stipend, exp.stipendPeriod)}</p>}
                </div>
              )}
            />
          </TimelineSection>

          {/* Projects */}
          <TimelineSection
            title="Projects" isOpen={openSections.projects} onToggle={() => toggle("projects")}
            hasContent={projects.length > 0}
            onAdd={() => projectModal.openAdd()} addLabel="Add Project"
          >
            <EditableTimeline
              entries={projects}
              onEdit={(entry, idx) => projectModal.openEdit(entry, idx)}
              onDelete={(idx) => setConfirmDelete({ section: "projects", payloadKey: "projects", idx, getArray: () => projects })}
              renderEntry={(project) => (
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>{project.projectName}</h3>
                    {project.projectLink && (
                      <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className="text-12 font-medium hover:underline break-all" style={{ color: "var(--color-primary)" }}>View Project</a>
                    )}
                  </div>
                  {project.description && <p className="text-13 mb-3 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>{project.description}</p>}
                  {project.points?.filter(Boolean).length > 0 && (
                    <ul className="space-y-2">
                      {project.points.filter(Boolean).map((point, j) => (
                        <li key={j} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--color-black-shade-400)" }} /><p className="text-14 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>{point}</p></li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />
          </TimelineSection>

          {/* Education */}
          <TimelineSection
            title="Education" isOpen={openSections.education} onToggle={() => toggle("education")}
            hasContent={educationDetails.length > 0}
            onAdd={() => educationModal.openAdd()} addLabel="Add Education"
          >
            <EditableTimeline
              entries={educationDetails}
              onEdit={(entry, idx) => {
                const actualIdx = (user.educationDetails ?? []).findIndex((e) => e._id === entry._id);
                educationModal.openEdit(entry, actualIdx >= 0 ? actualIdx : idx);
              }}
              onDelete={(idx) => {
                const entry = educationDetails[idx];
                const actualIdx = (user.educationDetails ?? []).findIndex((e) => e._id === entry._id);
                setConfirmDelete({ section: "educationDetails", payloadKey: "educationDetails", idx: actualIdx >= 0 ? actualIdx : idx, getArray: () => user.educationDetails ?? [] });
              }}
              renderEntry={(edu) => (
                <div>
                  <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>{[edu.degreeLevel, edu.fieldOfStudy].filter(Boolean).join(" in ") || "Degree"}</h3>
                  {edu.grade && <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-500)" }}>{edu.grade} {edu.gradeType}</p>}
                  {edu.collegeName && <p className="text-14 mt-0.5" style={{ color: "var(--color-black-shade-600)" }}>{edu.collegeName}</p>}
                  {(edu.startDate || edu.endDate) && <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-400)" }}>{[formatDate(edu.startDate), edu.currentlyStudying ? "Present" : formatDate(edu.endDate)].filter(Boolean).join(" – ")}</p>}
                </div>
              )}
            />
          </TimelineSection>

          {/* Achievements */}
          <TimelineSection
            title="Achievements" isOpen={openSections.achievements} onToggle={() => toggle("achievements")}
            hasContent={achievements.length > 0}
            onAdd={() => achievementModal.openAdd()} addLabel="Add Achievement"
          >
            <EditableTimeline
              entries={achievements}
              onEdit={(entry, idx) => achievementModal.openEdit(entry, idx)}
              onDelete={(idx) => setConfirmDelete({ section: "achievements", payloadKey: "achievements", idx, getArray: () => achievements })}
              renderEntry={(achievement) => {
                const isObj = typeof achievement === "object" && achievement !== null;
                const title = isObj ? achievement.title : achievement;
                const description = isObj ? achievement.description : null;
                const date = isObj ? achievement.date : null;
                return (
                  <div>
                    <p className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>{title}</p>
                    {description && <p className="text-14 mt-1" style={{ color: "var(--color-black-shade-500)" }}>{description}</p>}
                    {date && <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-400)" }}>{formatDate(date)}</p>}
                  </div>
                );
              }}
            />
          </TimelineSection>

        </main>
      </div>
    </>
  );
}

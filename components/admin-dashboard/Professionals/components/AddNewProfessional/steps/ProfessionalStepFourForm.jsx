"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import CreatableSelect from "@/components/common/CreatableSelect";
import { MonthYearPicker } from "@/components/common/MonthYearPicker";
import { useMetadataData } from "@/hooks/useMetadata";
import {
  sanitizeSalaryInput,
  formatIndianNumber,
  salaryInWords,
  handleSalaryKeyDown,
} from "@/utilities/salaryValidation";

const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError =
  "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";

function FieldError({ msg }) {
  return msg ? <p className="mt-1.5 text-xs text-(--color-red)">{msg}</p> : null;
}

function emptyEntry() {
  return {
    companyName: "",
    role: "",
    salary: "",
    salaryPeriod: "per annum",
    joiningDate: null,
    relievingDate: null,
    currentlyWorking: false,
    points: ["", "", ""],
  };
}

function WorkEntry({ entry, index, onChange, onRemove, canRemove, roleOptions, errors = {} }) {
  const set = (field, value) => onChange(index, { ...entry, [field]: value });

  const updatePoint = (i, val) => {
    const pts = [...(entry.points || [])];
    pts[i] = val;
    onChange(index, { ...entry, points: pts });
  };

  const addPoint = () => {
    if ((entry.points || []).length >= 5) return;
    onChange(index, { ...entry, points: [...(entry.points || []), ""] });
  };

  const removePoint = (i) => {
    const pts = [...(entry.points || [])].filter((_, idx) => idx !== i);
    onChange(index, { ...entry, points: pts });
  };

  return (
    <div className="mb-6 rounded-2xl border border-(--color-black-shade-200) bg-(--pure-white) p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--color-black-shade-700)">
          Experience #{index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs font-medium text-(--color-red) hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div className="mb-4">
          <Label htmlFor={`cn-${index}`} required>Company Name</Label>
          <input
            id={`cn-${index}`}
            value={entry.companyName}
            placeholder="Acme Corp"
            onChange={(e) => set("companyName", e.target.value)}
            className={`${inputBase} ${errors.companyName ? inputError : inputNormal}`}
          />
          <FieldError msg={errors.companyName} />
        </div>

        <div className="mb-4">
          <Label htmlFor={`role-${index}`} required>Role / Designation</Label>
          <CreatableSelect
            value={entry.role}
            options={roleOptions}
            placeholder="e.g. Software Engineer"
            onChange={(v) => set("role", v)}
            showAllOnOpen
            error={errors.role}
          />
        </div>
      </div>

      {/* Currently Working toggle */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={entry.currentlyWorking}
          onClick={() => { set("currentlyWorking", !entry.currentlyWorking); if (!entry.currentlyWorking) set("relievingDate", null); }}
          className={`relative shrink-0 h-7 w-12 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-1 ${entry.currentlyWorking ? "bg-(--color-secondary)" : "bg-(--color-black-shade-300)"}`}
        >
          <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${entry.currentlyWorking ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className="text-sm font-medium text-(--color-black-shade-800)">Currently working here</span>
      </div>

      {/* Salary — only shown when currently working */}
      {entry.currentlyWorking && (
        <div className="mb-4">
          <Label htmlFor={`salary-${index}`}>Current Salary (₹ per annum)</Label>
          <input
            id={`salary-${index}`}
            type="text"
            inputMode="numeric"
            value={formatIndianNumber(entry.salary)}
            placeholder="e.g. 8,00,000"
            onChange={(e) => set("salary", sanitizeSalaryInput(e.target.value))}
            onKeyDown={handleSalaryKeyDown}
            className={`${inputBase} ${inputNormal}`}
          />
          {entry.salary && (
            <p className="mt-1.5 text-xs text-(--color-black-shade-500)">
              {salaryInWords(entry.salary)} rupees per annum
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div className="mb-4">
          <Label htmlFor={`jd-${index}`} required>Joining Month</Label>
          <MonthYearPicker
            value={entry.joiningDate || null}
            onChange={(iso) => set("joiningDate", iso)}
            placeholder="Joining Month"
            maxDate={new Date().toISOString()}
            error={errors.joiningDate}
          />
        </div>
        {!entry.currentlyWorking && (
          <div className="mb-4">
            <Label htmlFor={`rd-${index}`} required>Relieving Month</Label>
            <MonthYearPicker
              value={entry.relievingDate || null}
              onChange={(iso) => set("relievingDate", iso)}
              placeholder="Relieving Month"
              minDate={entry.joiningDate || undefined}
              maxDate={new Date().toISOString()}
              error={errors.relievingDate}
            />
          </div>
        )}
      </div>

      {/* Work responsibility bullet points */}
      <div className="mt-2">
        <Label>
          Key Responsibilities
          <span className="ml-1 text-xs font-normal text-(--color-black-shade-400)">(up to 5 bullet points)</span>
        </Label>
        <div className="space-y-2">
          {(entry.points || []).map((pt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="shrink-0 text-sm text-(--color-black-shade-400)">•</span>
              <input
                type="text"
                value={pt}
                maxLength={150}
                placeholder={`Responsibility ${i + 1}…`}
                onChange={(e) => updatePoint(i, e.target.value)}
                className="h-10 flex-1 rounded-lg border border-(--color-black-shade-300) px-4 text-sm font-medium outline-none focus:border-(--color-primary) placeholder:text-(--color-black-shade-400)"
              />
              {(entry.points || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => removePoint(i)}
                  aria-label="Remove point"
                  className="shrink-0 text-(--color-black-shade-400) hover:text-(--color-red)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {(entry.points || []).length < 5 && (
          <button
            type="button"
            onClick={addPoint}
            className="mt-2 text-xs font-medium text-(--color-primary) hover:underline"
          >
            + Add point
          </button>
        )}
      </div>
    </div>
  );
}

const ENUM_TO_METADATA_KEY = {
  developer: "Development",
  marketing: "Marketing",
  sales: "Sales",
  designer: "Design",
  consultant: "Consultancy",
};

export default function ProfessionalStepFourForm({
  defaultValues = {},
  professionalCategory = "",
  yearsOfExperience = "",
  onBack,
  onNext,
}) {
  const { metadata } = useMetadataData();
  const isFresher = Number(yearsOfExperience) === 0;

  const [entries, setEntries] = useState(
    defaultValues.workExperience?.length > 0
      ? defaultValues.workExperience.map((e) => ({
          ...emptyEntry(),
          ...e,
          salary: e.salary ?? "",
          joiningDate: e.joiningDate || null,
          relievingDate: e.relievingDate || null,
        }))
      : [emptyEntry()]
  );
  const [errors, setErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const metadataKey = ENUM_TO_METADATA_KEY[professionalCategory];
  const roleOptions =
    (metadataKey && metadata.jobRolesByCategory?.[metadataKey]) ||
    metadata.commonJobRoles ||
    [];

  const updateEntry = (index, updated) => {
    const next = entries.map((e, i) => (i === index ? updated : e));
    setEntries(next);
    if (submitted) setErrors(validateAll(next));
  };

  const removeEntry = (index) => {
    const next = entries.filter((_, i) => i !== index);
    setEntries(next);
    if (submitted) setErrors(validateAll(next));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, emptyEntry()]);
  };

  const validateAll = (data = entries) => {
    return data.map((e) => {
      const errs = {};
      if (!e.companyName.trim()) errs.companyName = "Company name is required.";
      if (!e.role.trim()) errs.role = "Role is required.";
      if (!e.joiningDate) errs.joiningDate = "Joining date is required.";
      if (!e.currentlyWorking && !e.relievingDate)
        errs.relievingDate = "Relieving date is required.";
      if (e.joiningDate && e.relievingDate && e.relievingDate < e.joiningDate)
        errs.relievingDate = "Relieving date must be after joining date.";
      return errs;
    });
  };

  const handleNext = () => {
    setSubmitted(true);

    if (isFresher) {
      onNext({ workExperience: [] });
      return;
    }

    const errs = validateAll();
    setErrors(errs);
    if (errs.some((e) => Object.keys(e).length > 0)) return;

    const workExperience = entries.map((e) => ({
      companyName: e.companyName.trim(),
      role: e.role.trim(),
      salary: e.currentlyWorking && e.salary ? Number(e.salary) : undefined,
      salaryPeriod: "per annum",
      joiningDate: e.joiningDate || undefined,
      relievingDate: e.currentlyWorking ? undefined : (e.relievingDate || undefined),
      currentlyWorking: e.currentlyWorking,
      points: (e.points || []).filter(Boolean).map((p) => p.trim()),
    }));

    onNext({ workExperience });
  };

  if (isFresher) {
    return (
      <div className="max-w-2xl py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Work Experience</h2>
          <p className="mt-0.5 text-sm font-medium text-(--color-black-shade-500)">
            No work experience required for Fresher profile.
          </p>
        </div>
        <div className="rounded-2xl border border-(--color-black-shade-100) bg-(--color-black-shade-50) p-6 text-center">
          <p className="text-sm text-(--color-black-shade-600)">
            This professional is marked as Fresher. Work experience section is skipped.
          </p>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="w-auto! min-w-32! px-6!">Back</Button>
          <Button onClick={handleNext} className="min-w-40!">Continue</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Work Experience</h2>
        <p className="mt-0.5 text-sm font-medium text-(--color-black-shade-500)">
          Add all relevant work experiences. Most recent first.
        </p>
      </div>

      {entries.map((entry, i) => (
        <WorkEntry
          key={i}
          entry={entry}
          index={i}
          onChange={updateEntry}
          onRemove={removeEntry}
          canRemove={entries.length > 1}
          roleOptions={roleOptions}
          errors={submitted ? (errors[i] || {}) : {}}
        />
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-(--color-primary) hover:underline"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Another Experience
      </button>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-auto! min-w-32! px-6!">Back</Button>
        <Button onClick={handleNext} className="min-w-40!">Continue</Button>
      </div>
    </div>
  );
}

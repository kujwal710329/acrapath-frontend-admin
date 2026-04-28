"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import CreatableSelect from "@/components/common/CreatableSelect";
import { useMetadataData } from "@/hooks/useMetadata";

const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError =
  "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";

const DEGREE_OPTIONS = ["Diploma", "Bachelor's", "Master's", "Doctorate"];
const GRADE_TYPE_OPTIONS = ["Percentage", "CGPA", "GPA", "Grade"];

function FieldError({ msg }) {
  return msg ? <p className="mt-1.5 text-xs text-(--color-red)">{msg}</p> : null;
}

function emptyEntry() {
  return {
    degreeLevel: "",
    fieldOfStudy: "",
    collegeName: "",
    grade: "",
    gradeType: "Percentage",
    startDate: "",
    endDate: "",
    currentlyStudying: false,
  };
}

function EduEntry({ entry, index, onChange, onRemove, canRemove, fieldOptions, errors = {} }) {
  const set = (field, value) => onChange(index, { ...entry, [field]: value });

  const gradePlaceholder = {
    Percentage: "e.g. 85.5",
    CGPA: "e.g. 8.5",
    GPA: "e.g. 3.8",
    Grade: "e.g. A",
  }[entry.gradeType] || "Grade";

  return (
    <div className="mb-6 rounded-2xl border border-(--color-black-shade-200) bg-(--pure-white) p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--color-black-shade-700)">
          Education #{index + 1}
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

      {/* Degree + Field */}
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div className="mb-4">
          <Label htmlFor={`deg-${index}`} required>Degree</Label>
          <CreatableSelect
            value={entry.degreeLevel}
            options={DEGREE_OPTIONS}
            placeholder="Select degree"
            onChange={(v) => set("degreeLevel", v)}
            showAllOnOpen
            error={errors.degreeLevel}
            className="mb-0"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor={`fos-${index}`} required>Field of Study</Label>
          <CreatableSelect
            value={entry.fieldOfStudy}
            options={fieldOptions}
            placeholder="e.g. Computer Science"
            onChange={(v) => set("fieldOfStudy", v)}
            showAllOnOpen
            error={errors.fieldOfStudy}
          />
        </div>
      </div>

      {/* College */}
      <div className="mb-4">
        <Label htmlFor={`col-${index}`} required>Institution / College Name</Label>
        <input
          id={`col-${index}`}
          value={entry.collegeName}
          placeholder="e.g. IIT Bombay"
          onChange={(e) => set("collegeName", e.target.value)}
          className={`${inputBase} ${errors.collegeName ? inputError : inputNormal}`}
        />
        <FieldError msg={errors.collegeName} />
      </div>

      {/* Grade */}
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div className="mb-4">
          <Label htmlFor={`gt-${index}`}>Grade Type</Label>
          <CreatableSelect
            value={entry.gradeType}
            options={GRADE_TYPE_OPTIONS}
            placeholder="Select grade type"
            onChange={(v) => set("gradeType", v)}
            showAllOnOpen
            className="mb-0"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor={`gr-${index}`}>Grade / Score</Label>
          <input
            id={`gr-${index}`}
            value={entry.grade}
            placeholder={gradePlaceholder}
            onChange={(e) => set("grade", e.target.value)}
            className={`${inputBase} ${inputNormal}`}
          />
        </div>
      </div>

      {/* Currently Studying toggle */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={entry.currentlyStudying}
          onClick={() => set("currentlyStudying", !entry.currentlyStudying)}
          className={`relative shrink-0 h-7 w-12 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-1
            ${entry.currentlyStudying ? "bg-(--color-secondary)" : "bg-(--color-black-shade-300)"}`}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200
              ${entry.currentlyStudying ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <span className="text-sm font-medium text-(--color-black-shade-800)">Currently studying here</span>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div className="mb-4">
          <Label htmlFor={`sd-${index}`} required>Start Month</Label>
          <input
            id={`sd-${index}`}
            type="month"
            value={entry.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className={`${inputBase} ${errors.startDate ? inputError : inputNormal}`}
          />
          <FieldError msg={errors.startDate} />
        </div>
        <div className="mb-4">
          <Label htmlFor={`ed-${index}`}>
            End Month{!entry.currentlyStudying && <span className="ml-0.5 text-(--color-red)">*</span>}
            {entry.currentlyStudying && <span className="ml-1 text-xs font-normal text-(--color-black-shade-400)">(tentative)</span>}
          </Label>
          <input
            id={`ed-${index}`}
            type="month"
            value={entry.endDate}
            min={entry.startDate || undefined}
            onChange={(e) => set("endDate", e.target.value)}
            className={`${inputBase} ${errors.endDate ? inputError : inputNormal}`}
          />
          <FieldError msg={errors.endDate} />
        </div>
      </div>
    </div>
  );
}

export default function ProfessionalStepFiveForm({ defaultValues = {}, onBack, onNext }) {
  const { metadata } = useMetadataData();
  const fieldOptions = metadata.fieldsOfStudy || [];

  const [entries, setEntries] = useState(
    defaultValues.educationDetails?.length > 0
      ? defaultValues.educationDetails.map((e) => ({
          ...emptyEntry(),
          ...e,
          startDate: e.startDate ? String(e.startDate).slice(0, 7) : "",
          endDate: e.endDate ? String(e.endDate).slice(0, 7) : "",
        }))
      : [emptyEntry()]
  );
  const [errors, setErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);

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

  const addEntry = () => setEntries((prev) => [...prev, emptyEntry()]);

  const validateAll = (data = entries) =>
    data.map((e) => {
      const errs = {};
      if (!e.degreeLevel) errs.degreeLevel = "Degree is required.";
      if (!e.fieldOfStudy?.trim()) errs.fieldOfStudy = "Field of study is required.";
      if (!e.collegeName?.trim()) errs.collegeName = "Institution name is required.";
      if (!e.startDate) errs.startDate = "Start date is required.";
      if (!e.currentlyStudying && !e.endDate) errs.endDate = "End date is required.";
      if (e.startDate && e.endDate && e.endDate < e.startDate)
        errs.endDate = "End date must be after start date.";
      return errs;
    });

  const handleNext = () => {
    setSubmitted(true);
    const errs = validateAll();
    setErrors(errs);
    if (errs.some((e) => Object.keys(e).length > 0)) return;

    const educationDetails = entries.map((e) => ({
      degreeLevel: e.degreeLevel,
      fieldOfStudy: e.fieldOfStudy.trim(),
      collegeName: e.collegeName.trim(),
      grade: e.grade || undefined,
      gradeType: e.gradeType,
      startDate: e.startDate ? String(e.startDate).slice(0, 7) : undefined,
      endDate: e.currentlyStudying ? undefined : e.endDate ? String(e.endDate).slice(0, 7) : undefined,
      currentlyStudying: e.currentlyStudying,
    }));

    onNext({ educationDetails });
  };

  return (
    <div className="max-w-2xl py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Education</h2>
        <p className="mt-0.5 text-sm font-medium text-(--color-black-shade-500)">
          Add all relevant educational qualifications.
        </p>
      </div>

      {entries.map((entry, i) => (
        <EduEntry
          key={i}
          entry={entry}
          index={i}
          onChange={updateEntry}
          onRemove={removeEntry}
          canRemove={entries.length > 1}
          fieldOptions={fieldOptions}
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
        Add Another Education
      </button>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-auto! min-w-32! px-6!">Back</Button>
        <Button onClick={handleNext} className="min-w-40!">Continue</Button>
      </div>
    </div>
  );
}

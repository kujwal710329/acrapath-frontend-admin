"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import Input from "@/components/common/Input";
import CreatableSelect from "@/components/common/CreatableSelect";
import { useMetadataData } from "@/hooks/useMetadata";

// Values match the User model enum exactly — do NOT change these
const PROFESSIONAL_CATEGORIES = [
  { value: "developer", label: "Developer" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "designer", label: "Designer" },
  { value: "consultant", label: "Consultant" },
];

// Maps model enum value → metadata key
const ENUM_TO_METADATA_KEY = {
  developer: "Development",
  marketing: "Marketing",
  sales: "Sales",
  designer: "Design",
  consultant: "Consultancy",
};



function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-(--color-black-shade-900)">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm font-medium text-(--color-black-shade-500)">{subtitle}</p>}
    </div>
  );
}

function RolePill({ label, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-(--color-primary-shade-100) px-3 py-1.5 text-xs font-medium text-(--color-black-shade-900)">
      {label}
      <button type="button" onClick={onRemove} className="flex items-center cursor-pointer text-(--color-black-shade-500) hover:text-(--color-red)">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function ProfessionalStepTwoForm({ defaultValues = {}, onBack, onNext }) {
  const { metadata } = useMetadataData();

  const [form, setForm] = useState({
    professionalCategory: defaultValues.professionalCategory || "",
    openToRoles: defaultValues.openToRoles || [],
    yearsOfExperience: defaultValues.yearsOfExperience || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setErr = (field, msg) => setErrors((prev) => ({ ...prev, [field]: msg }));
  const clearErr = (field) => setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const set = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "professionalCategory") next.openToRoles = [];
      return next;
    });
    if (field !== "professionalCategory") clearErr(field);
    else { clearErr("professionalCategory"); clearErr("openToRoles"); }
  };

  const metadataKey = ENUM_TO_METADATA_KEY[form.professionalCategory];
  const roleOptions = (metadataKey && metadata.jobRolesByCategory?.[metadataKey]) || metadata.commonJobRoles || [];
  // Filter out already selected roles
  const availableRoles = roleOptions.filter((r) => !form.openToRoles.includes(r));

  const addRole = (role) => {
    if (!role || form.openToRoles.includes(role) || form.openToRoles.length >= 3) return;
    set("openToRoles", [...form.openToRoles, role]);
    clearErr("openToRoles");
  };

  const removeRole = (role) => {
    set("openToRoles", form.openToRoles.filter((r) => r !== role));
  };

  const validate = () => {
    const errs = {};
    if (!form.professionalCategory) errs.professionalCategory = "Professional category is required.";
    if (!form.openToRoles.length) errs.openToRoles = "Select at least one role.";
    if (!form.yearsOfExperience) errs.yearsOfExperience = "Years of experience is required.";
    return errs;
  };

  const handleNext = () => {
    setTouched({ professionalCategory: true, openToRoles: true, yearsOfExperience: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onNext({
      professionalCategory: form.professionalCategory,
      openToRoles: form.openToRoles,
      yearsOfExperience: parseFloat(form.yearsOfExperience),
      personalInfo: {
        yearsOfExperience: parseFloat(form.yearsOfExperience),
        professionalCategory: form.professionalCategory,
        openToRoles: form.openToRoles,
      },
    });
  };

  return (
    <div className="max-w-2xl py-6">
      <SectionHeader title="Professional Details" subtitle="Career profile and current work status." />

      {/* Professional Category */}
      <div className="mb-4">
        <Label required>Professional Category</Label>
        <CreatableSelect
          placeholder="Select category"
          options={PROFESSIONAL_CATEGORIES.map((c) => c.label)}
          value={PROFESSIONAL_CATEGORIES.find((c) => c.value === form.professionalCategory)?.label || ""}
          allowCreate={false}
          showAllOnOpen
          error={touched.professionalCategory && errors.professionalCategory}
          onChange={(label) => {
            const cat = PROFESSIONAL_CATEGORIES.find((c) => c.label === label);
            set("professionalCategory", cat?.value || "");
            touch("professionalCategory");
          }}
          onBlur={(didSelect) => {
            touch("professionalCategory");
            if (!didSelect && !form.professionalCategory) setErr("professionalCategory", "Professional category is required.");
            else clearErr("professionalCategory");
          }}
        />
      </div>

      {/* Open to Roles */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Label required>Open to Roles</Label>
          <span className="text-xs text-(--color-black-shade-500)">{form.openToRoles.length} / 3</span>
        </div>

        {form.openToRoles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {form.openToRoles.map((role) => (
              <RolePill key={role} label={role} onRemove={() => removeRole(role)} />
            ))}
          </div>
        )}

        {form.professionalCategory ? (
          <CreatableSelect
            placeholder={
              form.openToRoles.length >= 3
                ? "Maximum 3 roles selected"
                : "Type or select role"
            }
            options={availableRoles}
            value=""
            allowCreate={true}
            showAllOnOpen
            isDisabled={form.openToRoles.length >= 3}
            error={touched.openToRoles && errors.openToRoles}
            onChange={addRole}
            onBlur={(didSelect) => {
              touch("openToRoles");
              if (!didSelect && form.openToRoles.length === 0) setErr("openToRoles", "Select at least one role.");
              else clearErr("openToRoles");
            }}
          />
        ) : (
          <p className="text-sm text-(--color-black-shade-400) italic">Select a category above to see available roles.</p>
        )}
        {form.openToRoles.length >= 3 && (
          <p className="mt-1 text-xs font-medium text-(--color-primary)">You can select up to 3 roles only.</p>
        )}
      </div>

      {/* Years of Experience */}
      <div className="mb-4">
        <Label required>Years of Experience</Label>
        <Input
          type="number"
          min="0"
          step="0.5"
          placeholder="e.g. 0 for fresher, 1.5, 2, 5.5"
          value={form.yearsOfExperience}
          onChange={(e) => { set("yearsOfExperience", e.target.value); touch("yearsOfExperience"); if (e.target.value !== "") clearErr("yearsOfExperience"); }}
          onBlur={() => {
            touch("yearsOfExperience");
            if (form.yearsOfExperience === "") setErr("yearsOfExperience", "Years of experience is required.");
            else clearErr("yearsOfExperience");
          }}
        />
        {touched.yearsOfExperience && errors.yearsOfExperience && (
          <p className="mt-1 text-xs text-(--color-red)">{errors.yearsOfExperience}</p>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-auto! min-w-32! px-6!">Back</Button>
        <Button onClick={handleNext} className="min-w-40!">Continue</Button>
      </div>
    </div>
  );
}

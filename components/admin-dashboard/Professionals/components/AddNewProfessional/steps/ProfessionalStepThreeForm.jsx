"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import CreatableSelect from "@/components/common/CreatableSelect";
import { useMetadataData } from "@/hooks/useMetadata";
import { validateSkill, SKILL_MAX_LENGTH } from "@/utilities/skillValidation";

const MAX_SKILLS = 15;

const ENUM_TO_METADATA_KEY = {
  developer: "Development",
  marketing: "Marketing",
  sales: "Sales",
  designer: "Design",
  consultant: "Consultancy",
};

function SkillPill({ label, onRemove }) {
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

export default function ProfessionalStepThreeForm({
  defaultValues = {},
  professionalCategory = "",
  onBack,
  onNext,
}) {
  const { metadata } = useMetadataData();

  const metadataKey = ENUM_TO_METADATA_KEY[professionalCategory];
  const techOptions = (metadataKey && metadata.techSkillsByCategory?.[metadataKey]) || [];
  const strategicOptions = (metadataKey && metadata.strategicSkillsByCategory?.[metadataKey]) || [];
  const allSkillOptions = metadataKey
    ? [...new Set([...techOptions, ...strategicOptions])]
    : [...new Set([
        ...Object.values(metadata.techSkillsByCategory || {}).flat(),
        ...Object.values(metadata.strategicSkillsByCategory || {}).flat(),
      ])];

  const [skills, setSkills] = useState(defaultValues.skills || []);
  const [profileSummary, setProfileSummary] = useState(defaultValues.profileSummary || "");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setErr = (field, msg) => setErrors((prev) => ({ ...prev, [field]: msg }));
  const clearErr = (field) => setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const availableSkills = allSkillOptions.filter((s) => !skills.includes(s));

  const addSkill = (skill) => {
    if (!skill || skills.length >= MAX_SKILLS) return;
    const result = validateSkill(skill, skills)
    if (!result.valid) { setErr("skillInput", result.error); return; }
    clearErr("skillInput");
    setSkills((prev) => [...prev, result.value]);
    clearErr("skills");
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const validate = () => {
    const errs = {};
    if (skills.length === 0) errs.skills = "Add at least one skill.";
    if (profileSummary.trim().length > 0 && profileSummary.trim().length < 10) errs.profileSummary = "Profile summary must be at least 10 characters.";
    if (profileSummary.length > 3000) errs.profileSummary = "Profile summary cannot exceed 3000 characters.";
    return errs;
  };

  const handleNext = () => {
    setTouched({ skills: true, profileSummary: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onNext({
      skills,
      technicalSkills: skills.filter((s) => techOptions.includes(s)),
      strategicSkills: skills.filter((s) => strategicOptions.includes(s) && !techOptions.includes(s)),
      profileSummary: profileSummary.trim() || undefined,
    });
  };

  return (
    <div className="max-w-2xl py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-(--color-black-shade-900)">Skills</h2>
        <p className="mt-0.5 text-sm font-medium text-(--color-black-shade-500)">
          Add up to {MAX_SKILLS} skills. Suggestions are filtered by the selected professional category.
        </p>
      </div>

      {/* Skills section */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <Label required>Skills</Label>
          <span className="text-xs text-(--color-black-shade-600)">Max {MAX_SKILLS}</span>
        </div>

        {skills.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillPill key={skill} label={skill} onRemove={() => removeSkill(skill)} />
            ))}
          </div>
        )}

        <CreatableSelect
          placeholder={
            skills.length >= MAX_SKILLS
              ? "Maximum 15 skills selected"
              : !professionalCategory
              ? "Type or select a skill…"
              : "Type or select skill"
          }
          options={availableSkills}
          value=""
          allowCreate={true}
          showAllOnOpen
          isDisabled={skills.length >= MAX_SKILLS}
          maxLength={SKILL_MAX_LENGTH}
          error={touched.skills && errors.skills}
          onChange={addSkill}
          onBlur={(didSelect) => {
            markTouched("skills");
            clearErr("skillInput");
            if (!didSelect && skills.length === 0) setErr("skills", "Add at least one skill.");
            else clearErr("skills");
          }}
        />
        {errors.skillInput && (
          <p className="mt-1 text-xs text-(--color-red)">{errors.skillInput}</p>
        )}
        {!professionalCategory && (
          <p className="mt-1 text-xs text-(--color-black-shade-400) italic">
            Select a category in Step 2 to get skill suggestions.
          </p>
        )}
        {skills.length >= MAX_SKILLS && (
          <p className="mt-1 text-xs font-medium text-(--color-primary)">You can select up to 15 skills only.</p>
        )}
      </div>

      {/* Profile Summary */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <Label htmlFor="profileSummary">
            Profile Summary
            <span className="ml-1 text-xs font-normal text-(--color-black-shade-400)">(optional)</span>
          </Label>
          <span className="text-xs text-(--color-black-shade-400)">{profileSummary.length} / 3000</span>
        </div>
        <p className="mb-2 text-xs text-(--color-black-shade-600)">
          Don&apos;t write contact information like email or phone number here.
        </p>
        <textarea
          id="profileSummary"
          value={profileSummary}
          rows={4}
          maxLength={3000}
          placeholder="A brief summary of the professional's background and expertise…"
          onChange={(e) => {
            setProfileSummary(e.target.value);
            if (e.target.value) clearErr("profileSummary");
          }}
          onBlur={() => {
            markTouched("profileSummary");
            if (profileSummary.trim().length > 0 && profileSummary.trim().length < 10) setErr("profileSummary", "Profile summary must be at least 10 characters.");
            else clearErr("profileSummary");
          }}
          className={`w-full rounded-xl border px-5 py-4 text-[0.9375rem] font-medium outline-none transition-colors resize-none placeholder:text-(--color-black-shade-400) ${
            touched.profileSummary && errors.profileSummary
              ? "border-(--color-red) focus:border-(--color-red)"
              : "border-(--color-black-shade-300) focus:border-(--color-primary)"
          }`}
        />
        {touched.profileSummary && errors.profileSummary && (
          <p className="mt-1.5 text-xs text-(--color-red)">{errors.profileSummary}</p>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-auto! min-w-32! px-6!">Back</Button>
        <Button onClick={handleNext} className="min-w-40!">Continue</Button>
      </div>
    </div>
  );
}

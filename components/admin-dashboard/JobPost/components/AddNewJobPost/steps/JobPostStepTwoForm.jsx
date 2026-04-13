"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import Icon from "@/components/common/Icon";
import CreatableSelect from "@/components/common/CreatableSelect";
import { SelectPill, TogglePill } from "../pills";
import { TECH_SKILLS_BY_CATEGORY, STRATEGIC_SKILLS_BY_CATEGORY } from "@/constants/jobPost";
import { filterSelectedOptions } from "@/utilities/filterSelectedOptions";

// ── Static options ────────────────────────────────────────────────────────────
const EDUCATION_OPTIONS = ["Graduate", "Post Graduate", "Diploma", "12th Pass"];

const EXPERIENCE_OPTIONS = [
  "Fresher / 0 years",
  "0–1 year",
  "1–2 years",
  "2–3 years",
  "3–5 years",
  "5–7 years",
  "7–10 years",
  "10+ years",
];

const ENGLISH_OPTIONS = ["Not Required", "Basic", "Intermediate", "Advance"];

const ADDITIONAL_REQ_OPTIONS = [
  "Gender",
  "Age",
  "Assets",
  "Regional Languages",
];

const GENDER_OPTIONS = ["Open to all", "Male", "Female"];



// ── Shared input style helpers ────────────────────────────────────────────────
const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError =
  "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <Heading as="h2" className="text-lg">
        {title}
      </Heading>
      {subtitle && (
        <Text className="mt-1 text-sm font-medium">{subtitle}</Text>
      )}
    </div>
  );
}

function SectionDivider() {
  return <div className="my-8 border-t border-(--color-black-shade-100)" />;
}

function FieldLabel({ children, required, info }) {
  return (
    <div className="mb-2 flex items-center gap-1.5">
      <label className="text-[0.9375rem] font-medium text-(--color-black-shade-900)">
        {children}
        {required && <span className="ml-1 text-(--color-black)">*</span>}
      </label>
      {info && (
        <Icon
          name="statics/Employer-Dashboard/info.svg"
          width={17}
          height={17}
          alt="More info"
        />
      )}
    </div>
  );
}


// ── Validation ────────────────────────────────────────────────────────────────
function validate(form) {
  const errs = {};
  if (!form.minimumEducation)
    errs.minimumEducation = "Please select minimum education.";
  if (!form.educationStream.trim())
    errs.educationStream = "Education stream is required.";
  if (!form.yearsExperience)
    errs.yearsExperience = "Please select years of experience.";
  if (!form.englishLevel)
    errs.englishLevel = "Please select English level required.";
  if (form.technicalSkills.length < 4)
    errs.technicalSkills = "Please add at least 4 technical skills.";
  if (form.strategicSkills.length < 4)
    errs.strategicSkills = "Please add at least 4 strategic skills.";
  return errs;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JobPostStepTwoForm({ defaultValues = {}, onNext, onBack, jobCategory = "" }) {
  const techSkillOptions = TECH_SKILLS_BY_CATEGORY[jobCategory] ?? [];
  const strategicSkillOptions = STRATEGIC_SKILLS_BY_CATEGORY[jobCategory] ?? [];
  const [form, setForm] = useState({
    minimumEducation: "",
    educationStream: "",
    yearsExperience: "",
    englishLevel: "",
    additionalRequirements: [],
    gender: "Open to all",
    technicalSkills: [],
    strategicSkills: [],
    ...defaultValues,
  });

  const [touched, setTouched] = useState({});

  const currentErrors = validate(form);
  const isFormValid = Object.keys(currentErrors).length === 0;

  const set = (field) => (val) => setForm({ ...form, [field]: val });
  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));
  const err = (field) => (touched[field] ? currentErrors[field] : "");

  const toggleAdditionalReq = (req) => {
    const cur = form.additionalRequirements;
    set("additionalRequirements")(
      cur.includes(req) ? cur.filter((r) => r !== req) : [...cur, req],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
    setTouched(allTouched);
    if (isFormValid) onNext?.(form);
  };

  const hasGender = form.additionalRequirements.includes("Gender");

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Basic Requirements ───────────────────────────────────────────── */}
      <SectionHeader
        title="Basic Requirements"
        subtitle="We'll use these requirement details to make your job visible to the right professional"
      />

      {/* Minimum Education */}
      <div className="mb-5">
        <Label required>Minimum Education</Label>
        <div className="flex flex-wrap gap-2">
          {EDUCATION_OPTIONS.map((opt) => (
            <SelectPill
              key={opt}
              label={opt}
              isSelected={form.minimumEducation === opt}
              onSelect={() => {
                set("minimumEducation")(opt);
                touch("minimumEducation")();
              }}
            />
          ))}
        </div>
        {err("minimumEducation") && (
          <p className="mt-1.5 text-xs text-(--color-red)">
            {err("minimumEducation")}
          </p>
        )}
      </div>

      {/* Education Stream */}
      <div className="mb-5">
        <FieldLabel required info>
          Education Stream
        </FieldLabel>
        <input
          type="text"
          value={form.educationStream}
          onChange={handle("educationStream")}
          onBlur={touch("educationStream")}
          placeholder="Eg. Computer Science"
          className={`${inputBase} ${err("educationStream") ? inputError : inputNormal}`}
        />
        {err("educationStream") && (
          <p className="mt-1.5 text-xs text-(--color-red)">
            {err("educationStream")}
          </p>
        )}
      </div>

      {/* Years of Experience */}
      <div className="mb-5">
        <FieldLabel required info>
          Total Years of Full-time Experience Required
        </FieldLabel>
        <CreatableSelect
          placeholder="Choose from range"
          options={EXPERIENCE_OPTIONS}
          value={form.yearsExperience}
          allowCreate={false}
          showAllOnOpen
          error={err("yearsExperience")}
          onChange={(val) => {
            set("yearsExperience")(val);
            touch("yearsExperience")();
          }}
          onBlur={() => {
            touch("yearsExperience")();
          }}
          className="mb-0!"
        />
      </div>

      {/* English Level */}
      <div className="mb-5">
        <Label required>English Level Required</Label>
        <div className="flex flex-wrap gap-2">
          {ENGLISH_OPTIONS.map((opt) => (
            <SelectPill
              key={opt}
              label={opt}
              isSelected={form.englishLevel === opt}
              onSelect={() => {
                set("englishLevel")(opt);
                touch("englishLevel")();
              }}
            />
          ))}
        </div>
        {err("englishLevel") && (
          <p className="mt-1.5 text-xs text-(--color-red)">
            {err("englishLevel")}
          </p>
        )}
      </div>

      <SectionDivider />

      {/* ── Additional Requirements ──────────────────────────────────────── */}
      <SectionHeader
        title="Additional Requirement (Optional)"
        subtitle="Add additional requirement so that we can help you find the right candidates"
      />

      <div className="mb-5">
        <div className="flex flex-wrap gap-2">
          {ADDITIONAL_REQ_OPTIONS.map((req) => (
            <TogglePill
              key={req}
              label={req}
              isSelected={form.additionalRequirements.includes(req)}
              onToggle={() => toggleAdditionalReq(req)}
            />
          ))}
        </div>
      </div>

      {/* Gender sub-section */}
      {hasGender && (
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[0.9375rem] font-medium text-(--color-black-shade-900)">
              Gender
            </p>
            <button
              type="button"
              onClick={() => toggleAdditionalReq("Gender")}
              className="cursor-pointer text-(--color-black-shade-500) hover:text-(--color-black)"
              aria-label="Remove gender filter"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <SelectPill
                key={opt}
                label={opt}
                isSelected={form.gender === opt}
                onSelect={() => set("gender")(opt)}
              />
            ))}
          </div>
        </div>
      )}

      <SectionDivider />

      {/* ── Skills ───────────────────────────────────────────────────────── */}
      <SectionHeader
        title="Skills *"
        subtitle="Add skills so that we can help you find the right candidates"
      />

      {/* Technical Skills */}
      <div className="mb-6">
        <FieldLabel required info>
          Technical Skills
        </FieldLabel>
        {form.technicalSkills.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {form.technicalSkills.map((skill) => (
              <div
                key={skill}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-(--color-primary-shade-100) px-3 py-1.5 text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => {
                    set("technicalSkills")(form.technicalSkills.filter((s) => s !== skill));
                    touch("technicalSkills")();
                  }}
                >
                  <Icon name="statics/login/cross-icon.svg" width={9} height={9} alt="Remove" />
                </button>
              </div>
            ))}
          </div>
        )}
        <CreatableSelect
          placeholder="Type or select technical skill"
          options={filterSelectedOptions(techSkillOptions, form.technicalSkills)}
          allowCreate={true}
          value=""
          error={err("technicalSkills")}
          onChange={(value) => {
            if (!value || form.technicalSkills.includes(value)) return;
            set("technicalSkills")([...form.technicalSkills, value]);
          }}
          onBlur={() => touch("technicalSkills")()}
        />
      </div>

      {/* Strategic Skills */}
      <div className="mb-5">
        <FieldLabel required info>
          Strategic Skills
        </FieldLabel>
        {form.strategicSkills.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {form.strategicSkills.map((skill) => (
              <div
                key={skill}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-(--color-primary-shade-100) px-3 py-1.5 text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => {
                    set("strategicSkills")(form.strategicSkills.filter((s) => s !== skill));
                    touch("strategicSkills")();
                  }}
                >
                  <Icon name="statics/login/cross-icon.svg" width={9} height={9} alt="Remove" />
                </button>
              </div>
            ))}
          </div>
        )}
        <CreatableSelect
          placeholder="Type or select strategic skill"
          options={filterSelectedOptions(strategicSkillOptions, form.strategicSkills)}
          allowCreate={true}
          value=""
          error={err("strategicSkills")}
          onChange={(value) => {
            if (!value || form.strategicSkills.includes(value)) return;
            set("strategicSkills")([...form.strategicSkills, value]);
          }}
          onBlur={() => touch("strategicSkills")()}
        />
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="mt-10 flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          type="button"
          onClick={onBack}
          className="sm:w-52!"
        >
          Back
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!isFormValid}
          className={`sm:w-52! ${!isFormValid ? "bg-(--color-black-shade-100) text-(--color-black-shade-400) hover:bg-(--color-black-shade-100) cursor-not-allowed" : ""}`}
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

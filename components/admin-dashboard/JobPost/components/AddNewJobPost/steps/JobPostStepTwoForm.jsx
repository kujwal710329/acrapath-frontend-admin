"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import Icon from "@/components/common/Icon";
import CreatableSelect from "@/components/common/CreatableSelect";
import { SelectPill, TogglePill } from "../pills";
import { useMetadataData } from "@/hooks/useMetadata";
import { filterSelectedOptions } from "@/utilities/filterSelectedOptions";
import InfoTooltip from "@/components/common/InfoTooltip";

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
const ASSETS_OPTIONS = ["Bike", "Car", "Laptop", "Smartphone", "Two-Wheeler"];
const REGIONAL_LANGUAGES_OPTIONS = [
  "Hindi", "English", "Tamil", "Telugu", "Kannada", "Malayalam",
  "Marathi", "Bengali", "Gujarati", "Punjabi", "Odia", "Urdu",
];

// ── Shared input styles ───────────────────────────────────────────────────────
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
  return <div className="my-8 border-t border-(--color-black-shade-300)" />;
}

function FieldLabel({ children, required, info }) {
  return (
    <div className="mb-4 flex items-center gap-1.5">
      <label className="text-[0.9375rem] font-medium text-(--color-black-shade-900)">
        {children}
        {required && <span className="ml-1 text-(--color-black)">*</span>}
      </label>
      {info && <InfoTooltip text={info} />}
    </div>
  );
}

function SubSectionHeader({ title, onRemove }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[0.9375rem] font-medium text-(--color-black-shade-900)">
        {title}
      </p>
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer text-(--color-black-shade-500) hover:text-black"
        aria-label={`Remove ${title}`}
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
  // Optional age validation — only when values are present
  if (form.ageMin !== "" && Number(form.ageMin) < 18)
    errs.ageMin = "Min age must be at least 18.";
  if (form.ageMin !== "" && form.ageMax !== "" && Number(form.ageMax) <= Number(form.ageMin))
    errs.ageMax = "Max age must be greater than min age.";
  return errs;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JobPostStepTwoForm({ defaultValues = {}, onNext, onBack, jobCategory = "" }) {
  const { metadata, loading: metaLoading, error: metaError } = useMetadataData();

  const techSkillOptions = metadata.techSkillsByCategory[jobCategory] ?? [];
  const strategicSkillOptions = metadata.strategicSkillsByCategory[jobCategory] ?? [];
  const [form, setForm] = useState({
    minimumEducation: "",
    educationStream: "",
    yearsExperience: "",
    englishLevel: "",
    additionalRequirements: [],
    gender: "Open to all",
    ageMin: "",
    ageMax: "",
    assets: [],
    regionalLanguages: [],
    technicalSkills: [],
    strategicSkills: [],
    ...defaultValues,
  });

  const [touched, setTouched] = useState({});

  const currentErrors = validate(form);
  const isFormValid = Object.keys(currentErrors).length === 0;

  const set = (field) => (val) => setForm((prev) => ({ ...prev, [field]: val }));
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));
  const err = (field) => (touched[field] ? currentErrors[field] : "");

  const toggleAdditionalReq = (req) => {
    const cur = form.additionalRequirements;
    const isRemoving = cur.includes(req);
    const clearedValues = {};
    if (isRemoving) {
      if (req === "Gender") clearedValues.gender = "Open to all";
      if (req === "Age") { clearedValues.ageMin = ""; clearedValues.ageMax = ""; }
      if (req === "Assets") clearedValues.assets = [];
      if (req === "Regional Languages") clearedValues.regionalLanguages = [];
    }
    setForm((prev) => ({
      ...prev,
      additionalRequirements: isRemoving
        ? cur.filter((r) => r !== req)
        : [...cur, req],
      ...clearedValues,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
    setTouched(allTouched);
    if (isFormValid) onNext?.(form);
  };

  const hasGender = form.additionalRequirements.includes("Gender");
  const hasAge = form.additionalRequirements.includes("Age");
  const hasAssets = form.additionalRequirements.includes("Assets");
  const hasRegionalLanguages = form.additionalRequirements.includes("Regional Languages");

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Basic Requirements ───────────────────────────────────────────── */}
      <SectionHeader
        title="Basic Requirements"
        subtitle="We'll use these requirement details to make your job visible to the right professional"
      />

      {/* Minimum Education */}
      <div className="mb-6">
        <Label required className="mb-4!">Minimum Education</Label>
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
      <div className="mb-6">
        <FieldLabel required info="Specify the field of study required (e.g. Computer Science, MBA, Electronics). You can type a custom stream if it's not listed.">
          Education Stream
        </FieldLabel>
        {metaError && (
          <p className="mb-3 rounded-lg bg-red-50 px-4 py-2.5 text-xs text-(--color-red)">
            {metaError}
          </p>
        )}
        <CreatableSelect
          placeholder={metaLoading ? "Loading fields…" : "Eg. Computer Science"}
          options={metadata.fieldsOfStudy}
          value={form.educationStream}
          isDisabled={metaLoading}
          allowCreate={true}
          showAllOnOpen
          error={err("educationStream")}
          onChange={(val) => {
            set("educationStream")(val);
            touch("educationStream")();
          }}
          onBlur={() => touch("educationStream")()}
          className="mb-0!"
        />
      </div>

      {/* Years of Experience */}
      <div className="mb-6">
        <FieldLabel required info="Count only full-time professional experience. Internships, freelance, or part-time work are not included.">
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
      <div className="mb-6">
        <Label required className="mb-4!">English Level Required</Label>
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

      <div className="mb-6">
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
        <div className="mb-6">
          <SubSectionHeader title="Gender" onRemove={() => toggleAdditionalReq("Gender")} />
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

      {/* Age sub-section */}
      {hasAge && (
        <div className="mb-6">
          <SubSectionHeader title="Age" onRemove={() => toggleAdditionalReq("Age")} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-(--color-black-shade-700)">
                Min Age
              </p>
              <input
                type="number"
                min="18"
                value={form.ageMin}
                onChange={(e) => {
                  set("ageMin")(e.target.value);
                  touch("ageMin")();
                }}
                onBlur={touch("ageMin")}
                placeholder="e.g. 21"
                className={`${inputBase} ${err("ageMin") ? inputError : inputNormal}`}
              />
              {err("ageMin") && (
                <p className="mt-1.5 text-xs text-(--color-red)">{err("ageMin")}</p>
              )}
            </div>
            <span className="hidden shrink-0 pt-12 text-sm font-medium text-(--color-black-shade-700) sm:block">
              to
            </span>
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-(--color-black-shade-700)">
                Max Age
              </p>
              <input
                type="number"
                min="18"
                value={form.ageMax}
                onChange={(e) => {
                  set("ageMax")(e.target.value);
                  touch("ageMax")();
                }}
                onBlur={touch("ageMax")}
                placeholder="e.g. 45"
                className={`${inputBase} ${err("ageMax") ? inputError : inputNormal}`}
              />
              {err("ageMax") && (
                <p className="mt-1.5 text-xs text-(--color-red)">{err("ageMax")}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assets sub-section */}
      {hasAssets && (
        <div className="mb-6">
          <SubSectionHeader title="Assets" onRemove={() => toggleAdditionalReq("Assets")} />
          <div className="flex flex-wrap gap-2">
            {ASSETS_OPTIONS.map((opt) => (
              <SelectPill
                key={opt}
                label={opt}
                isSelected={form.assets.includes(opt)}
                onSelect={() => {
                  const next = form.assets.includes(opt)
                    ? form.assets.filter((a) => a !== opt)
                    : [...form.assets, opt];
                  set("assets")(next);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regional Languages sub-section */}
      {hasRegionalLanguages && (
        <div className="mb-6">
          <SubSectionHeader
            title="Regional Languages"
            onRemove={() => toggleAdditionalReq("Regional Languages")}
          />
          <div className="flex flex-wrap gap-2">
            {REGIONAL_LANGUAGES_OPTIONS.map((opt) => (
              <SelectPill
                key={opt}
                label={opt}
                isSelected={form.regionalLanguages.includes(opt)}
                onSelect={() => {
                  const next = form.regionalLanguages.includes(opt)
                    ? form.regionalLanguages.filter((l) => l !== opt)
                    : [...form.regionalLanguages, opt];
                  set("regionalLanguages")(next);
                }}
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
        <FieldLabel required info="Add at least 4 technical or domain-specific skills required for this role. These are used to match your job with candidates who have the right expertise.">
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
          placeholder={metaLoading ? "Loading skills…" : "Type or select technical skill"}
          options={filterSelectedOptions(techSkillOptions, form.technicalSkills)}
          isDisabled={metaLoading}
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
      <div className="mb-6">
        <FieldLabel required info="Add at least 4 soft or behavioural skills required (e.g. Communication, Leadership). These improve the quality of candidate matches.">
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
          placeholder={metaLoading ? "Loading skills…" : "Type or select strategic skill"}
          options={filterSelectedOptions(strategicSkillOptions, form.strategicSkills)}
          isDisabled={metaLoading}
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

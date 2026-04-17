"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import CreatableSelect from "@/components/common/CreatableSelect";
import RichTextEditor from "@/components/common/RichTextEditor";
import { SelectPill } from "../pills";
import { filterSelectedOptions } from "@/utilities/filterSelectedOptions";

/** Strip HTML tags to get plain-text character count for validation. */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

const MAX_DESC_LENGTH = 10000;

// ── Static options ────────────────────────────────────────────────────────────
const INTERVIEW_LOCATION_OPTIONS = [
  "Online",
  "In-office",
  "Both Online & In-office",
];

const INTERVIEW_STAGE_OPTIONS = [
  "Resume Screening",
  "Online Test / Assessment",
  "Assignment",
  "Group Discussion",
  "Technical Interview 1",
  "Technical Interview 2",
  "Manager Round",
  "HR Round",
  "Final Interview",
  "Offer Discussion",
];

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

// ── Validation ────────────────────────────────────────────────────────────────
function validate(form) {
  const errs = {};
  const descLength = stripHtml(form.jobDescription).length;
  if (descLength < 20)
    errs.jobDescription =
      "Please provide at least 20 characters for the job description.";
  else if (descLength > MAX_DESC_LENGTH)
    errs.jobDescription = `Job description cannot exceed ${MAX_DESC_LENGTH.toLocaleString()} characters.`;
  if (!form.interviewLocationType)
    errs.interviewLocationType = "Please select an interview location type.";
  return errs;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JobPostStepThreeForm({ defaultValues = {}, onNext, onBack }) {
  const [form, setForm] = useState({
    jobDescription: "",
    interviewLocationType: "",
    interviewStages: ["", "", "", "", ""],
    ...defaultValues,
  });

  const [touched, setTouched] = useState({});

  const currentErrors = validate(form);
  const isFormValid = Object.keys(currentErrors).length === 0;

  const set = (field) => (val) => setForm({ ...form, [field]: val });
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));
  const err = (field) => (touched[field] ? currentErrors[field] : "");

  const setStage = (index, value) => {
    const stages = [...form.interviewStages];
    stages[index] = value;
    set("interviewStages")(stages);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ jobDescription: true, interviewLocationType: true });
    if (isFormValid) onNext?.(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Job Description ──────────────────────────────────────────────── */}
      <SectionHeader
        title="Job Description"
        subtitle="Clear job description — don't include any contact information like email or phone number"
      />

      <div className="mb-2">
        <Label required className="mb-4!">Job Description</Label>
        <RichTextEditor
          value={form.jobDescription}
          onChange={set("jobDescription")}
          onBlur={touch("jobDescription")}
          placeholder="Describe the role, key responsibilities, and what makes this opportunity exciting…"
          hasError={!!err("jobDescription")}
        />
        <div className="mt-1 flex items-center justify-between">
          {err("jobDescription") ? (
            <p className="text-xs text-(--color-red)">{err("jobDescription")}</p>
          ) : (
            <span />
          )}
          <p className={`ml-auto text-xs ${stripHtml(form.jobDescription).length > MAX_DESC_LENGTH ? "text-(--color-red)" : "text-(--color-black-shade-400)"}`}>
            {stripHtml(form.jobDescription).length.toLocaleString()} / {MAX_DESC_LENGTH.toLocaleString()}
          </p>
        </div>
      </div>

      <SectionDivider />

      {/* ── Interview Method & Address ───────────────────────────────────── */}
      <SectionHeader
        title="Interview method and address"
        subtitle="Let professionals know how the interview will be conducted for this job"
      />

      {/* Interview Location Type */}
      <div className="mb-6">
        <Label required className="mb-4!">Interview Location Type</Label>
        <div className="flex flex-wrap gap-2">
          {INTERVIEW_LOCATION_OPTIONS.map((opt) => (
            <SelectPill
              key={opt}
              label={opt}
              isSelected={form.interviewLocationType === opt}
              onSelect={() => {
                set("interviewLocationType")(opt);
                touch("interviewLocationType")();
              }}
            />
          ))}
        </div>
        {err("interviewLocationType") && (
          <p className="mt-1.5 text-xs text-(--color-red)">
            {err("interviewLocationType")}
          </p>
        )}
      </div>

      {/* Interview Process — 5 optional stages */}
      <div className="mb-6">
        <p className="mb-4 text-[0.9375rem] font-medium text-(--color-black-shade-900)">
          Interview Process (Optional)
        </p>
        <div className="flex flex-col gap-4">
          {form.interviewStages.map((stage, index) => {
            const otherSelected = form.interviewStages.filter((s, i) => i !== index && s !== "");
            const availableOptions = filterSelectedOptions(INTERVIEW_STAGE_OPTIONS, otherSelected);
            return (
              <div key={index}>
                <p className="mb-2 text-sm font-medium text-(--color-black-shade-700)">
                  Stage {index + 1}
                </p>
                <CreatableSelect
                  placeholder={`Choose Stage ${index + 1}`}
                  options={availableOptions}
                  value={stage}
                  allowCreate={false}
                  showAllOnOpen
                  onChange={(val) => setStage(index, val)}
                  className="mb-0!"
                />
              </div>
            );
          })}
        </div>
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

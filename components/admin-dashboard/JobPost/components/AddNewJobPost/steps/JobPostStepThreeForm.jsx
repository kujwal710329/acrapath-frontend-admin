"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import RichTextEditor from "@/components/common/RichTextEditor";

/** Strip HTML tags to get plain-text character count for validation. */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

const MAX_DESC_LENGTH = 10000;

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

// ── Validation ────────────────────────────────────────────────────────────────
function validate(form) {
  const errs = {};
  const descLength = stripHtml(form.jobDescription).length;
  if (descLength < 20)
    errs.jobDescription =
      "Please provide at least 20 characters for the job description.";
  else if (descLength > MAX_DESC_LENGTH)
    errs.jobDescription = `Job description cannot exceed ${MAX_DESC_LENGTH.toLocaleString()} characters.`;
  return errs;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JobPostStepThreeForm({ defaultValues = {}, onNext, onBack }) {
  const [form, setForm] = useState({
    jobDescription: "",
    ...defaultValues,
  });

  const [touched, setTouched] = useState({});

  const currentErrors = validate(form);
  const isFormValid = Object.keys(currentErrors).length === 0;

  const set = (field) => (val) => setForm({ ...form, [field]: val });
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));
  const err = (field) => (touched[field] ? currentErrors[field] : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ jobDescription: true });
    if (isFormValid) {
      onNext?.(form);
    } else {
      document.getElementById("field-jobDescription")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Job Description ──────────────────────────────────────────────── */}
      <SectionHeader
        title="Job Description"
        subtitle="Clear job description — don't include any contact information like email or phone number"
      />

      <div id="field-jobDescription" className="mb-2">
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
          className="sm:w-52!"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

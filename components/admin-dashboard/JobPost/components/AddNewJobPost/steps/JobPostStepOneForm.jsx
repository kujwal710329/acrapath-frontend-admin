"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import Icon from "@/components/common/Icon";
import { SelectPill } from "../pills";
import CreatableSelect from "@/components/common/CreatableSelect";
import WorkingLocationPicker from "@/components/location/WorkingLocationPicker";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useMetadataData } from "@/hooks/useMetadata";
import { filterSelectedOptions } from "@/utilities/filterSelectedOptions";
import InfoTooltip from "@/components/common/InfoTooltip";

/** Strip HTML tags to get plain-text length for validation. */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

// ── Static options ────────────────────────────────────────────────────────────
const JOB_TYPE_OPTIONS = ["Full-time", "Freelance", "Part-time", "Contract"];
const WORK_TYPE_OPTIONS = ["In-office", "Remote", "Hybrid", "Field Job"];
const PAY_TYPE_OPTIONS = ["Fixed Only", "Fixed + Variable"];
const PERKS_OPTIONS = [
  "Health Insurance",
  "Flexible Working Hours",
  "Joining Bonus",
  "PF",
  "Travel Allowance",
  "Petrol Allowance",
  "Mobile Allowance",
  "Laptop",
];

// ── Shared input style helpers ────────────────────────────────────────────────
const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError =
  "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";
const inputReadOnly =
  "border-(--color-black-shade-200) bg-(--color-black-shade-50) text-(--color-black-shade-800) cursor-default";

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <Heading as="h2" className="text-md">
        {title}
      </Heading>
      {subtitle && (
        <Text className="mt-1 text-xs sm:text-sm font-medium">{subtitle}</Text>
      )}
    </div>
  );
}

function SectionDivider() {
  return <div className="my-8 border-t border-(--color-black-shade-300)" />;
}

// Label with optional info tooltip inline
function FieldLabel({ children, required, info }) {
  return (
    <div className="mb-4 flex items-center gap-1.5">
      <label className="text-[0.9375rem] font-medium text-(--color-black-shade-900)">
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {info && <InfoTooltip text={info} />}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate(form) {
  const errs = {};
  if (!form.companyName.trim()) errs.companyName = "Company name is required.";
  if (!form.jobTitle.trim()) errs.jobTitle = "Job title is required.";
  if (!form.jobCategory) errs.jobCategory = "Job category is required.";
  if (!form.jobType) errs.jobType = "Please select a job type.";
  if (form.jobSource === "external") {
    if (!form.externalJobUrl.trim()) errs.externalJobUrl = "Careers page / application link is required.";
    else if (!isValidUrl(form.externalJobUrl.trim())) errs.externalJobUrl = "Enter a valid URL (e.g. https://careers.company.com/apply).";
  }
  if (!form.workType) errs.workType = "Please select a work type.";
  if (!form.workingLocation.address?.trim())
    errs.workingLocation = "Working location is required.";
  if (!form.city.trim()) errs.city = "City is required.";
  if (!form.state.trim()) errs.state = "State is required.";
  if (!form.pincode.trim()) errs.pincode = "Pincode is required.";
  else if (!/^[0-9]{6}$/.test(form.pincode.trim()))
    errs.pincode = "Enter a valid 6-digit pincode.";
  const descLen = stripHtml(form.companyDescription).length;
  if (!descLen)
    errs.companyDescription = "Company description is required.";
  else if (descLen < 50)
    errs.companyDescription = "Company description must be at least 50 characters.";
  if (!String(form.fixedSalaryMin).trim()) errs.fixedSalaryMin = "Minimum salary is required.";
  else if (Number(form.fixedSalaryMin) <= 0) errs.fixedSalaryMin = "Enter a valid minimum salary.";
  if (!String(form.fixedSalaryMax).trim()) errs.fixedSalaryMax = "Maximum salary is required.";
  else if (Number(form.fixedSalaryMax) <= 0) errs.fixedSalaryMax = "Enter a valid maximum salary.";
  else if (Number(form.fixedSalaryMax) < Number(form.fixedSalaryMin))
    errs.fixedSalaryMax = "Maximum salary must be greater than minimum.";
  if (form.payType === "Fixed + Variable") {
    if (!String(form.variableSalary).trim()) errs.variableSalary = "Variable salary is required.";
    else if (Number(form.variableSalary) <= 0) errs.variableSalary = "Enter a valid variable salary.";
  }
  return errs;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JobPostStepOneForm({
  defaultValues = {},
  onNext,
  onBack,
}) {
  const { metadata, loading: metaLoading, error: metaError } = useMetadataData();

  const [form, setForm] = useState({
    companyName: "",
    jobTitle: "",
    jobCategory: "",
    jobType: "",
    isNightShift: false,
    jobSource: "internal",
    externalJobUrl: "",
    workType: "",
    workingLocation: { address: "", placeId: "", lat: null, lng: null, floorPlotShop: "" },
    city: "",
    state: "",
    pincode: "",
    receiveOutsideApplications: true,
    companyDescription: "",
    payType: "Fixed Only",
    fixedSalaryMin: "",
    fixedSalaryMax: "",
    variableSalary: "",
    perks: [],
    ...defaultValues,
  });

  const [touched, setTouched] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeApiError, setPincodeApiError] = useState("");

  const currentErrors = validate(form);
  const isFormValid = Object.keys(currentErrors).length === 0;

  const set = (field) => (val) => setForm({ ...form, [field]: val });
  const handle = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));
  const err = (field) => (touched[field] ? currentErrors[field] : "");

  const fetchPincodeData = async (pincode) => {
    if (!/^[0-9]{6}$/.test(pincode)) {
      setForm((prev) => ({ ...prev, city: "", state: "" }));
      setPincodeApiError("");
      return;
    }
    setPincodeLoading(true);
    setPincodeApiError("");
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setForm((prev) => ({ ...prev, city: po.District, state: po.State }));
      } else {
        setForm((prev) => ({ ...prev, city: "", state: "" }));
        setPincodeApiError("Invalid pincode");
      }
    } catch {
      setForm((prev) => ({ ...prev, city: "", state: "" }));
      setPincodeApiError("Invalid pincode");
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
    setTouched(allTouched);
    if (isFormValid) onNext?.(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Job Details ──────────────────────────────────────────────────── */}
      <SectionHeader
        title="Job details"
        subtitle="We use this information to find the best professionals for the job"
      />

      {/* Company Name */}
      <div className="mb-6">
        <Label required className="mb-4!">Company Name</Label>
        <input
          type="text"
          value={form.companyName}
          onChange={handle("companyName")}
          onBlur={touch("companyName")}
          placeholder="Eg. Acrapath Technologies"
          className={`${inputBase} ${err("companyName") ? inputError : inputNormal}`}
        />
        {err("companyName") && (
          <p className="mt-1.5 text-xs text-(--color-red)">{err("companyName")}</p>
        )}
      </div>

      {/* Company Description */}
      <div className="mb-6">
        <FieldLabel required>Company Description</FieldLabel>
        <RichTextEditor
          value={form.companyDescription}
          onChange={set("companyDescription")}
          onBlur={touch("companyDescription")}
          placeholder="Describe your company — culture, mission, and what makes it a great place to work (min 50 characters)…"
          hasError={!!err("companyDescription")}
        />
        <div className="mt-1 flex items-center justify-between">
          {err("companyDescription") ? (
            <p className="text-xs text-(--color-red)">{err("companyDescription")}</p>
          ) : (
            <span />
          )}
          <p className="ml-auto text-xs text-(--color-black-shade-400)">
            {stripHtml(form.companyDescription).length} characters
          </p>
        </div>
      </div>

      {/* Job Title */}
      <div className="mb-6">
        <FieldLabel required info="Enter the specific job title or designation for this role. A clear title (e.g. 'Senior React Developer') helps attract the right candidates.">
          Job Title / Designation
        </FieldLabel>
        <input
          type="text"
          value={form.jobTitle}
          onChange={handle("jobTitle")}
          onBlur={touch("jobTitle")}
          placeholder="Eg. Performance Marketer"
          className={`${inputBase} ${err("jobTitle") ? inputError : inputNormal}`}
        />
        {err("jobTitle") && (
          <p className="mt-1.5 text-xs text-(--color-red)">{err("jobTitle")}</p>
        )}
      </div>

      {/* Job Category */}
      <div className="mb-6">
        <Label required className="mb-4!">Job Role / Category</Label>
        {metaError && (
          <p className="mb-3 rounded-lg bg-red-50 px-4 py-2.5 text-xs text-(--color-red)">
            {metaError}
          </p>
        )}
        <CreatableSelect
          placeholder={metaLoading ? "Loading categories…" : "Select a category"}
          options={metadata.jobCategories}
          allowCreate={false}
          showAllOnOpen
          isDisabled={metaLoading}
          value={form.jobCategory}
          error={err("jobCategory")}
          onChange={(val) => {
            set("jobCategory")(val);
            touch("jobCategory")();
          }}
          onBlur={() => touch("jobCategory")()}
          className="mb-0!"
        />
      </div>

      {/* Job Type */}
      <div className="mb-6">
        <Label required className="mb-4!">Job Type</Label>

        {/* Night Shift */}
        <div className="mb-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isNightShift}
              onChange={(e) => set("isNightShift")(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            <span className="text-sm font-medium text-(--color-black-shade-700)">
              This is a night shift job
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {JOB_TYPE_OPTIONS.map((opt) => (
            <SelectPill
              key={opt}
              label={opt}
              isSelected={form.jobType === opt}
              onSelect={() => set("jobType")(opt)}
            />
          ))}
        </div>
        {err("jobType") && (
          <p className="mt-1.5 text-xs text-(--color-red)">{err("jobType")}</p>
        )}
      </div>

      {/* Job Sourcing */}
      <div className="mb-6">
        <p className="mb-4 text-[0.9375rem] font-medium text-(--color-black-shade-900)">
          Where should candidates submit their application? <span className="text-red-500">*</span>
        </p>
        <div className="flex gap-2">
          <SelectPill
            label="Through Acrapath"
            isSelected={form.jobSource === "internal"}
            onSelect={() => setForm({ ...form, jobSource: "internal", externalJobUrl: "" })}
          />
          <SelectPill
            label="Your  careers page"
            isSelected={form.jobSource === "external"}
            onSelect={() => set("jobSource")("external")}
          />
        </div>
        {form.jobSource === "external" && (
          <div className="mt-4">
            <Label required className="mb-4!">Careers Page / Application Link</Label>
            <input
              type="url"
              value={form.externalJobUrl}
              onChange={handle("externalJobUrl")}
              onBlur={touch("externalJobUrl")}
              placeholder="Paste the external job application URL"
              className={`${inputBase} ${err("externalJobUrl") ? inputError : inputNormal}`}
            />
            {err("externalJobUrl") && (
              <p className="mt-1.5 text-xs text-(--color-red)">{err("externalJobUrl")}</p>
            )}
          </div>
        )}
      </div>

      <SectionDivider />

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <SectionHeader
        title="Location"
        subtitle="Let candidate know where they will work"
      />

      {/* Work Type */}
      <div className="mb-6">
        <Label required className="mb-4!">Work Type</Label>
        <div className="flex flex-wrap gap-2">
          {WORK_TYPE_OPTIONS.map((opt) => (
            <SelectPill
              key={opt}
              label={opt}
              isSelected={form.workType === opt}
              onSelect={() => set("workType")(opt)}
            />
          ))}
        </div>
        {err("workType") && (
          <p className="mt-1.5 text-xs text-(--color-red)">{err("workType")}</p>
        )}
      </div>

      {/* Working Location */}
      <div className="mb-6">
        <Label required className="mb-4!">Working Location</Label>
        <WorkingLocationPicker
          value={form.workingLocation}
          onChange={set("workingLocation")}
          error={err("workingLocation")}
          onBlur={touch("workingLocation")}
        />
        {err("workingLocation") && (
          <p className="mt-1.5 text-xs text-(--color-red)">
            {err("workingLocation")}
          </p>
        )}
      </div>

      {/* Pincode */}
      <div className="mb-6">
        <Label required className="mb-4!">Pincode</Label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={form.pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincodeApiError("");
            if (val.length === 6) {
              setForm({ ...form, pincode: val });
              fetchPincodeData(val);
            } else {
              setForm({ ...form, pincode: val, city: "", state: "" });
            }
          }}
          onBlur={() => {
            touch("pincode")();
            if (form.pincode.length === 6) fetchPincodeData(form.pincode);
          }}
          placeholder="Eg. 400001"
          className={`${inputBase} ${err("pincode") || pincodeApiError ? inputError : inputNormal}`}
        />
        {(err("pincode") || pincodeApiError) && (
          <p className="mt-1.5 text-xs text-(--color-red)">
            {err("pincode") || pincodeApiError}
          </p>
        )}
      </div>

      {/* City & State */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Label required className="mb-4!">City</Label>
          <input
            type="text"
            value={pincodeLoading ? "" : form.city}
            onChange={handle("city")}
            onBlur={touch("city")}
            placeholder={pincodeLoading ? "Fetching…" : "Eg. Mumbai"}
            disabled={pincodeLoading}
            className={`${inputBase} ${pincodeLoading ? inputReadOnly : err("city") ? inputError : inputNormal}`}
          />
          <p className="mt-1.5 min-h-5 text-xs text-(--color-red)">{err("city")}</p>
        </div>
        <div className="flex-1">
          <Label required className="mb-4!">State</Label>
          <input
            type="text"
            value={pincodeLoading ? "" : form.state}
            onChange={handle("state")}
            onBlur={touch("state")}
            placeholder={pincodeLoading ? "Fetching…" : "Eg. Maharashtra"}
            disabled={pincodeLoading}
            className={`${inputBase} ${pincodeLoading ? inputReadOnly : err("state") ? inputError : inputNormal}`}
          />
          <p className="mt-1.5 min-h-5 text-xs text-(--color-red)">{err("state")}</p>
        </div>
      </div>

      {/* Receive outside applications */}
      <div className="mb-2">
        <p className="mb-3 text-[0.9375rem] font-medium text-(--color-black-shade-900)">
          Receive candidate applications from anywhere in India, if they are
          willing to relocate for this job? <span className="text-red-500">*</span>
        </p>
        <div className="flex gap-2">
          <SelectPill
            label="Yes"
            isSelected={form.receiveOutsideApplications === true}
            onSelect={() => set("receiveOutsideApplications")(true)}
          />
          <SelectPill
            label="No"
            isSelected={form.receiveOutsideApplications === false}
            onSelect={() => set("receiveOutsideApplications")(false)}
          />
        </div>
      </div>

      <SectionDivider />

      {/* ── Compensation ─────────────────────────────────────────────────── */}
      <SectionHeader
        title="Compensation"
        subtitle="Job posting with right salary & incentive will help you find the right candidates"
      />

      {/* Pay Type */}
      <div className="mb-6">
        <Label required className="mb-4!">What is the pay type?</Label>
        <div className="flex flex-wrap gap-2">
          {PAY_TYPE_OPTIONS.map((opt) => (
            <SelectPill
              key={opt}
              label={opt}
              isSelected={form.payType === opt}
              onSelect={() => set("payType")(opt)}
            />
          ))}
        </div>
      </div>

      {/* Annual CTC label */}
      <div className="mb-6">
        <p className="text-[0.9375rem] font-medium text-(--color-black-shade-900)">
          Annual CTC
        </p>
        <Text className="mt-0.5 text-sm font-medium">
          Job post with clear salary will be shown at top by our algorithm
        </Text>
      </div>

      {/* Fixed Salary range */}
      <div className="mb-6">
        <Label required className="mb-4!">Fixed Salary</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                min="0"
                value={form.fixedSalaryMin}
                onChange={handle("fixedSalaryMin")}
                onBlur={touch("fixedSalaryMin")}
                placeholder="Minimum Salary"
                className={`h-12 w-full rounded-xl border pl-4 pr-24 text-sm font-medium text-(--color-black-shade-900) outline-none transition-colors placeholder:text-(--color-black-shade-400) ${err("fixedSalaryMin") ? "border-(--color-red) focus:border-(--color-red)" : "border-(--color-black-shade-300) focus:border-(--color-primary)"}`}
              />
              <span className="pointer-events-none absolute right-0 top-0 flex h-full items-center border-l border-(--color-black-shade-200) px-3 text-xs font-medium text-(--color-black-shade-700)">
                annually
              </span>
            </div>
            <p className="mt-1.5 min-h-5 text-xs text-(--color-red)">
              {err("fixedSalaryMin")}
            </p>
          </div>
          <span className="hidden shrink-0 pt-3.5 text-sm font-medium text-(--color-black-shade-700) sm:block">
            to
          </span>
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                min="0"
                value={form.fixedSalaryMax}
                onChange={handle("fixedSalaryMax")}
                onBlur={touch("fixedSalaryMax")}
                placeholder="Maximum Salary"
                className={`h-12 w-full rounded-xl border pl-4 pr-24 text-sm font-medium text-(--color-black-shade-900) outline-none transition-colors placeholder:text-(--color-black-shade-400) ${err("fixedSalaryMax") ? "border-(--color-red) focus:border-(--color-red)" : "border-(--color-black-shade-300) focus:border-(--color-primary)"}`}
              />
              <span className="pointer-events-none absolute right-0 top-0 flex h-full items-center border-l border-(--color-black-shade-200) px-3 text-xs font-medium text-(--color-black-shade-700)">
                annually
              </span>
            </div>
            <p className="mt-1.5 min-h-5 text-xs text-(--color-red)">
              {err("fixedSalaryMax")}
            </p>
          </div>
        </div>
      </div>

      {/* Variable Salary (only if Fixed + Variable) */}
      {form.payType === "Fixed + Variable" && (
        <div className="mb-6">
          <Label required className="mb-4!">Variable Salary</Label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={form.variableSalary}
              onChange={handle("variableSalary")}
              onBlur={touch("variableSalary")}
              placeholder="Include bonus and incentives"
              className={`h-12 w-full rounded-xl border pl-4 pr-28 text-sm font-medium text-(--color-black-shade-900) outline-none transition-colors placeholder:text-(--color-black-shade-400) ${err("variableSalary") ? "border-(--color-red) focus:border-(--color-red)" : "border-(--color-black-shade-300) focus:border-(--color-primary)"}`}
            />
            <span className="pointer-events-none absolute right-0 top-0 flex h-full items-center border-l border-(--color-black-shade-200) px-3 text-xs font-medium text-(--color-black-shade-700)">
              per annum
            </span>
          </div>
          {err("variableSalary") && (
            <p className="mt-1.5 text-xs text-(--color-red)">{err("variableSalary")}</p>
          )}
        </div>
      )}

      {/* Additional Perks */}
      <div className="mb-6">
        <Label className="mb-4!">Do you offer any additional perks?</Label>
        {form.perks.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {form.perks.map((perk) => (
              <div
                key={perk}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-(--color-primary-shade-100) px-3 py-1.5 text-xs font-medium"
              >
                {perk}
                <button
                  type="button"
                  onClick={() => set("perks")(form.perks.filter((p) => p !== perk))}
                >
                  <Icon name="statics/login/cross-icon.svg" width={9} height={9} alt="Remove" />
                </button>
              </div>
            ))}
          </div>
        )}
        <CreatableSelect
          placeholder="Search or add perks..."
          options={filterSelectedOptions(PERKS_OPTIONS, form.perks)}
          allowCreate={false}
          value=""
          onChange={(value) => {
            if (!value || form.perks.includes(value)) return;
            set("perks")([...form.perks, value]);
          }}
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

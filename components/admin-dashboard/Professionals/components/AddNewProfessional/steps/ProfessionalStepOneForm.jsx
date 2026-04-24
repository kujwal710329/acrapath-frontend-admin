"use client";

import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import CreatableSelect from "@/components/common/CreatableSelect";
import CountryCodeSelect from "@/components/common/CountryCodeSelect";
import { Country, State, City } from "country-state-city";
import { getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";

const inputBase =
  "h-14 w-full rounded-xl border px-5 text-[0.9375rem] font-medium outline-none transition-colors placeholder:text-(--color-black-shade-400)";
const inputNormal =
  "border-(--color-black-shade-300) text-(--color-black-shade-900) focus:border-(--color-primary)";
const inputError =
  "border-(--color-red) text-(--color-black-shade-900) focus:border-(--color-red)";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

function FieldError({ msg }) {
  return msg ? <p className="mt-1.5 text-xs text-(--color-red)">{msg}</p> : null;
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-(--color-black-shade-900)">{title}</h2>
      {subtitle && (
        <p className="mt-0.5 text-sm font-medium text-(--color-black-shade-500)">{subtitle}</p>
      )}
    </div>
  );
}

function SectionDivider() {
  return <div className="my-8 border-t border-(--color-black-shade-200)" />;
}

export default function ProfessionalStepOneForm({ defaultValues = {}, onBack, onNext }) {
  const [form, setForm] = useState({
    firstName: defaultValues.firstName || "",
    middleName: defaultValues.middleName || "",
    lastName: defaultValues.lastName || "",
    email: defaultValues.email || "",
    contactNo: defaultValues.contactNo || "",
    countryIso: defaultValues.countryIso || "IN",
    dateOfBirth: defaultValues.dateOfBirth || "",
    gender: defaultValues.gender || "",
    city: defaultValues.city || "",
    linkedin: defaultValues.linkedin || "",
    github: defaultValues.github || "",
    website: defaultValues.website || "",
  });

  const [selectedCountry, setSelectedCountry] = useState(defaultValues.selectedCountry || "");
  const [selectedState, setSelectedState] = useState(defaultValues.selectedState || "");
  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setCountriesList(Country.getAllCountries().map((c) => c.name));
  }, []);

  // Restore cascade from defaultValues on mount
  useEffect(() => {
    if (!defaultValues.selectedCountry) return;
    const country = Country.getAllCountries().find((c) => c.name === defaultValues.selectedCountry);
    if (!country) return;
    setStatesList(State.getStatesOfCountry(country.isoCode).map((s) => s.name));
    if (!defaultValues.selectedState) return;
    const state = State.getStatesOfCountry(country.isoCode).find((s) => s.name === defaultValues.selectedState);
    if (state) setCitiesList(City.getCitiesOfState(country.isoCode, state.isoCode).map((c) => c.name));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) clearErr(field);
  };

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const setErr = (field, msg) => setErrors((prev) => ({ ...prev, [field]: msg }));
  const clearErr = (field) => setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const isValidPhone = (value) => {
    if (!value || !form.countryIso) return false;
    try {
      const full = `+${getCountryCallingCode(form.countryIso)}${value}`;
      return isValidPhoneNumber(full);
    } catch {
      return /^\d{7,15}$/.test(value);
    }
  };

  const handleCountryChange = (countryName) => {
    setSelectedCountry(countryName);
    setSelectedState("");
    set("city", "");
    clearErr("country");
    clearErr("state");
    clearErr("city");
    const country = Country.getAllCountries().find((c) => c.name === countryName);
    setStatesList(country ? State.getStatesOfCountry(country.isoCode).map((s) => s.name) : []);
    setCitiesList([]);
    // Sync phone country code to selected country
    if (country) {
      set("countryIso", country.isoCode);
    }
  };

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    set("city", "");
    clearErr("state");
    clearErr("city");
    const country = Country.getAllCountries().find((c) => c.name === selectedCountry);
    const state = country ? State.getStatesOfCountry(country.isoCode).find((s) => s.name === stateName) : null;
    setCitiesList(state && country ? City.getCitiesOfState(country.isoCode, state.isoCode).map((c) => c.name) : []);
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.contactNo.trim() && !isValidPhone(form.contactNo)) errs.contactNo = "Enter a valid phone number for the selected country.";
    if (!selectedCountry) errs.country = "Country is required.";
    if (!selectedState) errs.state = "State is required.";
    if (!form.city.trim()) errs.city = "City is required.";
    if (form.linkedin.trim() && !/linkedin\.com/i.test(form.linkedin)) errs.linkedin = "Must be a LinkedIn URL.";
    if (form.github.trim() && !/github\.com/i.test(form.github)) errs.github = "Must be a GitHub URL.";
    return errs;
  };

  const handleNext = () => {
    setTouched({ firstName: true, lastName: true, email: true, contactNo: true, country: true, state: true, city: true, linkedin: true, github: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    let dialCode = "91";
    try { dialCode = getCountryCallingCode(form.countryIso); } catch { /* default 91 */ }

    onNext({
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || undefined,
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      // Persist cascade state for back navigation
      selectedCountry,
      selectedState,
      countryIso: form.countryIso,
      contactNo: form.contactNo,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      city: form.city,
      linkedin: form.linkedin,
      github: form.github,
      website: form.website,
      personalInfo: {
        fullName: [form.firstName.trim(), form.middleName.trim(), form.lastName.trim()].filter(Boolean).join(" "),
        contactNo: form.contactNo.trim(),
        countryCode: dialCode,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        currentCity: form.city.trim(),
        address: {
          city: form.city.trim(),
          state: selectedState || undefined,
          country: selectedCountry || undefined,
        },
        linkedin: form.linkedin.trim() || undefined,
        github: form.github.trim() || undefined,
        website: form.website.trim() || undefined,
      },
    });
  };

  return (
    <div className="max-w-2xl py-6">
      <SectionHeader title="Personal Information" subtitle="Basic details about the professional." />

      {/* Name row */}
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
        <div className="mb-4">
          <Label htmlFor="firstName" required>First Name</Label>
          <input
            id="firstName"
            value={form.firstName}
            placeholder="John"
            onChange={(e) => set("firstName", e.target.value)}
            onBlur={() => { touch("firstName"); if (!form.firstName.trim()) setErr("firstName", "First name is required."); }}
            className={`${inputBase} ${touched.firstName && errors.firstName ? inputError : inputNormal}`}
          />
          {touched.firstName && <FieldError msg={errors.firstName} />}
        </div>
        <div className="mb-4">
          <Label htmlFor="middleName">Middle Name</Label>
          <input
            id="middleName"
            value={form.middleName}
            placeholder="(optional)"
            onChange={(e) => set("middleName", e.target.value)}
            className={`${inputBase} ${inputNormal}`}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="lastName" required>Last Name</Label>
          <input
            id="lastName"
            value={form.lastName}
            placeholder="Doe"
            onChange={(e) => set("lastName", e.target.value)}
            onBlur={() => { touch("lastName"); if (!form.lastName.trim()) setErr("lastName", "Last name is required."); }}
            className={`${inputBase} ${touched.lastName && errors.lastName ? inputError : inputNormal}`}
          />
          {touched.lastName && <FieldError msg={errors.lastName} />}
        </div>
      </div>

      {/* Email */}
      <div className="mb-4">
        <Label htmlFor="email" required>Email Address</Label>
        <input
          id="email"
          type="email"
          value={form.email}
          placeholder="john@example.com"
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => {
            touch("email");
            if (!form.email.trim()) setErr("email", "Email is required.");
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) setErr("email", "Enter a valid email address.");
          }}
          className={`${inputBase} ${touched.email && errors.email ? inputError : inputNormal}`}
        />
        {touched.email && <FieldError msg={errors.email} />}
      </div>

      {/* Phone */}
      <div className="mb-4">
        <Label>Contact Number</Label>
        <div className="flex gap-2">
          <CountryCodeSelect
            value={form.countryIso}
            onChange={(iso) => set("countryIso", iso)}
            valueType="iso"
            height="h-14"
          />
          <input
            type="tel"
            value={form.contactNo}
            placeholder="9876543210"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              if (digits.length > 15) return;
              set("contactNo", digits);
            }}
            onBlur={() => {
              touch("contactNo");
              if (form.contactNo.trim() && !isValidPhone(form.contactNo)) setErr("contactNo", "Enter a valid phone number for the selected country.");
            }}
            className={`${inputBase} flex-1 ${touched.contactNo && errors.contactNo ? inputError : inputNormal}`}
          />
        </div>
        {touched.contactNo && <FieldError msg={errors.contactNo} />}
      </div>

      {/* DOB + Gender */}
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div className="mb-4">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <input
            id="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => set("dateOfBirth", e.target.value)}
            className={`${inputBase} ${inputNormal}`}
          />
        </div>
        <div className="mb-4">
          <Label>Gender</Label>
          <CreatableSelect
            placeholder="Select gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            allowCreate={false}
            showAllOnOpen
            onChange={(v) => set("gender", v)}
          />
        </div>
      </div>

      <SectionDivider />

      <SectionHeader title="Location" subtitle="Where is the professional currently based?" />

      {/* Country */}
      <div className="mb-4">
        <Label required>Country</Label>
        <CreatableSelect
          placeholder="Select country"
          options={countriesList}
          value={selectedCountry}
          allowCreate={false}
          error={touched.country && errors.country}
          onChange={(v) => { handleCountryChange(v); touch("country"); }}
          onBlur={(didSelect) => {
            touch("country");
            if (!didSelect && !selectedCountry) setErr("country", "Country is required.");
            else clearErr("country");
          }}
        />
      </div>

      {/* State */}
      <div className="mb-4">
        <Label required>State</Label>
        <CreatableSelect
          placeholder="Select state"
          options={statesList}
          value={selectedState}
          allowCreate={false}
          isDisabled={!selectedCountry}
          error={touched.state && errors.state}
          onChange={(v) => { handleStateChange(v); touch("state"); }}
          onBlur={(didSelect) => {
            touch("state");
            if (!didSelect && !selectedState) setErr("state", "State is required.");
            else clearErr("state");
          }}
        />
      </div>

      {/* City */}
      <div className="mb-4">
        <Label required>Current City</Label>
        <CreatableSelect
          placeholder="Select city"
          options={citiesList}
          value={form.city}
          allowCreate={true}
          isDisabled={!selectedState}
          error={touched.city && errors.city}
          onChange={(v) => { set("city", v); clearErr("city"); }}
          onBlur={(didSelect) => {
            touch("city");
            if (!didSelect && !form.city) setErr("city", "City is required.");
            else clearErr("city");
          }}
        />
      </div>

      <SectionDivider />

      <SectionHeader title="Online Presence" subtitle="Optional links to professional profiles." />

      <div className="mb-4">
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <input
          id="linkedin"
          value={form.linkedin}
          placeholder="https://linkedin.com/in/johndoe"
          onChange={(e) => set("linkedin", e.target.value)}
          onBlur={() => {
            touch("linkedin");
            if (form.linkedin.trim() && !/linkedin\.com/i.test(form.linkedin)) setErr("linkedin", "Must be a LinkedIn URL.");
            else clearErr("linkedin");
          }}
          className={`${inputBase} ${touched.linkedin && errors.linkedin ? inputError : inputNormal}`}
        />
        {touched.linkedin && <FieldError msg={errors.linkedin} />}
      </div>

      <div className="mb-4">
        <Label htmlFor="github">GitHub URL</Label>
        <input
          id="github"
          value={form.github}
          placeholder="https://github.com/johndoe"
          onChange={(e) => set("github", e.target.value)}
          onBlur={() => {
            touch("github");
            if (form.github.trim() && !/github\.com/i.test(form.github)) setErr("github", "Must be a GitHub URL.");
            else clearErr("github");
          }}
          className={`${inputBase} ${touched.github && errors.github ? inputError : inputNormal}`}
        />
        {touched.github && <FieldError msg={errors.github} />}
      </div>

      <div className="mb-4">
        <Label htmlFor="website">Portfolio / Website</Label>
        <input
          id="website"
          value={form.website}
          placeholder="https://johndoe.com"
          onChange={(e) => set("website", e.target.value)}
          className={`${inputBase} ${inputNormal}`}
        />
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-auto! min-w-32! px-6!">Cancel</Button>
        <Button onClick={handleNext} className="min-w-40!">Continue</Button>
      </div>
    </div>
  );
}

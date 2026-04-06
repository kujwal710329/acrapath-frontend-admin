"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/utilities/api";
import Button from "@/components/common/Button";
import Icon from "@/components/common/Icon";
import FixedBackButton from "@/components/common/FixedBackButton";
/* ─── Helpers ─────────────────────────────────────────────────────── */

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatSalary(amount, period) {
  if (!amount) return null;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} LPA`;
  return `₹${amount.toLocaleString("en-IN")} ${period ?? ""}`.trim();
}

function formatStipend(amount, period) {
  if (!amount) return null;
  return `₹${amount.toLocaleString("en-IN")} ${period ?? ""}`.trim();
}

/* ─── Reusable Sub-components ─────────────────────────────────────── */

function SidebarCard({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-14 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
        {title}
      </p>
      <div className="relative rounded-xl border border-(--color-black-shade-200) overflow-hidden">
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function TimelineSection({ title, isOpen, onToggle, hasContent, children }) {
  return (
    <div className="rounded-xl p-5 md:p-6 border border-(--color-black-shade-200)">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between lg:pointer-events-none"
        aria-expanded={isOpen}
      >
        <h2
          className="text-18 md:text-20 font-bold"
          style={{ color: "var(--color-black-shade-900)" }}
        >
          {title}
        </h2>
        <svg
          className={`w-5 h-5 shrink-0 transition-transform duration-200 lg:hidden ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: "var(--color-black-shade-500)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`mt-4 ${isOpen ? "block" : "hidden"} lg:block`}>
        {hasContent ? children : (
          <p className="text-14" style={{ color: "var(--color-black-shade-400)" }}>
            No data added yet.
          </p>
        )}
      </div>
    </div>
  );
}

function TimelineDot() {
  return (
    <div
      className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full z-10 shrink-0 bg-(--color-primary) border-2 border-white ring-2 ring-(--color-primary-shade-300)"
    />
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="container-80 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8 animate-pulse">
      <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-5">
        <div className="flex justify-center lg:block">
          <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-full lg:aspect-square rounded-full lg:rounded-xl bg-(--color-black-shade-100)" />
        </div>
        <div className="h-10 rounded-xl bg-(--color-black-shade-100)" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-(--color-black-shade-100)" />
        ))}
      </aside>
      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="h-32 rounded-xl bg-(--color-black-shade-100)" />
        <div className="h-px bg-(--color-black-shade-100)" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-(--color-black-shade-100)" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-(--color-black-shade-100)" />
        ))}
      </main>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function AdminProfessionalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    workExperience: true,
    internship: true,
    projects: true,
    education: true,
    achievements: true,
  });

  const toggle = (section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const res = await apiRequest(`/users/${id}/details`);
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <PageSkeleton />;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
          User not found
        </h2>
        <p className="mt-2" style={{ color: "var(--color-black-shade-600)" }}>
          This profile may not exist or the ID is invalid.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 rounded-lg hover:opacity-90 transition cursor-pointer text-white"
          style={{ background: "var(--color-primary)" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  /* ── Derived data from API ───────────────────────────────────────── */
  const displayName = user.fullName || user.name || "";
const roleLabel = user.currentDesignation || user.designation || user.role || "";
  const company = (user.company && user.company !== "N/A") ? user.company : "";
  const experience = user.yearsOfExperience || "";
  const skills = (user.skills ?? []).map((s) => s.name);
  const about = user.profileSummary || "";
  const workExperience = user.workExperience ?? [];
  const internshipExperience = user.internshipExperience ?? [];
  const projects = user.projects ?? [];
  const educationDetails = (user.educationDetails ?? []).filter(
    (e) => e.collegeName || e.degreeLevel
  );
  const achievements = user.achievements ?? [];
  const documentUrls = user.documentUrls ?? {};
  const jobPreferences = user.jobPreferences ?? {};

  /* Contact details built from API */
  const contactItems = [
    user.email && {
      label: "Email",
      icon: "statics/user-profile/email.svg",
      href: `mailto:${user.email}`,
      value: user.email,
    },
    user.contactNo && {
      label: "Contact Number",
      icon: "statics/user-profile/phone.svg",
      href: `tel:+${user.countryCode}${user.contactNo}`,
      value: `${user.countryCode} ${user.contactNo}`,
    },
    user.whatsappNo && {
      label: "WhatsApp",
      icon: "statics/user-profile/whatsapp.svg",
      href: `https://wa.me/${user.countryCode}${user.whatsappNo}`,
      value: user.whatsappNo,
    },
    user.linkedin && {
      label: "LinkedIn",
      icon: "statics/user-profile/LinkedIn.svg",
      href: user.linkedin,
      value: user.linkedin,
    },
  ].filter(Boolean);

  /* Experience Letters */
  const expLetters = workExperience.map((exp) => ({ company: exp.companyName }));

  /* 3 Summary Cards */
  const workExpItems = workExperience.slice(0, 3).map((exp) => ({
    label: exp.companyName,
    value: exp.currentlyWorking
      ? `Present · Joined ${formatDate(exp.joiningDate) ?? ""}`
      : `${formatDate(exp.joiningDate) ?? ""} to ${formatDate(exp.relievingDate) ?? ""}`,
  }));

  const preferredLocItems = (jobPreferences.preferredLocations ?? [])
    .slice(0, 3)
    .map((loc, i) => ({
      label: `${["1st", "2nd", "3rd"][i] ?? `${i + 1}th`} Preference`,
      value: loc,
    }));

  const topSkillItems = skills.slice(0, 3).map((s, i) => ({
    label: `Skill ${i + 1}`,
    value: s,
  }));

  const profileCards = [
    {
      title: "Experience (Full-time)",
      iconSrc: "statics/user-profile/brifcase.svg",
      items: workExpItems.length > 0
        ? workExpItems
        : [{ label: "—", value: "No experience added" }],
    },
    {
      title: "Preferred Location",
      iconSrc: "statics/user-profile/location.svg",
      items: preferredLocItems.length > 0
        ? preferredLocItems
        : [{ label: "—", value: "No preference added" }],
    },
    {
      title: "Top 3 Featured Skills",
      iconSrc: "statics/user-profile/skills.svg",
      items: topSkillItems.length > 0
        ? topSkillItems
        : [{ label: "—", value: "No skills added" }],
    },
  ];

  /* Profile image — use presigned URL from documentUrls first, fallback to raw key */
  const profileImage =
    documentUrls.profilePhoto?.s3PresignedUrl ||
    documentUrls.professionalPhoto?.s3PresignedUrl ||
    null;

  return (
    <>
      <FixedBackButton variant="admin" />

      {/* ── Page Layout ───────────────────────────────────────────── */}
      <div className="container-80 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ═══ LEFT SIDEBAR ══════════════════════════════════════════ */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-5">

            {/* Profile Image + Hire Button */}
            <div className="flex flex-col gap-3">
              <div className="w-full overflow-hidden rounded-2xl border border-(--color-black-shade-200)">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-full aspect-4/3 lg:aspect-square object-cover object-top"
                  />
                ) : (
                  <div
                    className="w-full aspect-4/3 lg:aspect-square flex items-center justify-center text-5xl font-bold text-white"
                    style={{ background: "var(--color-primary)" }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <Button className="w-full!">
                Hire {displayName}
              </Button>
            </div>

            {/* Mobile-only: Profile details shown right after image+button */}
            <div className="lg:hidden flex flex-col gap-4">
              {/* Name + Status Badges */}
              <div>
                <h1
                  className="text-24 font-bold leading-tight"
                  style={{ color: "var(--color-black-shade-900)" }}
                >
                  {displayName}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {user.profileVerificationStatus && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
                      user.profileVerificationStatus === "verified"
                        ? "bg-green-100 text-green-700"
                        : user.profileVerificationStatus === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : user.profileVerificationStatus === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.profileVerificationStatus === "verified" && (
                        <Icon name="static/Icons/Verified.png" width={13} height={13} alt="verified" />
                      )}
                      {user.profileVerificationStatus === "verified"
                        ? "Profile Verified"
                        : user.profileVerificationStatus === "pending"
                        ? "Verification Pending"
                        : user.profileVerificationStatus}
                    </span>
                  )}
                  {user.accountStatus && (
                    <span className={`px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
                      user.accountStatus === "active"
                        ? "bg-green-100 text-green-700"
                        : user.accountStatus === "inactive" || user.accountStatus === "suspended"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.accountStatus}
                    </span>
                  )}
                  {user.workPreference?.status && (
                    <span className={`px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
                      user.workPreference.status === "actively-looking"
                        ? "bg-blue-100 text-blue-700"
                        : user.workPreference.status === "open"
                        ? "bg-purple-100 text-purple-700"
                        : user.workPreference.status === "not-looking"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.workPreference.status.replace(/-/g, " ")}
                    </span>
                  )}
                  {user.score != null && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-12 font-semibold bg-(--color-primary-shade-100)"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Score: {user.score}
                    </span>
                  )}
                </div>
              </div>

              {/* Role / Company / Experience */}
              <div className="flex flex-col gap-2.5">
                {roleLabel && (
                  <div className="flex items-center gap-2.5">
                    <Icon name="statics/user-profile/developer.svg" width={16} height={16} />
                    <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                      {roleLabel}
                    </span>
                  </div>
                )}
                {company && (
                  <div className="flex items-center gap-2.5">
                    <Icon name="statics/user-profile/compnay.svg" width={16} height={16} />
                    <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                      {company}
                    </span>
                  </div>
                )}
                {experience && (
                  <div className="flex items-center gap-2.5">
                    <Icon name="statics/user-profile/brifcase.svg" width={16} height={16} />
                    <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                      {experience}
                    </span>
                  </div>
                )}
                {user.currentLocation && (
                  <div className="flex items-center gap-2.5">
                    <Icon name="statics/user-profile/location.svg" width={16} height={16} />
                    <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                      {user.currentLocation}
                    </span>
                  </div>
                )}
                {jobPreferences.preferredJobTitle && (
                  <div className="flex items-center gap-2.5">
                    <Icon name="statics/user-profile/developer.svg" width={16} height={16} />
                    <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                      Open to: {jobPreferences.preferredJobTitle}
                    </span>
                  </div>
                )}
              </div>

              {/* Expertise */}
              {skills.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
                    Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className={`rounded-full px-4 py-1.5 text-12 font-medium bg-(--color-primary-shade-100) ${
                          i === 0
                            ? "flex items-center gap-1 text-(--color-black-shade-900)"
                            : "text-(--color-black-shade-800)"
                        }`}
                      >
                        {i === 0 && (
                          <Icon name="statics/Employee-Dashboard/Star.svg" width={12} height={12} />
                        )}
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Summary */}
              {about && (
                <div className="flex flex-col gap-2">
                  <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
                    Profile Summary
                  </h2>
                  <p className="text-14 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>
                    {about}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {contactItems.length > 0 && (
              <SidebarCard title="Contact Information">
                <div className="space-y-3">
                  {contactItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Icon name={item.icon} width={16} height={16} alt={item.label} />
                      <div className="min-w-0">
                        <p
                          className="text-12 font-semibold"
                          style={{ color: "var(--color-black-shade-700)" }}
                        >
                          {item.label}
                        </p>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-12 hover:underline"
                          style={{ color: "var(--color-primary)" }}
                        >
                          {item.label === "Email"
                            ? item.value
                            : item.label === "Contact Number"
                            ? item.value
                            : item.label === "WhatsApp"
                            ? "Chat on WhatsApp"
                            : item.label === "LinkedIn"
                            ? "View LinkedIn Profile"
                            : `View ${item.label}`}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </SidebarCard>
            )}

            {/* Resume */}
            <SidebarCard title="Resume">
              <div className="flex items-start gap-3">
                <Icon name="statics/user-profile/user.svg" width={20} height={20} alt="resume" />
                <div>
                  <p className="text-14 font-semibold" style={{ color: "var(--color-black-shade-700)" }}>
                    Resume
                  </p>
                  {documentUrls.resumeCV?.s3PresignedUrl ? (
                    <a
                      href={documentUrls.resumeCV.s3PresignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-12 mt-1.5 inline-block hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      View Resume
                    </a>
                  ) : (
                    <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-400)" }}>
                      Not uploaded
                    </p>
                  )}
                </div>
              </div>
            </SidebarCard>

            {/* Identity Proof */}
            <SidebarCard title="Identity Proof">
              <div className="flex items-start gap-3">
                <Icon name="statics/user-profile/user.svg" width={20} height={20} alt="identity" />
                <div>
                  <p className="text-14 font-semibold" style={{ color: "var(--color-black-shade-700)" }}>
                    {user.identityProofType || "Identity Proof"}
                  </p>
                  {documentUrls.identityProof?.s3PresignedUrl ? (
                    <a
                      href={documentUrls.identityProof.s3PresignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-12 mt-1.5 inline-block hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      View Identity Proof
                    </a>
                  ) : (
                    <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-400)" }}>
                      Not uploaded
                    </p>
                  )}
                </div>
              </div>
            </SidebarCard>

            {/* Current Company Salary Proof */}
            <SidebarCard title="Current Company Salary Proof">
              <div className="flex items-start gap-3">
                <Icon name="statics/user-profile/compnay.svg" width={20} height={20} alt="company" />
                <div>
                  <p className="text-12 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                    {company || "—"}
                  </p>
                  {documentUrls.salaryProof?.s3PresignedUrl ? (
                    <a
                      href={documentUrls.salaryProof.s3PresignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-12 mt-1.5 inline-block hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      View Offer Letter / Payslip
                    </a>
                  ) : (
                    <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-400)" }}>
                      Not uploaded
                    </p>
                  )}
                </div>
              </div>
            </SidebarCard>

            {/* Experience Letter */}
            {expLetters.length > 0 && (
              <SidebarCard title="Experience Letter">
                <div className="space-y-4">
                  {expLetters.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Icon name="statics/user-profile/compnay.svg" width={20} height={20} alt="company" />
                      <div>
                        <p className="text-12 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                          {item.company}
                        </p>
                        {(user.experienceLetters ?? [])[i]?.url ? (
                          <a
                            href={user.experienceLetters[i].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-12 mt-1.5 inline-block hover:underline"
                            style={{ color: "var(--color-primary)" }}
                          >
                            View Experience Letter
                          </a>
                        ) : (
                          <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-400)" }}>
                            Not uploaded
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SidebarCard>
            )}

          </div>
        </aside>

        {/* ═══ RIGHT CONTENT ═════════════════════════════════════════ */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">

          {/* ── Profile Header — desktop only (mobile shown in aside) ── */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* Name + Status Badges */}
            <div>
              <h1
                className="text-24 font-bold leading-tight"
                style={{ color: "var(--color-black-shade-900)" }}
              >
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {/* Profile Verification Status */}
                {user.profileVerificationStatus && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
                    user.profileVerificationStatus === "verified"
                      ? "bg-green-100 text-green-700"
                      : user.profileVerificationStatus === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : user.profileVerificationStatus === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.profileVerificationStatus === "verified" && (
                      <Icon name="static/Icons/Verified.png" width={13} height={13} alt="verified" />
                    )}
                    {user.profileVerificationStatus === "verified"
                      ? "Profile Verified"
                      : user.profileVerificationStatus === "pending"
                      ? "Verification Pending"
                      : user.profileVerificationStatus}
                  </span>
                )}

                {/* Account Status */}
                {user.accountStatus && (
                  <span className={`px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
                    user.accountStatus === "active"
                      ? "bg-green-100 text-green-700"
                      : user.accountStatus === "inactive" || user.accountStatus === "suspended"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.accountStatus}
                  </span>
                )}

                {/* Work Preference */}
                {user.workPreference?.status && (
                  <span className={`px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
                    user.workPreference.status === "actively-looking"
                      ? "bg-blue-100 text-blue-700"
                      : user.workPreference.status === "open"
                      ? "bg-purple-100 text-purple-700"
                      : user.workPreference.status === "not-looking"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.workPreference.status.replace(/-/g, " ")}
                  </span>
                )}

                {/* Score */}
                {user.score != null && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-12 font-semibold bg-(--color-primary-shade-100)"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Score: {user.score}
                  </span>
                )}
              </div>
            </div>

            {/* Role / Company / Experience */}
            <div className="flex flex-col gap-2.5">
              {roleLabel && (
                <div className="flex items-center gap-2.5">
                  <Icon name="statics/user-profile/developer.svg" width={16} height={16} />
                  <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                    {roleLabel}
                  </span>
                </div>
              )}
              {company && (
                <div className="flex items-center gap-2.5">
                  <Icon name="statics/user-profile/compnay.svg" width={16} height={16} />
                  <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                    {company}
                  </span>
                </div>
              )}
              {experience && (
                <div className="flex items-center gap-2.5">
                  <Icon name="statics/user-profile/brifcase.svg" width={16} height={16} />
                  <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                    {experience}
                  </span>
                </div>
              )}
              {user.currentLocation && (
                <div className="flex items-center gap-2.5">
                  <Icon name="statics/user-profile/location.svg" width={16} height={16} />
                  <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                    {user.currentLocation}
                  </span>
                </div>
              )}
              {jobPreferences.preferredJobTitle && (
                <div className="flex items-center gap-2.5">
                  <Icon name="statics/user-profile/developer.svg" width={16} height={16} />
                  <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
                    Open to: {jobPreferences.preferredJobTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Expertise / Skills */}
            {skills.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
                    Expertise
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className={`rounded-full px-4 py-1.5 text-12 font-medium bg-(--color-primary-shade-100) ${
                        i === 0
                          ? "flex items-center gap-1 text-(--color-black-shade-900)"
                          : "text-(--color-black-shade-800)"
                      }`}
                    >
                      {i === 0 && (
                        <Icon name="statics/Employee-Dashboard/Star.svg" width={12} height={12} />
                      )}
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Summary */}
            {about && (
              <div className="flex flex-col gap-2">
                <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
                  Profile Summary
                </h2>
                <p className="text-14 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>
                  {about}
                </p>
              </div>
            )}
          </div>

          <hr className="border-(--color-black-shade-100)" />

          {/* ── 3 Summary Cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profileCards.map((card, i) => (
              <div
                key={i}
                className="relative rounded-xl border border-(--color-black-shade-200) overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="text-14 font-semibold mb-4" style={{ color: "var(--color-black)" }}>
                    {card.title}
                  </h3>
                  <div className="space-y-3">
                    {card.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <Icon name={card.iconSrc} width={16} height={16} />
                        <div>
                          <p className="text-12 font-semibold leading-snug" style={{ color: "var(--color-black-shade-700)" }}>
                            {item.label}
                          </p>
                          <p className="text-12 leading-snug" style={{ color: "var(--color-black-shade-500)" }}>
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Work Experience ─────────────────────────────────────── */}
          <TimelineSection
            title="Work Experience"
            isOpen={openSections.workExperience}
            onToggle={() => toggle("workExperience")}
            hasContent={workExperience.length > 0}
          >
            <div className="relative">
              <div
                className="absolute left-1.5 top-2 bottom-0 w-0.5"
                style={{ background: "var(--color-primary-shade-200)" }}
              />
              <div className="space-y-8">
                {workExperience.map((exp, i) => (
                  <div key={exp._id ?? i} className="relative pl-7">
                    <TimelineDot />
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 mb-1">
                      <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>
                        {exp.role}
                      </h3>
                      <span
                        className="text-12 shrink-0 uppercase tracking-wide sm:ml-4"
                        style={{ color: "var(--color-black-shade-500)" }}
                      >
                        {formatDate(exp.joiningDate)} – {exp.currentlyWorking ? "Present" : formatDate(exp.relievingDate)}
                      </span>
                    </div>
                    <p className="text-14 mb-3" style={{ color: "var(--color-black-shade-600)" }}>
                      {exp.companyName}
                    </p>
                    {formatSalary(exp.salary, exp.salaryPeriod) && (
                      <p className="text-13" style={{ color: "var(--color-black-shade-500)" }}>
                        Salary: {formatSalary(exp.salary, exp.salaryPeriod)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TimelineSection>

          {/* ── Internship Experience ────────────────────────────────── */}
          <TimelineSection
            title="Internship Experience"
            isOpen={openSections.internship}
            onToggle={() => toggle("internship")}
            hasContent={internshipExperience.length > 0}
          >
            <div className="relative">
              <div
                className="absolute left-1.5 top-2 bottom-0 w-0.5"
                style={{ background: "var(--color-primary-shade-200)" }}
              />
              <div className="space-y-8">
                {internshipExperience.map((exp, i) => (
                  <div key={exp._id ?? i} className="relative pl-7">
                    <TimelineDot />
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 mb-1">
                      <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>
                        {exp.role}
                      </h3>
                      <span
                        className="text-12 shrink-0 uppercase tracking-wide sm:ml-4"
                        style={{ color: "var(--color-black-shade-500)" }}
                      >
                        {formatDate(exp.joiningDate)} – {exp.currentlyWorking ? "Present" : formatDate(exp.relievingDate)}
                      </span>
                    </div>
                    <p className="text-14 mb-3" style={{ color: "var(--color-black-shade-600)" }}>
                      {exp.companyName}
                    </p>
                    {formatStipend(exp.stipend, exp.stipendPeriod) && (
                      <p className="text-13" style={{ color: "var(--color-black-shade-500)" }}>
                        Stipend: {formatStipend(exp.stipend, exp.stipendPeriod)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TimelineSection>

          {/* ── Projects ────────────────────────────────────────────── */}
          <TimelineSection
            title="Projects"
            isOpen={openSections.projects}
            onToggle={() => toggle("projects")}
            hasContent={projects.length > 0}
          >
            <div className="relative">
              <div
                className="absolute left-1.5 top-2 bottom-0 w-0.5"
                style={{ background: "var(--color-primary-shade-200)" }}
              />
              <div className="space-y-8">
                {projects.map((project, i) => (
                  <div key={project._id ?? i} className="relative pl-7">
                    <TimelineDot />
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>
                        {project.projectName}
                      </h3>
                      {project.projectLink && (
                        <a
                          href={project.projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-12 font-medium hover:underline"
                          style={{ color: "var(--color-primary)" }}
                        >
                          View Project
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-14 leading-relaxed mb-2" style={{ color: "var(--color-black-shade-600)" }}>
                        {project.description}
                      </p>
                    )}
                    {project.points?.length > 0 && (
                      <ul className="space-y-2">
                        {project.points.map((point, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                              style={{ background: "var(--color-black-shade-400)" }}
                            />
                            <p className="text-14 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>
                              {point}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TimelineSection>

          {/* ── Education ───────────────────────────────────────────── */}
          <TimelineSection
            title="Education"
            isOpen={openSections.education}
            onToggle={() => toggle("education")}
            hasContent={educationDetails.length > 0}
          >
            <div className="relative">
              <div
                className="absolute left-1.5 top-2 bottom-0 w-0.5"
                style={{ background: "var(--color-primary-shade-200)" }}
              />
              <div className="space-y-6">
                {educationDetails.map((edu, i) => (
                  <div key={edu._id ?? i} className="relative pl-7">
                    <TimelineDot />
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 mb-1">
                      <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>
                        {[edu.degreeLevel, edu.fieldOfStudy].filter(Boolean).join(" — ")}
                      </h3>
                      {edu.grade && (
                        <span
                          className="text-12 shrink-0 sm:ml-4"
                          style={{ color: "var(--color-black-shade-500)" }}
                        >
                          {edu.grade} {edu.gradeType}
                        </span>
                      )}
                    </div>
                    <p className="text-14" style={{ color: "var(--color-black-shade-600)" }}>
                      {edu.collegeName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TimelineSection>

          {/* ── Achievements ────────────────────────────────────────── */}
          <TimelineSection
            title="Achievements"
            isOpen={openSections.achievements}
            onToggle={() => toggle("achievements")}
            hasContent={achievements.length > 0}
          >
            <div className="relative">
              <div
                className="absolute left-1.5 top-0 bottom-0 w-0.5"
                style={{ background: "var(--color-primary-shade-200)" }}
              />
              <div className="space-y-4">
                {achievements.map((achievement, i) => (
                  <div key={i} className="relative pl-7">
                    <TimelineDot />
                    <p className="text-14" style={{ color: "var(--color-black-shade-700)" }}>
                      {achievement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TimelineSection>

        </main>
      </div>

    </>
  );
}

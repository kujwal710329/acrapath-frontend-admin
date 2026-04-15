"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/utilities/api";
import Button from "@/components/common/Button";
import Icon from "@/components/common/Icon";
import FixedBackButton from "@/components/common/FixedBackButton";
import Carousel from "@/components/common/Carousel";

/* ─── Helpers ─────────────────────────────────────────────────────── */

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatDuration(joiningDate, relievingDate, currentlyWorking) {
  const start = formatDate(joiningDate);
  const end = currentlyWorking ? "Present" : formatDate(relievingDate);
  if (!start && !end) return null;
  return [start, end].filter(Boolean).join(" to ");
}

function formatSalaryAmt(amount, period) {
  if (!amount) return null;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} LPA`;
  return `₹${amount.toLocaleString("en-IN")} ${period ?? ""}`.trim();
}

function formatStipend(amount, period) {
  if (!amount) return null;
  return `₹${amount.toLocaleString("en-IN")} ${period ?? ""}`.trim();
}

/* ─── Reusable Sub-components ─────────────────────────────────────── */

function MetaRow({ icon, text }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon} width={16} height={16} />
      <span className="text-14 font-medium" style={{ color: "var(--color-black-shade-700)" }}>
        {text}
      </span>
    </div>
  );
}

function ContactRow({ icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} width={16} height={16} alt={label} />
      <div className="min-w-0">
        <p className="text-12 font-semibold" style={{ color: "var(--color-black-shade-700)" }}>
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-12 break-all hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            {value}
          </a>
        ) : (
          <p className="text-12 break-all" style={{ color: "var(--color-black-shade-600)" }}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function SidebarCard({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-14 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
        {title}
      </p>
      <div className="relative rounded-xl border border-(--color-black-shade-200) overflow-hidden">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function StatusBadges({ user }) {
  const hasAny =
    user.profileVerificationStatus || user.accountStatus || user.workPreference?.status || user.score != null;
  if (!hasAny) return null;

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      {user.profileVerificationStatus && (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
            user.profileVerificationStatus === "verified"
              ? "bg-green-100 text-green-700"
              : user.profileVerificationStatus === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : user.profileVerificationStatus === "rejected"
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
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
        <span
          className={`px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
            user.accountStatus === "active"
              ? "bg-green-100 text-green-700"
              : user.accountStatus === "inactive" || user.accountStatus === "suspended"
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {user.accountStatus}
        </span>
      )}

      {user.workPreference?.status && (
        <span
          className={`px-2.5 py-0.5 rounded-full text-12 font-semibold capitalize ${
            user.workPreference.status === "actively-looking"
              ? "bg-blue-100 text-blue-700"
              : user.workPreference.status === "open"
              ? "bg-purple-100 text-purple-700"
              : user.workPreference.status === "not-looking"
              ? "bg-gray-100 text-gray-500"
              : "bg-gray-100 text-gray-600"
          }`}
        >
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

      <div className={`mt-6 ${isOpen ? "block" : "hidden"} lg:block`}>
        {hasContent ? (
          children
        ) : (
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
    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full z-10 shrink-0 bg-(--color-primary) border-2 border-white ring-2 ring-(--color-primary-shade-300)" />
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="container-80 py-8 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8 animate-pulse">
      <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-5">
        <div className="w-88 h-80 mx-auto lg:w-full lg:h-auto rounded-xl bg-(--color-black-shade-100) lg:aspect-square" />
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

/* ─── Work Experience Timeline ─────────────────────────────────────── */

function WorkExpTimeline({ entries, isInternship = false }) {
  if (!entries.length) return null;
  return (
    <div className="relative">
      <div
        className="absolute left-1.5 top-2 bottom-0 w-0.5"
        style={{ background: "var(--color-primary-shade-200)" }}
      />
      <div className="space-y-8">
        {entries.map((exp, i) => (
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
                {formatDuration(exp.joiningDate, exp.relievingDate, exp.currentlyWorking)}
              </span>
            </div>
            <p className="text-14 mb-1" style={{ color: "var(--color-black-shade-600)" }}>
              {exp.companyName}
            </p>
            {isInternship && formatStipend(exp.stipend, exp.stipendPeriod) && (
              <p className="text-12" style={{ color: "var(--color-black-shade-500)" }}>
                Stipend: {formatStipend(exp.stipend, exp.stipendPeriod)}
              </p>
            )}
            {!isInternship && formatSalaryAmt(exp.salary, exp.salaryPeriod) && (
              <p className="text-12" style={{ color: "var(--color-black-shade-500)" }}>
                Salary: {formatSalaryAmt(exp.salary, exp.salaryPeriod)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function AdminProfessionalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const [openSections, setOpenSections] = useState({
    hiringInfo: true,
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

  /* ── Derived data ───────────────────────────────────────────────── */
  const displayName = user.fullName || user.name || "";
  const roleLabel = user.currentDesignation || user.designation || "";
  const company = user.company && user.company !== "N/A" ? user.company : "";
  const experience = user.yearsOfExperience || "";
  const rawSkills = user.skills ?? [];
  const skills = rawSkills.map((s) => (typeof s === "string" ? s : s.name));
  const about = user.profileSummary || "";
  const workExperience = user.workExperience ?? [];
  const internshipExperience = user.internshipExperience ?? [];
  const projects = user.projects ?? [];
  const jobPreferences = user.jobPreferences ?? {};

  /* Open-to roles */
  const openToRoles = user.openToRoles?.length
    ? user.openToRoles
    : jobPreferences.preferredJobTitle
    ? Array.isArray(jobPreferences.preferredJobTitle)
      ? jobPreferences.preferredJobTitle
      : [jobPreferences.preferredJobTitle]
    : [];

  /* Education — filter & sort by degree rank */
  const DEGREE_RANK = { "Doctorate (PhD)": 0, "Master's": 1, "Bachelor's": 2, Diploma: 3 };
  const educationDetails = (user.educationDetails ?? [])
    .filter((e) => e.collegeName || e.degreeLevel)
    .slice()
    .sort((a, b) => (DEGREE_RANK[a.degreeLevel] ?? 99) - (DEGREE_RANK[b.degreeLevel] ?? 99));

  const achievements = (user.achievements ?? []).filter(Boolean);
  const documentUrls = user.documentUrls ?? {};

  /* Contact items */
  const contactItems = [
    user.contactNo && {
      label: "Contact Number",
      icon: "statics/user-profile/phone.svg",
      value: `${user.countryCode ?? ""} ${user.contactNo}`.trim(),
      href: `tel:+${user.countryCode ?? ""}${user.contactNo}`,
    },
    user.whatsappNo && {
      label: "WhatsApp Number",
      icon: "statics/user-profile/whatsapp.svg",
      value: user.whatsappNo,
      href: `https://wa.me/${user.countryCode ?? ""}${user.whatsappNo}`,
    },
    user.email && {
      label: "Email",
      icon: "statics/user-profile/email.svg",
      value: user.email,
      href: `mailto:${user.email}`,
    },
    user.linkedin && {
      label: "LinkedIn",
      icon: "statics/user-profile/LinkedIn.svg",
      value: user.linkedin,
      href: user.linkedin,
    },
  ].filter(Boolean);

  /* Experience letters */
  const expLetters =
    user.experienceLetters?.length
      ? user.experienceLetters
      : workExperience.map((e) => ({ company: e.companyName, url: null }));

  /* Profile photo */
  const profileImage =
    documentUrls.profilePhoto?.s3PresignedUrl ||
    documentUrls.professionalPhoto?.s3PresignedUrl ||
    null;

  /* Summary cards */
  const summaryCards = [
    {
      key: "experience",
      title: "Experience (Full-time)",
      iconSrc: "statics/user-profile/brifcase.svg",
      items:
        workExperience.length > 0
          ? workExperience.map((e) => ({
              label: e.companyName || "—",
              value:
                formatDuration(e.joiningDate, e.relievingDate, e.currentlyWorking) ||
                (e.currentlyWorking ? "Currently Working" : "—"),
            }))
          : [{ label: "—", value: "No experience added" }],
    },
    {
      key: "locations",
      title: "Preferred Location",
      iconSrc: "statics/user-profile/location.svg",
      items:
        (jobPreferences.preferredLocations ?? []).length > 0
          ? (jobPreferences.preferredLocations ?? []).map((loc, i) => ({
              label: `${["1st", "2nd", "3rd"][i] ?? `${i + 1}th`} Preference`,
              value: loc,
            }))
          : [{ label: "—", value: "No preference added" }],
    },
    {
      key: "topSkills",
      title: "Top 3 Featured Skills",
      iconSrc: "statics/user-profile/skills.svg",
      items:
        skills.slice(0, 3).length > 0
          ? skills.slice(0, 3).map((s, i) => ({ label: `Skill ${i + 1}`, value: s }))
          : [{ label: "—", value: "No skills added" }],
    },
  ];

  /* ── Skill pill renderer ─────────────────────────────────────────── */
  const visibleSkills = showAllSkills ? skills : skills.slice(0, 5);

  const SkillPills = ({ label }) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
          {label}
        </h2>
        {skills.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllSkills((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--color-black-shade-700)" }}
          >
            {showAllSkills ? "View Less" : "View All"}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showAllSkills ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {visibleSkills.map((skill, i) => (
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
  );

  /* ── Summary card renderer (shared by carousel + grid) ──────────── */
  const renderSummaryCard = (card) => (
    <div className="relative rounded-xl border border-(--color-black-shade-200) overflow-hidden h-full min-h-37.5">
      <div className="p-4">
        <h3 className="text-14 font-semibold mb-4" style={{ color: "var(--color-black)" }}>
          {card.title}
        </h3>
        <div className="space-y-3">
          {card.items.map((item, j) => (
            <div key={j} className="flex items-start gap-2.5">
              <Icon name={card.iconSrc} width={16} height={16} />
              <div>
                <p
                  className="text-12 font-semibold leading-snug"
                  style={{ color: "var(--color-black-shade-700)" }}
                >
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
  );

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      <FixedBackButton variant="admin" />

      <div className="container-80 py-6 flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ═══ LEFT SIDEBAR ══════════════════════════════════════════ */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-col gap-5">

            {/* Profile Photo */}
            <div className="w-88 h-80 mx-auto lg:w-full lg:h-auto overflow-hidden rounded-xl border border-(--color-black-shade-200)">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={displayName}
                  className="w-full aspect-square object-cover object-top"
                />
              ) : (
                <div
                  className="w-full aspect-square flex items-center justify-center text-5xl font-bold text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Hire Button */}
            <Button className="w-auto! min-w-88 mx-auto lg:w-full! lg:mx-0 lg:min-w-44">
              Hire {displayName}
            </Button>

            {/* ── Mobile-only: Profile Details ───────────────────── */}
            <div className="lg:hidden flex flex-col gap-4">
              <div>
                <h1
                  className="text-24 font-bold leading-tight"
                  style={{ color: "var(--color-black-shade-900)" }}
                >
                  {displayName}
                </h1>
                <StatusBadges user={user} />
              </div>

              {/* Role / Company / Experience — horizontal row on mobile */}
              <div className="flex flex-row flex-wrap gap-x-10 gap-y-1.5">
                <MetaRow icon="statics/user-profile/developer.svg" text={roleLabel} />
                <MetaRow icon="statics/user-profile/compnay.svg" text={company} />
                <MetaRow icon="statics/user-profile/brifcase.svg" text={experience} />
              </div>

              {/* Key Expertise */}
              {skills.length > 0 && <SkillPills label="Key Expertise" />}
            </div>

            {/* ── Hiring Information (collapsible) ────────────────── */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => toggle("hiringInfo")}
                className="w-full flex items-center justify-between cursor-pointer"
              >
                <p
                  className="text-14 font-semibold"
                  style={{ color: "var(--color-black-shade-800)" }}
                >
                  Hiring Information
                </p>
                <svg
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    openSections.hiringInfo ? "rotate-180" : ""
                  }`}
                  style={{ color: "var(--color-black-shade-500)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.hiringInfo && (
                <div className="flex flex-col gap-4">

                  {/* Contact Information */}
                  {contactItems.length > 0 && (
                    <SidebarCard title="Contact Information">
                      <div className="space-y-3">
                        {contactItems.map((item, i) => (
                          <ContactRow
                            key={i}
                            icon={item.icon}
                            label={item.label}
                            value={item.value}
                            href={item.href}
                          />
                        ))}
                      </div>
                    </SidebarCard>
                  )}

                  {/* Resume */}
                  <SidebarCard title="Resume">
                    <div className="flex items-start gap-3">
                      <Icon name="statics/user-profile/user.svg" width={20} height={20} alt="resume" />
                      <div>
                        <p
                          className="text-14 font-semibold"
                          style={{ color: "var(--color-black-shade-700)" }}
                        >
                          Resume / CV
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
                        <p
                          className="text-14 font-semibold"
                          style={{ color: "var(--color-black-shade-700)" }}
                        >
                          {user.identityProofType || "Aadhar Card"}
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
                        <p
                          className="text-12 font-medium"
                          style={{ color: "var(--color-black-shade-700)" }}
                        >
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

                  {/* Experience Letters */}
                  {expLetters.length > 0 && (
                    <SidebarCard title="Experience Letter">
                      <div className="space-y-4">
                        {expLetters.map((item, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Icon name="statics/user-profile/compnay.svg" width={20} height={20} alt="company" />
                            <div>
                              <p
                                className="text-12 font-medium"
                                style={{ color: "var(--color-black-shade-700)" }}
                              >
                                {item.company || "Company"}
                              </p>
                              {item.url ? (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-12 mt-1 inline-block hover:underline"
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
              )}
            </div>

          </div>
        </aside>

        {/* ═══ RIGHT CONTENT ═════════════════════════════════════════ */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">

          {/* ── Profile Header — desktop only ──────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4">
            <div>
              <h1
                className="text-24 font-bold leading-tight"
                style={{ color: "var(--color-black-shade-900)" }}
              >
                {displayName}
              </h1>
              <StatusBadges user={user} />
            </div>

            {/* Role / Company / Experience / Location / Open to */}
            <div className="flex flex-col gap-2.5">
              <MetaRow icon="statics/user-profile/developer.svg" text={roleLabel} />
              <MetaRow icon="statics/user-profile/compnay.svg" text={company} />
              <MetaRow icon="statics/user-profile/brifcase.svg" text={experience} />
              <MetaRow icon="statics/user-profile/location.svg" text={user.currentLocation} />
              {openToRoles.length > 0 && (
                <MetaRow
                  icon="statics/user-profile/developer.svg"
                  text={`Open to: ${openToRoles.slice(0, 2).join(", ")}`}
                />
              )}
            </div>

            {/* Expertise */}
            {skills.length > 0 && <SkillPills label="Expertise" />}

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

          {/* ── Summary Cards ────────────────────────────────────────── */}

          {/* Mobile: swipeable carousel */}
          <div className="md:hidden">
            <Carousel
              items={summaryCards}
              visibleCards={1.2}
              autoPlay={false}
              renderItem={renderSummaryCard}
            />
          </div>

          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <div key={card.key}>{renderSummaryCard(card)}</div>
            ))}
          </div>

          {/* Profile Summary — mobile only, after carousel */}
          {about && (
            <div className="md:hidden flex flex-col gap-2">
              <h2 className="text-16 font-semibold" style={{ color: "var(--color-black-shade-800)" }}>
                Profile Summary
              </h2>
              <p className="text-14 leading-relaxed" style={{ color: "var(--color-black-shade-600)" }}>
                {about}
              </p>
            </div>
          )}

          {/* ── Work Experience ─────────────────────────────────────── */}
          <TimelineSection
            title={`Work Experience${workExperience.length > 0 ? ` (${workExperience.length})` : ""}`}
            isOpen={openSections.workExperience}
            onToggle={() => toggle("workExperience")}
            hasContent={workExperience.length > 0}
          >
            <WorkExpTimeline entries={workExperience} />
          </TimelineSection>

          {/* ── Internship Experience ────────────────────────────────── */}
          <TimelineSection
            title={`Internship Experience${internshipExperience.length > 0 ? ` (${internshipExperience.length})` : ""}`}
            isOpen={openSections.internship}
            onToggle={() => toggle("internship")}
            hasContent={internshipExperience.length > 0}
          >
            <WorkExpTimeline entries={internshipExperience} isInternship />
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
                          className="text-12 font-medium hover:underline break-all"
                          style={{ color: "var(--color-primary)" }}
                        >
                          View Project
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p
                        className="text-13 mb-3 leading-relaxed"
                        style={{ color: "var(--color-black-shade-600)" }}
                      >
                        {project.description}
                      </p>
                    )}
                    {project.points?.filter(Boolean).length > 0 && (
                      <ul className="space-y-2">
                        {project.points.filter(Boolean).map((point, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                              style={{ background: "var(--color-black-shade-400)" }}
                            />
                            <p
                              className="text-14 leading-relaxed"
                              style={{ color: "var(--color-black-shade-600)" }}
                            >
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
                    <h3 className="text-14 font-bold" style={{ color: "var(--color-black-shade-900)" }}>
                      {[edu.degreeLevel, edu.fieldOfStudy].filter(Boolean).join(" in ") || "Degree"}
                    </h3>
                    {edu.grade && (
                      <p className="text-12 mt-0.5" style={{ color: "var(--color-black-shade-500)" }}>
                        {edu.grade} {edu.gradeType}
                      </p>
                    )}
                    {edu.collegeName && (
                      <p className="text-14 mt-0.5" style={{ color: "var(--color-black-shade-600)" }}>
                        {edu.collegeName}
                      </p>
                    )}
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
                className="absolute left-1.5 top-2 bottom-0 w-0.5"
                style={{ background: "var(--color-primary-shade-200)" }}
              />
              <div className="space-y-4">
                {achievements.map((achievement, i) => {
                  const isObj = typeof achievement === "object" && achievement !== null;
                  const title = isObj ? achievement.title : achievement;
                  const description = isObj ? achievement.description : null;
                  return (
                    <div key={isObj ? (achievement._id ?? i) : i} className="relative pl-7">
                      <TimelineDot />
                      <p
                        className="text-14 font-medium"
                        style={{ color: "var(--color-black-shade-700)" }}
                      >
                        {title}
                      </p>
                      {description && (
                        <p className="text-14 mt-1" style={{ color: "var(--color-black-shade-500)" }}>
                          {description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TimelineSection>

        </main>
      </div>
    </>
  );
}

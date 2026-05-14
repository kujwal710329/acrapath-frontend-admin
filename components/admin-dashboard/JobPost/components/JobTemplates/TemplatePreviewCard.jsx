"use client";

import { useEffect, useCallback } from "react";

// ── Category accent colours (one per category value) ─────────────────────────
const CATEGORY_COLORS = {
  development: "var(--color-primary)",
  marketing: "var(--color-secondary)",
  sales: "#f59e0b",
  design: "#8b5cf6",
  consultancy: "#ef4444",
};

const CATEGORY_LABELS = {
  development: "Development",
  marketing: "Marketing",
  sales: "Sales",
  design: "Design",
  consultancy: "Consultancy",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPay(min, max, rateType) {
  if (!min && !max) return null;
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const rate = rateType ? ` ${rateType}` : "";
  if (min && max) return `${fmt(min)} – ${fmt(max)}${rate}`;
  if (min) return `From ${fmt(min)}${rate}`;
  return `Up to ${fmt(max)}${rate}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Pill({ label, color = "var(--color-primary-shade-100)", textColor = "var(--color-primary)" }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: color, color: textColor }}
    >
      {label}
    </span>
  );
}



// ── Main component ────────────────────────────────────────────────────────────

/**
 * TemplatePreviewCard
 *
 * Two modes:
 *   1. As a modal (standalone preview) — when `onClose` is provided
 *   2. As an inline preview panel inside the drawer — when `inline` is true
 *
 * Props:
 *   template  – full template document (or live form data shaped the same way)
 *   onClose   – () => void  (required when used as modal)
 *   inline    – boolean     (when true, renders without modal chrome)
 */
export default function TemplatePreviewCard({ template, onClose, inline = false }) {
  if (!template) return null;

  const accentColor = CATEGORY_COLORS[template.category] ?? "var(--color-primary)";
  const td = template.templateData ?? {};
  const payStr = formatPay(td.payMinRange, td.payMaxRange, td.payRateType);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!inline) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [inline, handleKeyDown]);

  useEffect(() => {
    if (!inline) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [inline]);

  const content = (
    <div className={`flex flex-row overflow-hidden${inline ? '' : ' h-full'}`}>
      {/* ── LEFT PANEL — employer card preview ─────────────────────────── */}
      <div
        className="w-[40%] flex-shrink-0 flex flex-col p-5 border-r border-(--color-black-shade-100) bg-(--white-secondary) overflow-y-auto"
        style={inline ? { maxHeight: 400 } : undefined}
      >
        {/* Category accent bar */}
        <div className="h-1 w-full rounded-full mb-4" style={{ background: accentColor }} />

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {template.isFeatured && (
            <Pill label="Featured" color="#fef3c7" textColor="#d97706" />
          )}
          {template.isPopular && (
            <Pill label="Popular" color="var(--color-secondary-shade-100)" textColor="var(--color-secondary-shade-900)" />
          )}
          {!template.isActive && (
            <Pill label="Inactive" color="var(--color-black-shade-100)" textColor="var(--color-black-shade-600)" />
          )}
        </div>

        {/* Category label */}
        <p className="text-xs font-semibold mb-1" style={{ color: accentColor }}>
          {CATEGORY_LABELS[template.category] ?? template.category}
          {template.subcategory ? ` · ${template.subcategory}` : ""}
        </p>

        {/* Job title */}
        <h3 className="text-base font-semibold text-(--color-black-shade-900) mb-1 leading-snug">
          {td.jobTitle || template.title || "Untitled"}
        </h3>

        {/* Template title (if different from job title) */}
        {template.title && td.jobTitle && template.title !== td.jobTitle && (
          <p className="text-xs text-(--color-black-shade-500) mb-3">
            Template: {template.title}
          </p>
        )}

        {/* Skills preview */}
        {td.skills?.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {td.skills.slice(0, 5).map((s) => (
              <div key={s} className="flex items-center gap-1.5 text-sm text-(--color-black-shade-700)">
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                {s}
              </div>
            ))}
            {td.skills.length > 5 && (
              <p className="text-xs text-(--color-black-shade-400) mt-1">+{td.skills.length - 5} more skills</p>
            )}
          </div>
        )}

        {/* Preview tags */}
        {template.previewTags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {template.previewTags.map((tag) => (
              <Pill key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* Usage count */}
        <p className="mt-auto pt-4 text-xs text-(--color-black-shade-400)">
          Used {template.usageCount ?? 0} time{template.usageCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── RIGHT PANEL — full template data ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={inline ? { maxHeight: 400 } : undefined}>

        {/* JOB DETAILS CARD */}
        <div className="rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-black-shade-400)">Job Details</p>

          <div>
            <p className="text-xs font-medium text-(--color-black-shade-400)">Job Title</p>
            <p className="text-base font-semibold text-(--color-black-shade-900)">{td.jobTitle || "—"}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">Category</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">{(CATEGORY_LABELS[td.jobCategory] ?? td.jobCategory) || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">Job Type</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">{td.jobType || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">Work Type</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">{td.jobLocationType || "—"}</p>
            </div>
          </div>

          {payStr ? (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">Pay Range</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">{payStr}</p>
            </div>
          ) : null}

          {(td.benefits?.length > 0 || td.supplementPay?.length > 0) ? (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400) mb-1.5">Perks / Benefits</p>
              <div className="flex flex-wrap gap-1.5">
                {[...(td.benefits ?? []), ...(td.supplementPay ?? [])].map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-(--color-black-shade-200) px-2.5 py-0.5 text-xs font-medium text-(--color-black-shade-700)"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">Perks / Benefits</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">—</p>
            </div>
          )}
        </div>

        {/* REQUIREMENTS CARD */}
        <div className="rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-black-shade-400)">Requirements</p>

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">Min. Education</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">{td.minimumEducation || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">Experience</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">{td.yearsExperience || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">English Level</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">{td.englishLevel || "—"}</p>
            </div>
          </div>

          {td.educationStream?.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400) mb-1.5">Education Stream</p>
              <div className="flex flex-wrap gap-1.5">
                {td.educationStream.map((s) => (
                  <span key={s} className="rounded-full border border-(--color-black-shade-200) px-2.5 py-0.5 text-xs font-medium text-(--color-black-shade-700)">{s}</span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400)">Education Stream</p>
              <p className="text-sm font-medium text-(--color-black-shade-800)">—</p>
            </div>
          )}

          {td.technicalSkills?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400) mb-1.5">Technical Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {td.technicalSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      background: "var(--color-primary-shade-100)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {td.strategicSkills?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400) mb-1.5">Strategic Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {td.strategicSkills.map((s) => (
                  <span key={s} className="rounded-full border border-(--color-black-shade-200) px-2.5 py-0.5 text-xs font-medium text-(--color-black-shade-700)">{s}</span>
                ))}
              </div>
            </div>
          )}

          {td.qualifications?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400) mb-1.5">Qualifications</p>
              <div className="flex flex-wrap gap-1.5">
                {td.qualifications.map((q) => (
                  <span key={q} className="rounded-full border border-(--color-black-shade-200) px-2.5 py-0.5 text-xs font-medium text-(--color-black-shade-700)">{q}</span>
                ))}
              </div>
            </div>
          )}

          {td.languages?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-(--color-black-shade-400) mb-1.5">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {td.languages.map((l) => (
                  <span key={l} className="rounded-full border border-(--color-black-shade-200) px-2.5 py-0.5 text-xs font-medium text-(--color-black-shade-700)">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* JOB DESCRIPTION CARD */}
        <div className="rounded-xl border border-(--color-black-shade-100) bg-(--pure-white) p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-black-shade-400) mb-3">Job Description</p>
          {td.jobDescription ? (
            <div
              className="rte-content text-sm text-(--color-black-shade-800) leading-relaxed"
              dangerouslySetInnerHTML={{ __html: td.jobDescription }}
            />
          ) : (
            <p className="text-sm text-(--color-black-shade-400)">No description provided.</p>
          )}
        </div>

        {/* ADMIN STATS */}
        <div className="rounded-xl border border-(--color-black-shade-100) bg-(--color-black-shade-50) p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--color-black-shade-500)">
            Admin Info
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <span className="text-xs text-(--color-black-shade-500)">Status</span>
            <span className="text-xs font-medium" style={{ color: template.isActive ? "var(--color-secondary)" : "var(--color-black-shade-500)" }}>
              {template.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-xs text-(--color-black-shade-500)">Created</span>
            <span className="text-xs font-medium text-(--color-black-shade-800)">{formatDate(template.createdAt)}</span>
            <span className="text-xs text-(--color-black-shade-500)">Last Updated</span>
            <span className="text-xs font-medium text-(--color-black-shade-800)">{formatDate(template.updatedAt)}</span>
            <span className="text-xs text-(--color-black-shade-500)">Times Used</span>
            <span className="text-xs font-medium text-(--color-black-shade-800)">{template.usageCount ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Inline mode (inside drawer) ───────────────────────────────────────────
  if (inline) {
    return (
      <div className="overflow-hidden rounded-xl border border-(--color-black-shade-200)">
        {content}
      </div>
    );
  }

  // ── Modal mode ────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl bg-(--pure-white) rounded-2xl shadow-2xl overflow-hidden"
        style={{ height: "min(750px, 90vh)" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-black-shade-100) flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-(--color-black-shade-900)">
              Template Preview
            </h2>
            <p className="text-xs text-(--color-black-shade-500) mt-0.5">
              How this template appears to employers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-black-shade-500) transition-colors hover:bg-(--color-black-shade-100) hover:text-(--color-black-shade-900) cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal body — split panels */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {content}
        </div>
      </div>
    </div>
  );
}

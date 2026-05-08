"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/common/Button";
import RichTextEditor from "@/components/common/RichTextEditor";
import ConfirmDialog from "./ConfirmDialog";
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyIconUploadUrl,
  seedCompaniesFromJobs,
} from "@/services/metadata.service";
import { showSuccess, showError } from "@/utilities/toast";
import { API_CONFIG } from "@/utilities/config";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function CompanyIconFallback({ name, size = 32 }) {
  const colors = [
    "var(--color-primary-shade-700)",
    "var(--color-secondary-shade-700)",
    "var(--color-black-shade-600)",
    "var(--color-primary-shade-900)",
  ];
  const initial = (name || "?").charAt(0).toUpperCase();
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bg = colors[Math.abs(hash) % colors.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.45,
      }}
    >
      {initial}
    </div>
  );
}

// ─── Company Card ─────────────────────────────────────────────────────────────

function CompanyCard({ company, onEdit, onDelete, deleting }) {
  const descPreview = stripHtml(company.description || "").slice(0, 80) + (stripHtml(company.description || "").length > 80 ? "…" : "");

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-(--color-black-shade-200) bg-(--pure-white) px-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        {company.iconUrl ? (
          <img
            src={company.iconUrl}
            width={32}
            height={32}
            alt={company.name}
            style={{ borderRadius: 6, objectFit: "contain", flexShrink: 0 }}
          />
        ) : (
          <CompanyIconFallback name={company.name} size={32} />
        )}
        <div className="min-w-0">
          <p className="text-14 font-semibold text-(--color-black-shade-900) truncate">{company.name}</p>
          {descPreview && (
            <p className="mt-0.5 text-13 text-(--color-black-shade-500) line-clamp-2">{descPreview}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(company)}
          className="px-3 py-1.5 rounded-lg border border-(--color-black-shade-200) text-13 font-medium text-(--color-black-shade-700) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(company)}
          disabled={deleting}
          className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
          aria-label={`Delete ${company.name}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="var(--color-red)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Icon Upload ───────────────────────────────────────────────────────────────

function IconUploadField({ iconUrl, uploading, onUpload }) {
  const [imgError, setImgError] = useState(false);

  const showImg = iconUrl && !imgError;

  return (
    <div>
      <p className="text-13 font-semibold text-(--color-black-shade-600) uppercase tracking-wide mb-2">
        Company Icon (optional)
      </p>
      <div className="flex items-center gap-3">
        {showImg ? (
          <img
            src={iconUrl}
            width={40}
            height={40}
            alt="Company icon"
            onError={() => setImgError(true)}
            style={{ borderRadius: 6, objectFit: "contain", border: "1px solid var(--color-black-shade-200)" }}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-lg border border-dashed border-(--color-black-shade-300) bg-(--color-black-shade-50) text-(--color-black-shade-400) text-12"
            style={{ width: 40, height: 40 }}
          >
            ?
          </div>
        )}
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".png,.svg,.jpg,.jpeg"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImgError(false);
                onUpload(file);
              }
              e.target.value = "";
            }}
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--color-black-shade-300) text-13 font-medium text-(--color-black-shade-700) hover:bg-(--color-black-shade-50) transition-colors">
            {uploading ? "Uploading…" : "Upload icon"}
          </span>
        </label>
        <span className="text-12 text-(--color-black-shade-400)">PNG, SVG, JPG · Max 2MB</span>
      </div>
    </div>
  );
}

// ─── Company Form ──────────────────────────────────────────────────────────────

function CompanyForm({ initial = {}, onSave, onCancel, saving, inModal = false }) {
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [iconUrl, setIconUrl] = useState(initial.iconUrl || "");
  const [uploading, setUploading] = useState(false);

  const nameErr = !name.trim() ? "Company name is required" : "";
  const descErr = !stripHtml(description) ? "Description is required" : stripHtml(description).length < 20 ? "Must be at least 20 characters" : "";
  const isValid = !nameErr && !descErr;

  const handleUpload = async (file) => {
    if (file.size > 2 * 1024 * 1024) {
      showError("Icon must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const res = await getCompanyIconUploadUrl(file.name);
      if (!res?.data?.uploadUrl) throw new Error("Failed to get upload URL");

      const uploadRes = await fetch(res.data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

      const publicUrl = `${API_CONFIG.S3_BASE_URL}/${res.data.iconKey}`;
      setIconUrl(publicUrl);
      showSuccess("Icon uploaded");
    } catch {
      showError("Icon upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({ name: name.trim(), description, iconUrl: iconUrl || null });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={inModal ? "flex flex-col gap-5" : "flex flex-col gap-5 p-5 rounded-xl border border-(--color-black-shade-200) bg-(--color-black-shade-50)"}
    >
      {/* Name */}
      <div>
        <p className="text-13 font-semibold text-(--color-black-shade-600) uppercase tracking-wide mb-2">
          Company Name <span className="text-red-500">*</span>
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Eg. Acrapath"
          className="h-10 w-full rounded-xl border border-(--color-black-shade-300) px-4 text-14 font-medium text-(--color-black-shade-800) outline-none focus:border-(--color-primary) bg-(--pure-white)"
        />
        {name && nameErr && <p className="mt-1 text-12 text-(--color-red)">{nameErr}</p>}
      </div>

      {/* Description */}
      <div>
        <p className="text-13 font-semibold text-(--color-black-shade-600) uppercase tracking-wide mb-2">
          Company Description <span className="text-red-500">*</span>
        </p>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe the company — mission, culture, what makes it great…"
          hasError={!!description && !!descErr}
        />
        {description && descErr && <p className="mt-1 text-12 text-(--color-red)">{descErr}</p>}
      </div>

      {/* Icon */}
      <IconUploadField
        iconUrl={iconUrl}
        uploading={uploading}
        onUpload={handleUpload}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-(--color-black-shade-200) text-14 font-medium text-(--color-black-shade-700) hover:bg-(--color-black-shade-100) transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <Button
          variant="primary"
          type="submit"
          disabled={!isValid || saving || uploading}
          className="!h-10 !w-auto px-5 !rounded-xl text-14"
        >
          {saving ? "Saving…" : initial._id ? "Save Changes" : "Add Company"}
        </Button>
      </div>
    </form>
  );
}

// ─── Company Modal ────────────────────────────────────────────────────────────

function CompanyModal({ title, open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl rounded-2xl bg-(--pure-white) shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-black-shade-100) shrink-0">
          <h2 className="text-16 font-semibold text-(--color-black-shade-900)">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-(--color-black-shade-500) hover:bg-(--color-black-shade-100) transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CompaniesMetadata() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // company being edited
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, company: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCompanies();
      setCompanies(res?.data ?? []);
    } catch {
      showError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Add ────────────────────────────────────────────────────────────────────

  const handleAdd = async (payload) => {
    setSaving(true);
    try {
      await createCompany(payload);
      showSuccess(`"${payload.name}" added`);
      setShowAddForm(false);
      await load();
    } catch {
      // toast handled by apiRequest
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const handleEdit = async (payload) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateCompany(editTarget._id, payload);
      showSuccess(`"${payload.name}" updated`);
      setEditTarget(null);
      await load();
    } catch {
      // toast handled by apiRequest
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!confirm.company) return;
    setSaving(true);
    try {
      await deleteCompany(confirm.company._id);
      showSuccess(`"${confirm.company.name}" deleted`);
      setConfirm({ open: false, company: null });
      await load();
    } catch {
      // toast handled by apiRequest
    } finally {
      setSaving(false);
    }
  };

  // ── Seed from Jobs ─────────────────────────────────────────────────────────

  const handleSeedFromJobs = async () => {
    setSeeding(true);
    try {
      const res = await seedCompaniesFromJobs();
      const { newlyCreated, totalDistinctCompanies } = res?.data ?? {};
      if (newlyCreated > 0) {
        showSuccess(`${newlyCreated} new compan${newlyCreated !== 1 ? "ies" : "y"} added from ${totalDistinctCompanies} distinct job postings`);
        await load();
      } else {
        showSuccess("All job companies are already in the list");
      }
    } catch {
      // toast handled by apiRequest
    } finally {
      setSeeding(false);
    }
  };

  // ── Skeleton ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-(--color-black-shade-100) animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Count + actions */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-13 text-(--color-black-shade-500)">
          {companies.length} compan{companies.length !== 1 ? "ies" : "y"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSeedFromJobs}
            disabled={seeding}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-(--color-black-shade-200) text-13 font-medium text-(--color-black-shade-600) hover:bg-(--color-black-shade-50) hover:border-(--color-black-shade-300) transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              className={seeding ? "animate-spin" : undefined}
            >
              <path d="M13 7A6 6 0 1 1 7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 1v4H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {seeding ? "Syncing…" : "Sync from Jobs"}
          </button>
          {!showAddForm && !editTarget && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-(--color-primary) text-13 font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Add Company
            </button>
          )}
        </div>
      </div>

      {/* Current Companies */}
      {companies.length > 0 && (
        <section>
          <h3 className="text-13 font-semibold text-(--color-black-shade-600) uppercase tracking-wide mb-3">
            Current Companies
          </h3>
          <div className="flex flex-col gap-2">
            {companies.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                onEdit={setEditTarget}
                onDelete={(c) => setConfirm({ open: true, company: c })}
                deleting={saving}
              />
            ))}
          </div>
        </section>
      )}

      {companies.length === 0 && (
        <p className="text-14 text-(--color-black-shade-400) italic">No companies yet. Click "Add Company" above to get started.</p>
      )}

      {/* Add Company modal */}
      <CompanyModal
        title="Add Company"
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
      >
        <CompanyForm
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
          saving={saving}
          inModal
        />
      </CompanyModal>

      {/* Edit Company modal */}
      <CompanyModal
        title="Edit Company"
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
      >
        <CompanyForm
          initial={editTarget ?? {}}
          onSave={handleEdit}
          onCancel={() => setEditTarget(null)}
          saving={saving}
          inModal
        />
      </CompanyModal>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirm.open}
        title="Delete Company"
        message={`Delete "${confirm.company?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, company: null })}
      />
    </div>
  );
}

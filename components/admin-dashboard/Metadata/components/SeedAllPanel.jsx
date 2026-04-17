"use client";

import { useState, useCallback } from "react";
import Button from "@/components/common/Button";
import ConfirmDialog from "./ConfirmDialog";

export default function SeedAllPanel({ isPending, onSeedAll }) {
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const pending = isPending("seed-all");

  const handleChange = useCallback((e) => {
    setJsonText(e.target.value);
    setJsonError("");
    try {
      if (e.target.value.trim()) JSON.parse(e.target.value);
    } catch {
      setJsonError("Invalid JSON");
    }
  }, []);

  const handleSeedAll = useCallback(() => {
    if (!jsonText.trim() || jsonError) return;
    setConfirmOpen(true);
  }, [jsonText, jsonError]);

  const handleConfirm = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      onSeedAll(parsed);
      setJsonText("");
    } catch {
      setJsonError("Invalid JSON");
    }
    setConfirmOpen(false);
  }, [jsonText, onSeedAll]);

  const isValid = jsonText.trim().length > 0 && !jsonError;

  return (
    <div className="flex flex-col gap-5">
      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5">
          <path
            d="M9 1.5L16.5 15H1.5L9 1.5Z"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 7v3.5M9 12.5v.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-14 font-semibold text-amber-800">Warning</p>
          <p className="text-13 text-amber-700 mt-0.5">
            This will overwrite all existing metadata values with the provided JSON. Use for initial
            setup or full reset only.
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-14 text-(--color-black-shade-600)">
          Paste a JSON object containing any or all of the 7 metadata types. Only provided keys will
          be upserted.
        </p>
        <p className="text-13 text-(--color-black-shade-400) mt-1">
          Expected shape:&nbsp;
          <code className="text-12 bg-(--color-black-shade-100) px-1.5 py-0.5 rounded">
            {"{ jobCategories: [...], jobRolesByCategory: { ... }, ... }"}
          </code>
        </p>
      </div>

      {/* JSON textarea */}
      <textarea
        rows={14}
        value={jsonText}
        onChange={handleChange}
        placeholder={'{\n  "jobCategories": ["Development", "Marketing"],\n  "commonJobRoles": ["Software Engineer"],\n  "fieldsOfStudy": ["Computer Science"],\n  "jobCategoryApiMap": { "Development": "dev" },\n  "jobRolesByCategory": { "Development": ["Backend Developer"] },\n  "techSkillsByCategory": { "Development": ["Node.js"] },\n  "strategicSkillsByCategory": { "Development": ["Leadership"] }\n}'}
        disabled={pending}
        className={`w-full rounded-xl border px-4 py-3 text-13 font-mono text-(--color-black-shade-800) outline-none focus:border-(--color-primary) resize-y disabled:opacity-50 bg-(--pure-white) ${
          jsonError ? "border-red-400" : "border-(--color-black-shade-300)"
        }`}
      />

      {jsonError && <p className="text-13 text-red-500">{jsonError}</p>}

      <Button
        variant="primary"
        onClick={handleSeedAll}
        disabled={!isValid || pending}
        className="!h-11 !w-auto px-6 !rounded-xl text-14 self-start"
      >
        {pending ? "Seeding…" : "Seed All Metadata"}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Seed All Metadata"
        message="This will overwrite existing values for all provided metadata types. This cannot be undone. Continue?"
        confirmLabel="Yes, Seed All"
        variant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

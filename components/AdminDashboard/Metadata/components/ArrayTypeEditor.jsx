"use client";

import { useState, useCallback } from "react";
import Button from "@/components/common/Button";
import ConfirmDialog from "./ConfirmDialog";

// ─── Tag chip ────────────────────────────────────────────────────────────────

function ItemTag({ value, onRemove, disabled }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-13 font-medium bg-(--color-primary-shade-100) text-(--color-black-shade-800) border border-(--color-primary-shade-200)">
      {value}
      <button
        onClick={() => onRemove(value)}
        disabled={disabled}
        aria-label={`Remove ${value}`}
        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-(--color-black-shade-200) transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TagSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-8 rounded-full bg-(--color-black-shade-100) animate-pulse"
          style={{ width: `${60 + (i % 3) * 20}px` }}
        />
      ))}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function ArrayTypeEditor({ type, values = [], loading, isPending, onAdd, onRemove, onReplaceAll }) {
  const [addInput, setAddInput] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, item: null, mode: null });

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAdd = useCallback(() => {
    const trimmed = addInput.trim();
    if (!trimmed) return;
    onAdd(type, trimmed);
    setAddInput("");
  }, [addInput, type, onAdd]);

  const handleAddKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  const requestRemove = useCallback((item) => {
    setConfirm({ open: true, item, mode: "remove" });
  }, []);

  const requestReplaceAll = useCallback(() => {
    if (!replaceText.trim()) return;
    setConfirm({ open: true, item: null, mode: "replace" });
  }, [replaceText]);

  const handleConfirm = useCallback(() => {
    if (confirm.mode === "remove") {
      onRemove(type, confirm.item);
    } else if (confirm.mode === "replace") {
      const lines = replaceText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const deduped = [...new Set(lines)];
      onReplaceAll(type, deduped);
      setReplaceText("");
      setShowReplace(false);
    }
    setConfirm({ open: false, item: null, mode: null });
  }, [confirm, replaceText, type, onRemove, onReplaceAll]);

  const handleCancel = useCallback(() => {
    setConfirm({ open: false, item: null, mode: null });
  }, []);

  // ─── Derived ─────────────────────────────────────────────────────────────

  const addPending = isPending(`add-${type}`);
  const replacePending = isPending(`replace-${type}`);
  const anyPending = addPending || replacePending;

  const replaceLines = replaceText.split("\n").map((l) => l.trim()).filter(Boolean);
  const replaceValid = replaceLines.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header count */}
      <div className="flex items-center gap-2">
        <span className="text-13 text-(--color-black-shade-500)">
          {loading ? "Loading..." : `${values.length} item${values.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Tag list */}
      <section>
        <h3 className="text-13 font-semibold text-(--color-black-shade-600) uppercase tracking-wide mb-3">
          Current Values
        </h3>
        {loading ? (
          <TagSkeleton />
        ) : values.length === 0 ? (
          <p className="text-14 text-(--color-black-shade-400) italic">No items yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {values.map((val) => (
              <ItemTag
                key={val}
                value={val}
                onRemove={requestRemove}
                disabled={anyPending || isPending(`remove-${type}-${val}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Add item */}
      <section>
        <h3 className="text-13 font-semibold text-(--color-black-shade-600) uppercase tracking-wide mb-3">
          Add Item
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            onKeyDown={handleAddKeyDown}
            placeholder="Enter new value..."
            disabled={addPending || loading}
            className="flex-1 h-10 rounded-xl border border-(--color-black-shade-300) px-4 text-14 font-medium text-(--color-black-shade-800) outline-none focus:border-(--color-primary) disabled:opacity-50"
          />
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!addInput.trim() || addPending || loading}
            className="!h-10 !w-auto px-5 !rounded-xl text-14"
          >
            {addPending ? "Adding…" : "Add"}
          </Button>
        </div>
      </section>

      {/* Replace all toggle */}
      <section>
        <button
          type="button"
          onClick={() => setShowReplace((v) => !v)}
          className="flex items-center gap-2 text-14 font-semibold text-(--color-primary) hover:underline cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={`transition-transform ${showReplace ? "rotate-90" : ""}`}
          >
            <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Replace All Values
        </button>

        {showReplace && (
          <div className="mt-3 flex flex-col gap-3 p-4 rounded-xl border border-(--color-black-shade-200) bg-(--color-black-shade-50)">
            <p className="text-13 text-(--color-black-shade-500)">
              Enter one item per line. This will completely replace existing values.
            </p>
            <textarea
              rows={8}
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder={"Item one\nItem two\nItem three"}
              disabled={replacePending}
              className="w-full rounded-xl border border-(--color-black-shade-300) px-4 py-3 text-14 font-medium text-(--color-black-shade-800) outline-none focus:border-(--color-primary) resize-y disabled:opacity-50 bg-(--pure-white)"
            />
            {replaceValid && (
              <p className="text-13 text-(--color-black-shade-500)">
                {replaceLines.length} unique item{replaceLines.length !== 1 ? "s" : ""} will be saved.
              </p>
            )}
            <Button
              variant="outline"
              onClick={requestReplaceAll}
              disabled={!replaceValid || replacePending}
              className="!h-10 !w-auto px-5 !rounded-xl text-14 self-start"
            >
              {replacePending ? "Saving…" : "Save (Replace All)"}
            </Button>
          </div>
        )}
      </section>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.mode === "remove" ? "Remove Item" : "Replace All Values"}
        message={
          confirm.mode === "remove"
            ? `Remove "${confirm.item}" from ${type}?`
            : `This will overwrite all current values in ${type} with ${replaceLines.length} new item${replaceLines.length !== 1 ? "s" : ""}. Continue?`
        }
        confirmLabel={confirm.mode === "remove" ? "Remove" : "Replace All"}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

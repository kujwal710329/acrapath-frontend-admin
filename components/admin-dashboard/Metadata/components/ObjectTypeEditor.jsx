"use client";

import { useState, useCallback } from "react";
import Button from "@/components/common/Button";
import ConfirmDialog from "./ConfirmDialog";

// ─── Tag chip (sub-array item) ────────────────────────────────────────────────

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

function CategorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-(--color-black-shade-100) animate-pulse" />
      ))}
    </div>
  );
}

// ─── Single category accordion row ───────────────────────────────────────────

function CategoryRow({ type, category, values, isApiMap, isPending, onAddItem, onRemoveItem }) {
  const [open, setOpen] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [addValueInput, setAddValueInput] = useState(""); // for jobCategoryApiMap

  const addKey = `add-${type}-${category}`;
  const addPending = isPending(addKey);

  const handleAdd = useCallback(() => {
    if (isApiMap) {
      // For jobCategoryApiMap, addInput = new key, addValueInput = new value
      // We store key→value pairs differently; just send { category: key, value }
      const trimKey = addInput.trim();
      const trimVal = addValueInput.trim();
      if (!trimKey || !trimVal) return;
      onAddItem(type, trimKey, trimVal); // special sig for map
      setAddInput("");
      setAddValueInput("");
    } else {
      const trimmed = addInput.trim();
      if (!trimmed) return;
      onAddItem(type, category, trimmed);
      setAddInput("");
    }
  }, [isApiMap, addInput, addValueInput, type, category, onAddItem]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  // Derive display values
  let displayPairs = [];
  if (isApiMap) {
    // values is the whole map object; category is a key in that map
    displayPairs = values !== undefined ? [[category, values]] : [];
  }

  const arrayValues = !isApiMap && Array.isArray(values) ? values : [];

  return (
    <div className="border border-(--color-black-shade-200) rounded-xl overflow-hidden">
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-(--pure-white) hover:bg-(--color-black-shade-50) transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-14 font-semibold text-(--color-black-shade-800)">{category}</span>
          {isApiMap ? (
            <span className="text-13 text-(--color-black-shade-500)">→ {values}</span>
          ) : (
            <span className="text-13 text-(--color-black-shade-400)">
              {arrayValues.length} item{arrayValues.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`transition-transform text-(--color-black-shade-400) ${open ? "rotate-90" : ""}`}
        >
          <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Accordion body */}
      {open && (
        <div className="px-4 py-4 border-t border-(--color-black-shade-100) bg-(--color-black-shade-50) flex flex-col gap-4">
          {/* Tag list or api map display */}
          {isApiMap ? (
            <div className="flex items-center gap-2">
              <span className="text-14 text-(--color-black-shade-600)">
                API key: <strong className="text-(--color-black-shade-800)">{values || "—"}</strong>
              </span>
              <button
                onClick={() => onRemoveItem(type, category, category)}
                className="text-13 text-red-500 hover:underline cursor-pointer"
                disabled={isPending(`remove-${type}-${category}-${category}`)}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {arrayValues.length === 0 ? (
                <p className="text-14 text-(--color-black-shade-400) italic">No items yet.</p>
              ) : (
                arrayValues.map((val) => (
                  <ItemTag
                    key={val}
                    value={val}
                    onRemove={(v) => onRemoveItem(type, category, v)}
                    disabled={isPending(`remove-${type}-${category}-${val}`)}
                  />
                ))
              )}
            </div>
          )}

          {/* Add row */}
          <div className="flex gap-2">
            {isApiMap ? (
              <>
                <input
                  type="text"
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Category name…"
                  disabled={addPending}
                  className="flex-1 h-10 rounded-xl border border-(--color-black-shade-300) px-4 text-14 font-medium text-(--color-black-shade-800) outline-none focus:border-(--color-primary) disabled:opacity-50 bg-(--pure-white)"
                />
                <input
                  type="text"
                  value={addValueInput}
                  onChange={(e) => setAddValueInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="API key value…"
                  disabled={addPending}
                  className="flex-1 h-10 rounded-xl border border-(--color-black-shade-300) px-4 text-14 font-medium text-(--color-black-shade-800) outline-none focus:border-(--color-primary) disabled:opacity-50 bg-(--pure-white)"
                />
              </>
            ) : (
              <input
                type="text"
                value={addInput}
                onChange={(e) => setAddInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New item…"
                disabled={addPending}
                className="flex-1 h-10 rounded-xl border border-(--color-black-shade-300) px-4 text-14 font-medium text-(--color-black-shade-800) outline-none focus:border-(--color-primary) disabled:opacity-50 bg-(--pure-white)"
              />
            )}
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!addInput.trim() || addPending}
              className="!h-10 !w-auto px-4 !rounded-xl text-13 shrink-0"
            >
              {addPending ? "Adding…" : "Add"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── JSON preview ─────────────────────────────────────────────────────────────

function JsonPreview({ data }) {
  return (
    <pre className="text-12 text-(--color-black-shade-700) bg-(--color-black-shade-50) rounded-xl p-4 overflow-auto max-h-80 border border-(--color-black-shade-200)">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function ObjectTypeEditor({
  type,
  values = {},
  loading,
  isPending,
  onAddItemToCategory,
  onRemoveItemFromCategory,
  onReplaceAll,
}) {
  const [replaceText, setReplaceText] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [jsonError, setJsonError] = useState("");
  const [confirm, setConfirm] = useState({ open: false });

  const isApiMap = type === "jobCategoryApiMap";
  const categories = Object.keys(values);
  const replacePending = isPending(`replace-${type}`);

  // ─── Replace All ─────────────────────────────────────────────────────────

  const handleReplaceTextChange = useCallback((e) => {
    setReplaceText(e.target.value);
    setJsonError("");
    try {
      if (e.target.value.trim()) JSON.parse(e.target.value);
    } catch {
      setJsonError("Invalid JSON");
    }
  }, []);

  const requestReplaceAll = useCallback(() => {
    if (!replaceText.trim() || jsonError) return;
    setConfirm({ open: true });
  }, [replaceText, jsonError]);

  const handleConfirm = useCallback(() => {
    try {
      const parsed = JSON.parse(replaceText);
      onReplaceAll(type, parsed);
      setReplaceText("");
      setShowReplace(false);
    } catch {
      setJsonError("Invalid JSON");
    }
    setConfirm({ open: false });
  }, [replaceText, type, onReplaceAll]);

  // ─── Add item to category (proxy to parent) ───────────────────────────────

  const handleAddItem = useCallback(
    (t, category, value) => {
      onAddItemToCategory(t, category, value);
    },
    [onAddItemToCategory]
  );

  const handleRemoveItem = useCallback(
    (t, category, value) => {
      onRemoveItemFromCategory(t, category, value);
    },
    [onRemoveItemFromCategory]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-13 text-(--color-black-shade-500)">
          {loading ? "Loading..." : `${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`}
        </span>
        <button
          type="button"
          onClick={() => setShowJson((v) => !v)}
          className="ml-auto text-13 text-(--color-primary) hover:underline cursor-pointer"
        >
          {showJson ? "Hide" : "Show"} JSON preview
        </button>
      </div>

      {/* JSON Preview */}
      {showJson && <JsonPreview data={values} />}

      {/* Category accordion list */}
      <section>
        <h3 className="text-13 font-semibold text-(--color-black-shade-600) uppercase tracking-wide mb-3">
          Categories
        </h3>
        {loading ? (
          <CategorySkeleton />
        ) : categories.length === 0 ? (
          <p className="text-14 text-(--color-black-shade-400) italic">No categories yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <CategoryRow
                key={cat}
                type={type}
                category={cat}
                values={isApiMap ? values[cat] : values[cat]}
                isApiMap={isApiMap}
                isPending={isPending}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>
        )}
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
          Replace All Values (JSON)
        </button>

        {showReplace && (
          <div className="mt-3 flex flex-col gap-3 p-4 rounded-xl border border-(--color-black-shade-200) bg-(--color-black-shade-50)">
            <p className="text-13 text-(--color-black-shade-500)">
              Paste a valid JSON object. This will completely replace all existing values.
            </p>
            <textarea
              rows={10}
              value={replaceText}
              onChange={handleReplaceTextChange}
              placeholder={'{\n  "CategoryName": ["value1", "value2"]\n}'}
              disabled={replacePending}
              className={`w-full rounded-xl border px-4 py-3 text-13 font-mono text-(--color-black-shade-800) outline-none focus:border-(--color-primary) resize-y disabled:opacity-50 bg-(--pure-white) ${
                jsonError ? "border-red-400" : "border-(--color-black-shade-300)"
              }`}
            />
            {jsonError && (
              <p className="text-13 text-red-500">{jsonError}</p>
            )}
            <Button
              variant="outline"
              onClick={requestReplaceAll}
              disabled={!replaceText.trim() || !!jsonError || replacePending}
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
        title="Replace All Values"
        message={`This will overwrite all current values in ${type}. Continue?`}
        confirmLabel="Replace All"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false })}
      />
    </div>
  );
}

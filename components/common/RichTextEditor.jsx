"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatClear,
} from "react-icons/md";

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`
        flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-base transition-all duration-100
        ${
          active
            ? "bg-(--color-primary) text-white shadow-sm"
            : "text-(--color-black-shade-500) hover:bg-(--color-black-shade-100) hover:text-(--color-black-shade-900)"
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarHeadingButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`
        flex h-7 cursor-pointer items-center justify-center rounded-md px-2 text-[11px] font-bold tracking-wide transition-all duration-100
        ${
          active
            ? "bg-(--color-primary) text-white shadow-sm"
            : "text-(--color-black-shade-500) hover:bg-(--color-black-shade-100) hover:text-(--color-black-shade-900)"
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-4 w-px shrink-0 bg-(--color-black-shade-200)" />;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  hasError,
  minHeight = 200,
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "Write here…",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: `rte-content px-4 py-3.5 outline-none`,
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      className={`
        group overflow-hidden rounded-xl border bg-white transition-all duration-150
        ${
          hasError
            ? "border-(--color-red) shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-red)_10%,transparent)]"
            : "border-(--color-black-shade-200) focus-within:border-(--color-primary) focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
        }
      `}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-(--color-black-shade-100) bg-(--color-black-shade-50) px-2.5 py-2">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (⌘B)"
        >
          <MdFormatBold />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (⌘I)"
        >
          <MdFormatItalic />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (⌘U)"
        >
          <MdFormatUnderlined />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarHeadingButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarHeadingButton>

        <ToolbarHeadingButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarHeadingButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <MdFormatListBulleted />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <MdFormatListNumbered />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Clear */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          active={false}
          title="Clear formatting"
        >
          <MdFormatClear />
        </ToolbarButton>
      </div>

      {/* ── Editor area ──────────────────────────────────────────────────── */}
      <EditorContent editor={editor} />
    </div>
  );
}

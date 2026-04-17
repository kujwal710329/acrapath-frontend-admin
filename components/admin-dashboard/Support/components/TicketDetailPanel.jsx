"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StatusBadge from "./StatusBadge";
import TicketStatusDropdown from "./TicketStatusDropdown";
import Button from "@/components/common/Button";
import { showError } from "@/utilities/toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-t-transparent animate-spin ${className}`}
    />
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, isAdmin }) {
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col gap-1 max-w-[78%] ${isAdmin ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        <div className="flex items-center gap-2">
          <span
            className={`text-12 font-semibold ${
              isAdmin ? "text-(--color-primary)" : "text-(--color-black-shade-600)"
            }`}
          >
            {isAdmin ? "Acrapath Support" : message.repliedBy || "User"}
          </span>
          <span className="text-11 text-(--color-black-shade-400)">
            {formatDate(message.createdAt)}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-14 leading-relaxed ${
            isAdmin
              ? "bg-(--color-primary) text-white rounded-tr-sm"
              : "bg-(--color-black-shade-100) text-(--color-black-shade-800) rounded-tl-sm"
          }`}
        >
          {message.message}
        </div>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

/**
 * Slide-in detail panel for a support ticket.
 *
 * Props:
 *   open            — boolean, controls visibility
 *   ticket          — the ticket row from list (used for instant header render)
 *   onClose         — called when user closes the panel
 *   onLoadTicket    — async (ticketId) → full ticket with replies
 *   onSubmitReply   — async (ticketId, message) → updated full ticket
 *   onChangeStatus  — async (ticketId, status) → { ticketId, status }
 */
export default function TicketDetailPanel({
  open,
  ticket,
  onClose,
  onLoadTicket,
  onSubmitReply,
  onChangeStatus,
}) {
  const [fullTicket, setFullTicket] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [changingStatus, setChangingStatus] = useState(false);

  const threadRef = useRef(null);
  const textareaRef = useRef(null);

  // Load full ticket whenever panel opens
  useEffect(() => {
    if (!open || !ticket?.ticketId) return;

    let cancelled = false;
    setFullTicket(null);
    setReplyText("");
    setLoadingDetail(true);

    onLoadTicket(ticket.ticketId)
      .then((data) => {
        if (!cancelled) setFullTicket(data);
      })
      .catch((err) => {
        if (!cancelled) showError(err.message || "Failed to load ticket");
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, ticket?.ticketId, onLoadTicket]);

  // Scroll thread to bottom whenever replies change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [fullTicket?.replies?.length]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSendReply = useCallback(async () => {
    const msg = replyText.trim();
    if (!msg || !fullTicket?.ticketId) return;

    setSendingReply(true);
    try {
      const updated = await onSubmitReply(fullTicket.ticketId, msg);
      if (updated) setFullTicket(updated);
      setReplyText("");
      textareaRef.current?.focus();
    } catch {
      // toast already shown by hook
    } finally {
      setSendingReply(false);
    }
  }, [replyText, fullTicket?.ticketId, onSubmitReply]);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!fullTicket?.ticketId || newStatus === fullTicket.status) return;
      setChangingStatus(true);
      try {
        const result = await onChangeStatus(fullTicket.ticketId, newStatus);
        setFullTicket((prev) => ({
          ...prev,
          status: result?.status ?? newStatus,
        }));
      } catch {
        // toast already shown by hook
      } finally {
        setChangingStatus(false);
      }
    },
    [fullTicket?.ticketId, fullTicket?.status, onChangeStatus]
  );

  // Handle Ctrl+Enter to send
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSendReply();
      }
    },
    [handleSendReply]
  );

  if (!open) return null;

  // Use fullTicket if loaded, otherwise fall back to list row for header
  const display = fullTicket ?? ticket;
  const replies = fullTicket?.replies ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-2xl bg-(--pure-white) shadow-2xl"
        aria-label="Ticket detail"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Panel header ───────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-(--color-black-shade-100)">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-13 font-semibold text-(--color-primary)">
                {display?.ticketId}
              </span>
              <StatusBadge status={display?.status} size="md" />
            </div>
            <h2
              className="text-16 font-bold text-(--color-black-shade-900) leading-snug truncate"
              title={display?.subject}
            >
              {display?.subject || "Loading…"}
            </h2>
            <div className="flex items-center gap-3 flex-wrap text-13 text-(--color-black-shade-500)">
              <span>{display?.fullName}</span>
              <span className="opacity-50">·</span>
              <span>{display?.email}</span>
              <span className="opacity-50">·</span>
              <span>{formatShortDate(display?.createdAt)}</span>
              {display?.category && (
                <>
                  <span className="opacity-50">·</span>
                  <span className="inline-flex items-center rounded-full bg-(--color-black-shade-100) px-2 py-0.5 text-12 text-(--color-black-shade-600) font-medium">
                    {display.category}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-(--color-black-shade-500) hover:bg-(--color-black-shade-100) transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ── Status bar ─────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-3 bg-(--color-black-shade-50) border-b border-(--color-black-shade-100)">
          <div className="flex items-center gap-2">
            <span className="text-13 text-(--color-black-shade-500) font-medium">Status:</span>
            <TicketStatusDropdown
              value={fullTicket?.status ?? display?.status ?? "open"}
              onChange={handleStatusChange}
              disabled={changingStatus}
            />
            {changingStatus && (
              <Spinner className="h-3.5 w-3.5 border-[--color-black-shade-400]" />
            )}
          </div>
          <span className="text-13 text-(--color-black-shade-400)">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </span>
        </div>

        {/* ── Conversation thread ────────────────────────────────────────── */}
        <div
          ref={threadRef}
          className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
        >
          {loadingDetail ? (
            // Thread skeleton
            <div className="flex flex-col gap-4">
              {[60, 40, 75].map((w, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 1 ? "justify-end" : "justify-start"} animate-pulse`}
                >
                  <div
                    className={`rounded-2xl bg-(--color-black-shade-100) h-14`}
                    style={{ width: `${w}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Original user message */}
              {fullTicket && (
                <MessageBubble
                  message={{
                    message: fullTicket.message,
                    repliedBy: fullTicket.fullName,
                    createdAt: fullTicket.createdAt,
                  }}
                  isAdmin={false}
                />
              )}

              {/* Replies */}
              {replies.length === 0 && fullTicket ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-(--color-black-shade-300)"
                  >
                    <path
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-13 text-(--color-black-shade-500)">
                    No replies yet. Be the first to respond.
                  </p>
                </div>
              ) : (
                replies.map((reply, idx) => (
                  <MessageBubble
                    key={reply._id ?? idx}
                    message={reply}
                    isAdmin={reply.isAdminReply}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* ── Reply box ──────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-(--color-black-shade-100) bg-(--pure-white) px-6 py-4">
          {/* Already resolved/closed notice */}
          {(fullTicket?.status === "resolved" || fullTicket?.status === "closed") && (
            <p className="text-13 text-(--color-black-shade-400) mb-3 text-center">
              This ticket is{" "}
              <span className="font-medium text-(--color-black-shade-600)">
                {fullTicket.status}
              </span>
              . You can still send a reply.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply… (Ctrl+Enter to send)"
              rows={4}
              disabled={sendingReply || loadingDetail}
              className="w-full resize-none rounded-xl border border-(--color-black-shade-200) bg-(--color-black-shade-50) px-4 py-3 text-14 text-(--color-black-shade-800) placeholder:text-(--color-black-shade-400) outline-none focus:border-(--color-primary) focus:bg-(--pure-white) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between">
              <span className="text-12 text-(--color-black-shade-400)">
                {replyText.length > 0 && `${replyText.length} characters`}
              </span>
              <Button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sendingReply || loadingDetail}
                className="w-auto! h-10! px-6 gap-2"
              >
                {sendingReply && (
                  <Spinner className="h-3.5 w-3.5 border-white" />
                )}
                {sendingReply ? "Sending…" : "Send Reply"}
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

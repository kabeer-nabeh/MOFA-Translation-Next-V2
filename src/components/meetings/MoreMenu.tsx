"use client";

import * as React from "react";
import {
  Ban,
  Calendar,
  CalendarPlus,
  CheckCircle,
  Copy,
  Eye,
  Link2,
  MoreVertical,
  Video,
  XCircle,
} from "lucide-react";

import type { Meeting, RsvpStatus } from "@/components/meetings/meetings-data";
import { cn } from "@/lib/utils";

// ─── ICS Calendar Download ────────────────────────────────────────────────────

function _dtStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function downloadICS(meeting: Meeting): void {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MOFA//Translation//EN",
    "BEGIN:VEVENT",
    `UID:mofa-${meeting.id}@mofa.gov`,
    `DTSTAMP:${_dtStamp(new Date().toISOString())}`,
    ...(meeting.startDatetime ? [`DTSTART:${_dtStamp(meeting.startDatetime)}`] : []),
    ...(meeting.endDatetime ? [`DTEND:${_dtStamp(meeting.endDatetime)}`] : []),
    `SUMMARY:${meeting.title}`,
    `ORGANIZER;CN=${meeting.host}:mailto:organizer@mofa.gov`,
    ...(meeting.meetingLink ? [`URL:${meeting.meetingLink}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${meeting.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── More Menu ────────────────────────────────────────────────────────────────

export function MoreMenu({
  open,
  onToggle,
  meeting,
  onRsvp,
  onRequestDecline,
  onRequestCancel,
  isHost = false,
}: {
  open: boolean;
  onToggle: () => void;
  meeting?: Meeting;
  onRsvp?: (id: string, status: RsvpStatus) => void;
  onRequestDecline?: () => void;
  onRequestCancel?: () => void;
  isHost?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rsvp = meeting?.rsvpStatus ?? "pending";
  const isUpcoming = meeting?.status === "upcoming";
  const [copied, setCopied] = React.useState(false);

  const close = React.useCallback(() => {
    if (open) onToggle();
  }, [onToggle, open]);

  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onToggle();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onToggle]);

  const handleCopyLink = React.useCallback(() => {
    const link = meeting?.meetingLink;
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
    close();
  }, [meeting?.meetingLink, close]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className="flex size-8 items-center justify-center rounded-lg text-[color:var(--mofa-text-muted)] transition hover:bg-white/60"
        aria-label="More options"
        aria-expanded={open}
      >
        {copied ? (
          <CheckCircle size={16} className="text-[#067647]" />
        ) : (
          <MoreVertical size={16} />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-[188px] overflow-hidden rounded-lg border border-[color:var(--mofa-border-default)] bg-white py-1 shadow-lg">
          {isUpcoming ? (
            <>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                  meeting?.meetingLink
                    ? "text-[color:var(--mofa-text-body)] hover:bg-[color:var(--mofa-btn-outline-hover)]"
                    : "cursor-not-allowed text-[color:var(--mofa-text-disabled)]",
                )}
                onClick={meeting?.meetingLink ? handleCopyLink : undefined}
                disabled={!meeting?.meetingLink}
              >
                <Link2 size={14} aria-hidden />
                Copy meeting link
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[color:var(--mofa-text-body)] hover:bg-[color:var(--mofa-btn-outline-hover)] transition-colors"
                onClick={() => {
                  if (meeting) downloadICS(meeting);
                  close();
                }}
              >
                <CalendarPlus size={14} aria-hidden />
                Add to calendar
              </button>

              <button
                type="button"
                className="flex w-full cursor-not-allowed items-center gap-2.5 px-3 py-2 text-left text-sm text-[color:var(--mofa-text-disabled)]"
                disabled
                title="Coming soon"
              >
                <Calendar size={14} aria-hidden />
                Reschedule
              </button>

              <div className="my-1 border-t border-[color:var(--mofa-border-default)]" />

              {rsvp === "accepted" && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-[#b42318] hover:bg-[#fff1f0] transition-colors"
                  onClick={() => {
                    close();
                    onRequestDecline?.();
                  }}
                >
                  <XCircle size={14} aria-hidden />
                  Decline meeting
                </button>
              )}
              {rsvp === "declined" && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-[#067647] hover:bg-[#ecfdf3] transition-colors"
                  onClick={() => {
                    close();
                    if (meeting) onRsvp?.(meeting.id, "accepted");
                  }}
                >
                  <CheckCircle size={14} aria-hidden />
                  Revoke decline
                </button>
              )}

              {isHost && (
                <>
                  <div className="my-1 border-t border-[color:var(--mofa-border-default)]" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-[#b42318] hover:bg-[#fff1f0] transition-colors"
                    onClick={() => {
                      close();
                      onRequestCancel?.();
                    }}
                  >
                    <Ban size={14} aria-hidden />
                    Cancel meeting
                  </button>
                </>
              )}
            </>
          ) : (
            [
              { label: "Copy link", icon: <Copy size={14} aria-hidden /> },
              { label: "Download transcript", icon: <Eye size={14} aria-hidden /> },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[color:var(--mofa-text-body)] hover:bg-[color:var(--mofa-btn-outline-hover)] transition-colors"
                onClick={close}
              >
                {item.icon}
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

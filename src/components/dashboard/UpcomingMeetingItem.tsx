"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Calendar,
  CalendarPlus,
  CheckCircle,
  Globe2,
  Link2,
  Monitor,
  MoreVertical,
  User2,
  Video,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { CalendarBadgeDate, MeetingPlatform, RsvpStatus } from "@/types/meeting";

// ─── Platform Badge ──────────────────────────────────────────────────────────

const PLATFORM_STYLES: Record<
  MeetingPlatform,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  "In App": {
    bg: "#f3f3f7",
    text: "#545469",
    border: "#d5d3e8",
    icon: <Monitor size={13} className="text-[#545469]" aria-hidden />,
  },
  Teams: {
    bg: "#f0eefe",
    text: "#5b5bd6",
    border: "#c9c6f7",
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/teams.png" alt="" className="size-[13px] object-contain" />,
  },
  Beem: {
    bg: "#e8f1fd",
    text: "#1554c0",
    border: "#b8d0fb",
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/beam-logo.png" alt="Beem" className="size-[13px] object-contain" />,
  },
};

function PlatformBadge({ platform }: { platform: MeetingPlatform }) {
  const s = PLATFORM_STYLES[platform];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.icon}
      {platform}
    </span>
  );
}

// ─── Relative Time Badge ─────────────────────────────────────────────────────

type TimeState = "future" | "soon" | "live" | "ended";

function useRelativeTime(startIso?: string, endIso?: string) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return React.useMemo(() => {
    if (!startIso || !endIso) return { state: "future" as TimeState, label: "Upcoming" };

    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    if (Number.isNaN(start) || Number.isNaN(end))
      return { state: "future" as TimeState, label: "Upcoming" };

    if (now > end) return { state: "ended" as TimeState, label: "Missed" };
    if (now >= start && now <= end)
      return { state: "live" as TimeState, label: "In Progress" };

    const msUntil = start - now;
    const minutes = Math.max(1, Math.ceil(msUntil / 60_000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60)
      return {
        state: "soon" as TimeState,
        label: `Starts in ${minutes} min`,
        urgency: minutes <= 15 ? ("red" as const) : ("amber" as const),
      };

    if (hours < 24) return { state: "future" as TimeState, label: `Starts in ${hours} hr` };
    if (days === 1) return { state: "future" as TimeState, label: "Tomorrow" };
    return { state: "future" as TimeState, label: `In ${days} days` };
  }, [now, startIso, endIso]);
}

function RelativeTimeBadge({
  time,
}: {
  time: { state: TimeState; label: string; urgency?: "amber" | "red" };
}) {
  if (time.state === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#abefc6] bg-[#ecfdf3] px-2 py-0.5 text-xs font-semibold text-[#067647]">
        <span className="size-2 animate-pulse rounded-full bg-[#17b26a]" aria-hidden />
        {time.label}
      </span>
    );
  }
  if (time.state === "soon") {
    const urgent = time.urgency === "red";
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
          urgent
            ? "border-[#fecdca] bg-[#fff1f0] text-[#b42318]"
            : "border-[#fedf89] bg-[#fffaeb] text-[#b54708]",
        )}
      >
        {time.label}
      </span>
    );
  }
  if (time.state === "ended") {
    return (
      <span className="inline-flex items-center rounded-md border border-[#d5d7da] bg-white px-2 py-0.5 text-xs font-semibold text-[#717680]">
        {time.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-[#d5d3e8] bg-white px-2 py-0.5 text-xs font-semibold text-[#545469]">
      {time.label}
    </span>
  );
}

// ─── Conflict Detection ──────────────────────────────────────────────────────

function ConflictBadge() {
  return (
    <span
      title="Scheduling conflict with another meeting"
      className="inline-flex items-center gap-1 rounded-md border border-[#fedf89] bg-[#fffaeb] px-2 py-0.5 text-xs font-semibold text-[#b54708]"
    >
      <AlertTriangle size={11} aria-hidden />
      Conflict
    </span>
  );
}

// ─── Decline Confirmation Modal ──────────────────────────────────────────────

function DeclineConfirmModal({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0a0d12]/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decline-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#e9eaeb] bg-white p-6 shadow-[0_24px_64px_rgba(10,13,18,0.24)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="decline-title" className="text-lg font-semibold text-[#414651]">
          Decline this meeting?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#535862]">
          You are about to decline &ldquo;{title}&rdquo;. You can revoke the
          decline later from the meeting menu.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="border-[#b42318] bg-[#b42318] hover:bg-[#912018]"
            onClick={onConfirm}
          >
            Decline meeting
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── More Menu ───────────────────────────────────────────────────────────────

function MoreMenu({
  open,
  onToggle,
  rsvp,
  onAccept,
  onRequestDecline,
}: {
  open: boolean;
  onToggle: () => void;
  rsvp: RsvpStatus;
  onAccept: () => void;
  onRequestDecline: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        className="flex size-8 items-center justify-center rounded-lg text-[#717680] transition hover:bg-white/60"
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
        <div className="absolute right-0 top-12 z-50 min-w-[188px] overflow-hidden rounded-lg border border-[#e9eaeb] bg-white py-1 shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#414651] transition-colors hover:bg-[#f3f3f7]"
            onClick={() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
              onToggle();
            }}
          >
            <Link2 size={14} aria-hidden />
            Copy meeting link
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#414651] transition-colors hover:bg-[#f3f3f7]"
            onClick={onToggle}
          >
            <CalendarPlus size={14} aria-hidden />
            Add to calendar
          </button>
          <div className="my-1 border-t border-[#f0f0f4]" />
          {rsvp === "accepted" && (
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-[#b42318] transition-colors hover:bg-[#fff1f0]"
              onClick={() => {
                onToggle();
                onRequestDecline();
              }}
            >
              <XCircle size={14} aria-hidden />
              Decline meeting
            </button>
          )}
          {rsvp === "declined" && (
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-[#067647] transition-colors hover:bg-[#ecfdf3]"
              onClick={() => {
                onToggle();
                onAccept();
              }}
            >
              <CheckCircle size={14} aria-hidden />
              Revoke decline
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export type UpcomingMeetingItemProps = {
  className?: string;
  id: string;
  date: CalendarBadgeDate;
  title: string;
  dateTimeLabel: string;
  hostLabel: string;
  languageLabel: string;
  /** Platform badge (In App, Teams, Beem) */
  platform?: MeetingPlatform;
  /** ISO start datetime — drives relative time badge */
  startDatetime?: string;
  /** ISO end datetime */
  endDatetime?: string;
  /** Initial RSVP status */
  initialRsvp?: RsvpStatus;
  /** Whether this meeting conflicts with another */
  isConflict?: boolean;
  /** Meeting link for external platforms */
  meetingLink?: string;
  /** Href for in-app meetings */
  detailHref?: string;
};

export function UpcomingMeetingItem({
  className,
  id,
  date,
  title,
  dateTimeLabel,
  hostLabel,
  languageLabel,
  platform,
  startDatetime,
  endDatetime,
  initialRsvp = "pending",
  isConflict = false,
  meetingLink,
  detailHref,
}: UpcomingMeetingItemProps) {
  const [rsvp, setRsvp] = React.useState<RsvpStatus>(initialRsvp);
  const [displayedRsvp, setDisplayedRsvp] = React.useState<RsvpStatus>(initialRsvp);
  const [rsvpFading, setRsvpFading] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [declineOpen, setDeclineOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const relativeTime = useRelativeTime(startDatetime, endDatetime);
  const isLive = relativeTime.state === "live";
  const isSoon = relativeTime.state === "soon";
  const isEnded = relativeTime.state === "ended";

  // Smooth RSVP transition
  React.useEffect(() => {
    if (rsvp === displayedRsvp) return;
    setRsvpFading(true);
    const timer = window.setTimeout(() => {
      setDisplayedRsvp(rsvp);
      window.requestAnimationFrame(() => setRsvpFading(false));
    }, 140);
    return () => window.clearTimeout(timer);
  }, [rsvp, displayedRsvp]);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleAccept = () => {
    setRsvp("accepted");
    setToast("Meeting accepted");
  };

  const handleDecline = () => {
    setRsvp("declined");
    setToast("Meeting declined");
  };

  // Whether to show "Join" instead of "Accepted" badge
  const showJoin = displayedRsvp === "accepted" && (isLive || isSoon || isEnded);

  return (
    <>
      <Card
        className={cn(
          "border-0 bg-[#f3f3f7] transition",
          isEnded && "opacity-65 grayscale",
          className,
        )}
      >
        <Card.Content className="flex items-center gap-6 p-6">
          {/* Date chip */}
          <div className="w-16 shrink-0 overflow-hidden rounded-md border border-[#e9eaeb] bg-white shadow-[0_0_0_2px_white,0_0_0_4px_#8988ab]">
            <div className="flex items-center justify-center bg-[#e7e7ee] px-2 pb-0.5 pt-1 text-xs font-semibold uppercase tracking-wide text-[#717680]">
              {date.monthShort}
            </div>
            <div className="flex items-center justify-center pb-[3px] pt-px text-lg font-bold leading-7 text-[#545469]">
              {date.day}
            </div>
          </div>

          {/* Meeting info */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* Title + badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <p className="line-clamp-1 text-lg font-semibold leading-7 text-[#414651]">
                {title}
              </p>
              {platform && <PlatformBadge platform={platform} />}
              <RelativeTimeBadge time={relativeTime} />
              {isConflict && <ConflictBadge />}
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#414651]">
              <div className="flex items-center gap-1">
                <Calendar size={16} aria-hidden="true" className="shrink-0 text-[#717680]" />
                <span>{dateTimeLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <User2 size={16} aria-hidden="true" className="shrink-0 text-[#717680]" />
                <span>{hostLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe2 size={16} aria-hidden="true" className="shrink-0 text-[#717680]" />
                <span>{languageLabel}</span>
              </div>
            </div>
          </div>

          {/* RSVP actions */}
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 transition-opacity duration-150 ease-out",
                rsvpFading ? "opacity-0" : "opacity-100",
              )}
            >
              {displayedRsvp === "pending" && (
                <>
                  <Button variant="secondary" size="md" className="gap-2" onClick={handleAccept}>
                    <CheckCircle size={16} className="text-[#067647]" aria-hidden />
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="gap-2"
                    onClick={() => setDeclineOpen(true)}
                  >
                    <XCircle size={16} className="text-[#b42318]" aria-hidden />
                    Decline
                  </Button>
                </>
              )}

              {displayedRsvp === "accepted" && !showJoin && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#abefc6] bg-[#ecfdf3] px-3 py-1.5 text-sm font-medium text-[#067647]">
                  <CheckCircle size={14} aria-hidden />
                  Accepted
                </span>
              )}

              {showJoin && platform === "In App" && (
                <ButtonLink
                  href={detailHref ?? `/meetings/${id}`}
                  variant="secondary"
                  size="md"
                  className="gap-2 no-underline"
                >
                  <Monitor size={16} aria-hidden />
                  Open Meeting Room
                </ButtonLink>
              )}

              {showJoin && platform !== "In App" && meetingLink && (
                <ButtonLink
                  href={meetingLink}
                  variant="secondary"
                  size="md"
                  className="gap-2 no-underline"
                  rel="noreferrer"
                  target="_blank"
                >
                  <Video size={16} aria-hidden />
                  Join Meeting
                </ButtonLink>
              )}

              {showJoin && platform !== "In App" && !meetingLink && (
                <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[#d5d7da] bg-white px-3 py-2 text-sm font-semibold text-[#a4a7ae] opacity-60 select-none">
                  <Video size={16} aria-hidden />
                  Link unavailable
                </span>
              )}

              {displayedRsvp === "declined" && (
                <span className="rounded-md border border-[#fecdca] bg-[#fff1f0] px-3 py-1.5 text-sm font-medium text-[#b42318]">
                  Declined
                </span>
              )}
            </div>

            <MoreMenu
              open={menuOpen}
              onToggle={() => setMenuOpen((v) => !v)}
              rsvp={displayedRsvp}
              onAccept={handleAccept}
              onRequestDecline={() => setDeclineOpen(true)}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Decline confirmation */}
      {declineOpen && (
        <DeclineConfirmModal
          title={title}
          onCancel={() => setDeclineOpen(false)}
          onConfirm={() => {
            setDeclineOpen(false);
            handleDecline();
          }}
        />
      )}

      {/* Toast */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 transition-all duration-200 ease-out",
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        {toast ? (
          <div className="rounded-lg border border-[#d5d7da] bg-white px-4 py-3 text-sm font-semibold text-[#414651] shadow-[0_12px_30px_rgba(10,13,18,0.16)]">
            {toast}
          </div>
        ) : null}
      </div>
    </>
  );
}

"use client";

import * as React from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  Eye,
  Filter,
  Globe,
  Monitor,
  Plus,
  Search,
  User,
  Video,
  XCircle,
} from "lucide-react";

import {
  type Meeting,
  type MeetingPlatform,
  type MeetingStatus,
  type RsvpStatus,
  MEETINGS,
} from "@/components/meetings/meetings-data";
import { DeclineConfirmationModal, CancelMeetingModal } from "@/components/meetings/ConfirmationDialogs";
import { MoreMenu } from "@/components/meetings/MoreMenu";
import { NewMeetingModal } from "@/components/meetings/NewMeetingModal";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

// ─── Platform Badge ───────────────────────────────────────────────────────────

/** Mirrors the LOCATION options in NewMeetingModal exactly */
const PLATFORM_STYLES: Record<
  MeetingPlatform,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  "In App": {
    bg: "#ECEAE5",
    text: "#52525B",
    border: "var(--mofa-border-default)",
    icon: <Monitor size={13} className="text-[color:var(--mofa-text-secondary)]" aria-hidden />,
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
  const style = PLATFORM_STYLES[platform];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {style.icon}
      {platform}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Relative Meeting Time ───────────────────────────────────────────────────

type MeetingTimeState = "future" | "soon" | "live" | "ended";

type RelativeMeetingTime = {
  state: MeetingTimeState;
  label: string;
  urgency?: "amber" | "red";
};

function formatRelativeFuture(msUntilStart: number): string {
  const minutes = Math.max(1, Math.ceil(msUntilStart / 60_000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `Starts in ${minutes} min`;
  if (hours < 24) return `Starts in ${hours} hr`;
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function getRelativeMeetingTime(meeting: Meeting, now: number): RelativeMeetingTime {
  if (!meeting.startDatetime || !meeting.endDatetime) {
    return { state: "future", label: "Upcoming" };
  }

  const start = new Date(meeting.startDatetime).getTime();
  const end = new Date(meeting.endDatetime).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { state: "future", label: "Upcoming" };
  }

  if (now > end) return { state: "ended", label: "Missed" };
  if (now >= start && now <= end) return { state: "live", label: "In Progress" };

  const msUntilStart = start - now;
  if (msUntilStart <= 60 * 60_000) {
    const minutes = Math.max(1, Math.ceil(msUntilStart / 60_000));
    return {
      state: "soon",
      label: `Starts in ${minutes} min`,
      urgency: minutes <= 15 ? "red" : "amber",
    };
  }

  return { state: "future", label: formatRelativeFuture(msUntilStart) };
}

function useRelativeTime(meeting: Meeting): RelativeMeetingTime {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return React.useMemo(() => getRelativeMeetingTime(meeting, now), [meeting, now]);
}

function getMeetingStartTime(meeting: Meeting): number {
  if (!meeting.startDatetime) return Number.POSITIVE_INFINITY;
  const time = new Date(meeting.startDatetime).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

export function sortMeetingsForTab(meetings: Meeting[], activeTab: MeetingStatus): Meeting[] {
  if (activeTab !== "upcoming") return meetings;

  const now = Date.now();
  const rank = (meeting: Meeting) => {
    const state = getRelativeMeetingTime(meeting, now).state;
    if (state === "live") return 0;
    if (state === "ended") return 2;
    return 1;
  };

  return [...meetings].sort((a, b) => {
    const rankDelta = rank(a) - rank(b);
    if (rankDelta !== 0) return rankDelta;

    const aStart = getMeetingStartTime(a);
    const bStart = getMeetingStartTime(b);
    const aEnded = getRelativeMeetingTime(a, now).state === "ended";
    const bEnded = getRelativeMeetingTime(b, now).state === "ended";

    if (aEnded && bEnded) return bStart - aStart;
    return aStart - bStart;
  });
}

// ─── Current logged-in user (demo) ───────────────────────────────────────────

export const CURRENT_USER = "Abdullah Al Harbi";

// ─── Conflict Detection ───────────────────────────────────────────────────────

export function getConflictIds(meetings: Meeting[]): Set<string> {
  const upcoming = meetings.filter(
    (m) => m.status === "upcoming" && m.startDatetime && m.endDatetime,
  );
  const ids = new Set<string>();
  for (let i = 0; i < upcoming.length; i++) {
    for (let j = i + 1; j < upcoming.length; j++) {
      const a = upcoming[i];
      const b = upcoming[j];
      const aS = +new Date(a.startDatetime!);
      const aE = +new Date(a.endDatetime!);
      const bS = +new Date(b.startDatetime!);
      const bE = +new Date(b.endDatetime!);
      // Overlap: a starts before b ends AND a ends after b starts
      if (aS < bE && aE > bS) {
        ids.add(a.id);
        ids.add(b.id);
      }
    }
  }
  return ids;
}

function RelativeTimeChip({ time }: { time: RelativeMeetingTime }) {
  if (time.state === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#abefc6] bg-[#ecfdf3] px-2 py-0.5 text-xs font-semibold text-[#067647]">
        <span className="size-2 rounded-full bg-[#17b26a] animate-pulse" aria-hidden />
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
      <span className="inline-flex items-center rounded-md border border-[color:var(--mofa-border-default)] bg-white px-2 py-0.5 text-xs font-semibold text-[color:var(--mofa-text-muted)]">
        {time.label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-[color:var(--mofa-border-default)] bg-white px-2 py-0.5 text-xs font-semibold text-[color:var(--mofa-text-secondary)]">
      {time.label}
    </span>
  );
}

// ─── Participant Avatars ──────────────────────────────────────────────────────

function ParticipantAvatars({
  participants,
  total,
}: {
  participants: Meeting["participants"];
  total: number;
}) {
  const visible = participants.slice(0, 3);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {visible.map((p, i) => (
          <div
            key={p.id}
            className="flex size-8 items-center justify-center rounded-full border-2 border-[color:var(--mofa-btn-outline-hover)] text-[10px] font-semibold text-[color:var(--mofa-text-body)]"
            style={{
              backgroundColor: p.bg,
              marginLeft: i > 0 ? "-8px" : 0,
              zIndex: visible.length - i,
              position: "relative",
            }}
            title={p.initials}
          >
            {p.initials}
          </div>
        ))}
      </div>
      <span className="text-sm text-[color:var(--mofa-text-body)]">
        <span className="font-semibold">{total}</span> {total === 1 ? "Participant" : "Participants"}
      </span>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MeetingStatus }) {
  if (status === "completed") {
    return (
      <span className="rounded-md border border-[#abefc6] bg-[#ecfdf3] px-2 py-0.5 text-sm font-medium text-[#067647]">
        Completed
      </span>
    );
  }
  return (
    <span className="rounded-md border border-[#b2ddff] bg-[#eff8ff] px-2 py-0.5 text-sm font-medium text-[#175cd3]">
      Upcoming
    </span>
  );
}

// ─── Date Chip ────────────────────────────────────────────────────────────────

function DateChipBadge({ month, day }: { month: string; day: number }) {
  return (
    <div
      className="flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-lg border bg-white"
      style={{
        borderColor: "var(--mofa-border-default)",
        boxShadow: "0 0 0 2px #F5F4F1, 0 0 0 3px #C8C4BC",
      }}
    >
      <div
        className="flex w-full items-center justify-center pb-0.5 pt-1 px-2"
        style={{ background: "var(--mofa-sidebar-active-bg)" }}
      >
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--mofa-text-muted)" }}>
          {month}
        </span>
      </div>
      <div className="flex w-full items-center justify-center pb-[3px] pt-px px-2">
        <span className="text-lg font-bold leading-7" style={{ color: "var(--mofa-text-primary)" }}>{day}</span>
      </div>
    </div>
  );
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────

export function MeetingCard({
  meeting,
  onRsvp,
  isConflict = false,
  currentUser = CURRENT_USER,
}: {
  meeting: Meeting;
  onRsvp: (id: string, status: RsvpStatus) => void;
  isConflict?: boolean;
  currentUser?: string;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [declineConfirmOpen, setDeclineConfirmOpen] = React.useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false);
  const rsvp = meeting.rsvpStatus ?? "pending";
  const [displayedRsvp, setDisplayedRsvp] = React.useState<RsvpStatus>(rsvp);
  const [rsvpFading, setRsvpFading] = React.useState(false);
  const relativeTime = useRelativeTime(meeting);
  const isEnded = meeting.status === "upcoming" && relativeTime.state === "ended";
  const isLive = meeting.status === "upcoming" && relativeTime.state === "live";
  const isHost = meeting.host === currentUser;

  React.useEffect(() => {
    if (rsvp === displayedRsvp) return;

    setRsvpFading(true);
    const swapTimer = window.setTimeout(() => {
      setDisplayedRsvp(rsvp);
      window.requestAnimationFrame(() => setRsvpFading(false));
    }, 140);

    return () => window.clearTimeout(swapTimer);
  }, [displayedRsvp, rsvp]);

  // ── Completed card ──────────────────────────────────────────────────────────
  if (meeting.status === "completed") {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-[color:var(--mofa-border-default)] border bg-[#F5F4F1] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="line-clamp-1 text-lg font-semibold text-[color:var(--mofa-text-body)]"
                title={meeting.title}
              >
                {meeting.title}
              </h3>
              {meeting.platform && <PlatformBadge platform={meeting.platform} />}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-[color:var(--mofa-text-body)]">
                <Calendar size={16} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
                <span>{meeting.date} • {meeting.timeRange}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-[color:var(--mofa-text-body)]">
                <User size={16} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
                <span>Host: {meeting.host}</span>
              </div>
              {meeting.languages && (
                <div className="flex items-center gap-1 text-sm text-[color:var(--mofa-text-body)]">
                  <Globe size={16} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
                  <span>Language: {meeting.languages}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <MoreMenu open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} meeting={meeting} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <ParticipantAvatars participants={meeting.participants} total={meeting.participantCount} />
          <ButtonLink href={`/meetings/${meeting.id}`} variant="secondary" size="sm" className="gap-1.5 px-3 no-underline">
            <Eye size={16} aria-hidden />
            View Details
          </ButtonLink>
        </div>
      </div>
    );
  }

  // ── Upcoming card ───────────────────────────────────────────────────────────
  const chip = meeting.dateChip;

  return (
    <div
      className={cn(
        "flex items-center gap-6 rounded-xl border-[color:var(--mofa-border-default)] border bg-[#F5F4F1] p-6 transition",
        isEnded && "opacity-65 grayscale",
      )}
    >
      {/* Date chip */}
      {chip && <DateChipBadge month={chip.month} day={chip.day} />}

      {/* Meeting info */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className="line-clamp-1 text-lg font-semibold text-[color:var(--mofa-text-body)]"
            title={meeting.title}
          >
            {meeting.title}
          </h3>
          {meeting.platform && <PlatformBadge platform={meeting.platform} />}
          <RelativeTimeChip time={relativeTime} />
          {/* Conflict badge */}
          {isConflict && (
            <span
              title="Scheduling conflict with another meeting"
              className="inline-flex items-center gap-1 rounded-md border border-[#fedf89] bg-[#fffaeb] px-2 py-0.5 text-xs font-semibold text-[#b54708]"
            >
              <AlertTriangle size={11} aria-hidden />
              Conflict
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-[color:var(--mofa-text-body)]">
            <Calendar size={16} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
            <span>{meeting.date} • {meeting.timeRange}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-[color:var(--mofa-text-body)]">
            <User size={16} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
            <span>Host: {meeting.host}</span>
          </div>
          {meeting.languages && (
            <div className="flex items-center gap-1 text-sm text-[color:var(--mofa-text-body)]">
              <Globe size={16} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
              <span>Language: {meeting.languages}</span>
            </div>
          )}
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
              <Button
                variant="secondary"
                size="md"
                className="gap-2"
                onClick={() => onRsvp(meeting.id, "accepted")}
              >
                <CheckCircle size={16} className="text-[#067647]" aria-hidden />
                Accept
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="gap-2"
                onClick={() => setDeclineConfirmOpen(true)}
              >
                <XCircle size={16} className="text-[#b42318]" aria-hidden />
                Decline
              </Button>
            </>
          )}

          {displayedRsvp === "accepted" && (
            <>
              {/* Future (days away): show quiet Accepted badge only */}
              {relativeTime.state === "future" ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#abefc6] bg-[#ecfdf3] px-3 py-1.5 text-sm font-medium text-[#067647]">
                  <CheckCircle size={14} aria-hidden />
                  Accepted
                </span>
              ) : (
                /* Soon / Live / Ended: show the Join button */
                meeting.platform === "In App" ? (
                  <ButtonLink
                    href={`/meetings/${meeting.id}`}
                    variant="secondary"
                    size="md"
                    className={cn(
                      "gap-2 no-underline",
                    )}
                  >
                    <Monitor size={16} aria-hidden />
                    Open Meeting Room
                  </ButtonLink>
                ) : meeting.meetingLink ? (
                  <ButtonLink
                    href={meeting.meetingLink}
                    variant="secondary"
                    size="md"
                    className="gap-2 no-underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Video size={16} aria-hidden />
                    Join Meeting
                  </ButtonLink>
                ) : (
                  <span
                    title="Meeting link not available"
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--mofa-text-disabled)] opacity-60 select-none"
                  >
                    <Video size={16} aria-hidden />
                    Link unavailable
                  </span>
                )
              )}
            </>
          )}

          {displayedRsvp === "declined" && (
            <>
              <span className="rounded-md border border-[#fecdca] bg-[#fff1f0] px-3 py-1.5 text-sm font-medium text-[#b42318]">
                Declined
              </span>
            </>
          )}
        </div>

        <MoreMenu
          open={menuOpen}
          onToggle={() => setMenuOpen((v) => !v)}
          meeting={{ ...meeting, rsvpStatus: displayedRsvp }}
          onRsvp={onRsvp}
          onRequestDecline={() => setDeclineConfirmOpen(true)}
          onRequestCancel={() => setCancelConfirmOpen(true)}
          isHost={isHost}
        />
      </div>

      {declineConfirmOpen ? (
        <DeclineConfirmationModal
          meetingTitle={meeting.title}
          onCancel={() => setDeclineConfirmOpen(false)}
          onConfirm={() => {
            setDeclineConfirmOpen(false);
            onRsvp(meeting.id, "declined");
          }}
        />
      ) : null}

      {cancelConfirmOpen ? (
        <CancelMeetingModal
          meetingTitle={meeting.title}
          onCancel={() => setCancelConfirmOpen(false)}
          onConfirm={() => {
            setCancelConfirmOpen(false);
            // In a real app this would call an API; for demo we just close
          }}
        />
      ) : null}
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

const TABS: { id: MeetingStatus; label: string }[] = [
  { id: "completed", label: "Complete Meetings" },
  { id: "upcoming", label: "Upcoming Meetings" },
];

// ─── Main page ─────────────────────────────────────────────────────────────────

export function MeetingsPageClient() {
  const [activeTab, setActiveTab] = React.useState<MeetingStatus>("completed");
  const [search, setSearch] = React.useState("");
  const [newMeetingOpen, setNewMeetingOpen] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [rsvpFilter, setRsvpFilter] = React.useState<"all" | "pending" | "accepted" | "declined">("all");
  const [toast, setToast] = React.useState<{ id: number; message: string } | null>(null);
  const filtersRef = React.useRef<HTMLDivElement>(null);

  // Precompute scheduling conflicts (stable — meetings data is static)
  const conflictIds = React.useMemo(() => getConflictIds(MEETINGS), []);

  // Track RSVP state per meeting id (overrides the data default)
  const [rsvpOverrides, setRsvpOverrides] = React.useState<Record<string, RsvpStatus>>({});
  const handleRsvp = (id: string, status: RsvpStatus) => {
    setRsvpOverrides((prev) => ({ ...prev, [id]: status }));
    setToast({
      id: Date.now(),
      message: status === "accepted" ? "Meeting accepted" : "Meeting declined",
    });
  };

  React.useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Close filters dropdown on outside click
  React.useEffect(() => {
    if (!filtersOpen) return;
    function handler(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filtersOpen]);

  const filtered = sortMeetingsForTab(
    MEETINGS.filter(
      (m) =>
        m.status === activeTab &&
        m.title.toLowerCase().includes(search.toLowerCase()) &&
        // Apply RSVP filter only for upcoming meetings
        (activeTab === "upcoming"
          ? rsvpFilter === "all" || m.rsvpStatus === rsvpFilter
          : true),
    ),
    activeTab,
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-6 pt-6">
      <div className="flex shrink-0 flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-[color:var(--mofa-text-body)]">All Your Meetings</h1>
            <p className="text-xs text-[color:var(--mofa-text-subtle)]">Showing all your meetings across organizations</p>
          </div>

          {/* Actions - New Meeting button only */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              className="gap-2"
              onClick={() => setNewMeetingOpen(true)}
            >
              <Plus size={16} aria-hidden />
              New Meeting
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[color:var(--mofa-border-default)]">
          <div className="flex gap-3">
            {TABS.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "pb-3 pt-1 text-sm font-semibold transition",
                    active
                      ? "border-b-2 border-[color:var(--mofa-text-primary)] text-[color:var(--mofa-text-primary)]"
                      : "text-[color:var(--mofa-text-muted)] hover:text-[color:var(--mofa-text-body)]",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-xs",
                      active ? "bg-[#e9e9f0] text-[color:var(--mofa-text-secondary)]" : "bg-[#f0f0f4] text-[color:var(--mofa-text-muted)]",
                    )}
                  >
                    {tab.id === "upcoming" && rsvpFilter !== "all"
                      ? `${filtered.length} of ${MEETINGS.filter((m) => m.status === tab.id).length}`
                      : MEETINGS.filter((m) => m.status === tab.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filter Controls - Below Tabs */}
        <div className="flex flex-col gap-3">
          {/* Search and Filters row */}
          <div className="flex items-center justify-between gap-3">
            {/* Search - Left side */}
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--mofa-text-muted)]"
                aria-hidden
              />
              <input
                type="search"
                aria-label="Search meetings"
                placeholder="Search for meetings"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-[color:var(--mofa-border-default)] bg-white pl-9 pr-3 text-sm text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_0_rgba(10,13,18,0.05)] outline-none placeholder:text-[color:var(--mofa-text-muted)] focus:ring-2 focus:ring-[#6f6e8a]/30"
              />
            </div>

            {/* Filters button - Right side */}
            <div className="relative" ref={filtersRef}>
              <Button
                variant="secondary"
                size="md"
                className="gap-2"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                <Filter size={16} aria-hidden />
                Filters
                <ChevronDown size={14} className={cn("transition-transform", filtersOpen && "rotate-180")} aria-hidden />
              </Button>
              {filtersOpen && (
                <div className="absolute right-0 top-12 z-50 min-w-[200px] overflow-hidden rounded-lg border border-[color:var(--mofa-border-default)] bg-white py-1 shadow-lg">
                  {(activeTab === "completed"
                    ? ["This week", "This month", "Last 3 months", "All time"]
                    : ["Accepted", "Declined", "Pending", "All"]
                  ).map((opt) => {
                    const filterValue = opt.toLowerCase() === "all" ? "all" : (opt.toLowerCase() as "accepted" | "declined" | "pending");
                    const isActive = activeTab === "upcoming" && rsvpFilter === filterValue;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                          isActive ? "bg-[#e9e9f0] text-[color:var(--mofa-text-secondary)] font-medium" : "text-[color:var(--mofa-text-body)] hover:bg-[color:var(--mofa-btn-outline-hover)]",
                        )}
                        onClick={() => {
                          if (activeTab === "upcoming") {
                            setRsvpFilter(filterValue);
                          }
                          setFiltersOpen(false);
                        }}
                      >
                        {opt}
                        {isActive && <CheckCircle size={14} aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active filter indicator and clear button */}
          {activeTab === "upcoming" && rsvpFilter !== "all" && (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] px-3 py-1 text-xs font-medium text-[color:var(--mofa-text-secondary)]">
                {rsvpFilter.charAt(0).toUpperCase() + rsvpFilter.slice(1)}
              </span>
              <button
                type="button"
                onClick={() => setRsvpFilter("all")}
                className="text-xs text-[color:var(--mofa-text-muted)] hover:text-[color:var(--mofa-text-body)] underline transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meeting cards */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-16 pr-2">
        <div className="flex flex-col gap-4">
          {filtered.length > 0 ? (
            filtered.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={
                  rsvpOverrides[meeting.id]
                    ? { ...meeting, rsvpStatus: rsvpOverrides[meeting.id] }
                    : meeting
                }
                onRsvp={handleRsvp}
                isConflict={conflictIds.has(meeting.id)}
                currentUser={CURRENT_USER}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-btn-outline-hover)] px-6 py-16 text-center">
              <p className="text-sm font-medium text-[color:var(--mofa-text-body)]">No meetings found</p>
              <p className="mt-1 text-sm text-[color:var(--mofa-text-muted)]">
                {search && rsvpFilter !== "all"
                  ? `No ${rsvpFilter} meetings matching "${search}".`
                  : search
                  ? `No meetings found for "${search}".`
                  : rsvpFilter !== "all"
                  ? `No ${rsvpFilter} meetings yet.`
                  : "No meetings in this category yet."}
              </p>
              {(search || rsvpFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setRsvpFilter("all"); }}
                  className="mt-3 text-sm text-[color:var(--mofa-text-muted)] underline hover:text-[color:var(--mofa-text-body)] transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <NewMeetingModal open={newMeetingOpen} onClose={() => setNewMeetingOpen(false)} />

      <div
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 transition-all duration-200 ease-out",
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        {toast ? (
          <div className="rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_12px_30px_rgba(10,13,18,0.16)]">
            {toast.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

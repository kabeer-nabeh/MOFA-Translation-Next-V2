"use client";

import * as React from "react";
import {
  AlertTriangle,
  Ban,
  Calendar,
  CalendarPlus,
  CheckCircle,
  ChevronDown,
  Copy,
  Eye,
  Filter,
  Globe,
  Link2,
  Monitor,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  SkipBack,
  SkipForward,
  User,
  Video,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";

import {
  type Meeting,
  type MeetingPlatform,
  type MeetingStatus,
  type RsvpStatus,
  MEETINGS,
} from "@/components/meetings/meetings-data";
import { NewMeetingModal } from "@/components/meetings/NewMeetingModal";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

// ─── Waveform SVG ────────────────────────────────────────────────────────────

/** Seed-based pseudo-random waveform so each meeting gets a unique but stable pattern */
function generateWaveform(seed: string, barCount = 125): number[] {
  // simple hash from string
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < barCount; i++) {
    // xorshift-style PRNG
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    const v = Math.abs(h % 28) + 2; // range 2–30
    bars.push(v);
  }
  return bars;
}

const BAR_W = 0.6;
const BAR_GAP = 1.8;
const SVG_H = 32;

function InteractiveWaveform({
  bars,
  progress,
  onSeek,
}: {
  bars: number[];
  progress: number;
  onSeek: (p: number) => void;
}) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const dragging = React.useRef(false);

  const posToProgress = React.useCallback(
    (clientX: number) => {
      if (!svgRef.current) return 0;
      const rect = svgRef.current.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    onSeek(posToProgress(e.clientX));
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    onSeek(posToProgress(e.clientX));
  };
  const handlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <svg
      ref={svgRef}
      className="h-8 w-full cursor-pointer"
      viewBox={`0 0 ${bars.length * BAR_GAP} ${SVG_H}`}
      preserveAspectRatio="none"
      aria-hidden
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {bars.map((h, i) => {
        const x = i * BAR_GAP + 0.5;
        const y = (SVG_H - h) / 2;
        const filled = i / bars.length <= progress;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={BAR_W}
            height={h}
            rx={0.3}
            fill={filled ? "#545469" : "#c8c7d8"}
          />
        );
      })}
    </svg>
  );
}

// ─── Platform Badge ───────────────────────────────────────────────────────────

/** Mirrors the LOCATION options in NewMeetingModal exactly */
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
  Beam: {
    bg: "#e8f1fd",
    text: "#1554c0",
    border: "#b8d0fb",
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/beam-logo.png" alt="" className="size-[13px] object-contain" aria-hidden />,
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

/** Parse "mm:ss" → total seconds */
function parseDuration(d: string): number {
  const parts = d.split(":").map(Number);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  return 0;
}

/** Format seconds → "mm:ss" */
function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

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

function sortMeetingsForTab(meetings: Meeting[], activeTab: MeetingStatus): Meeting[] {
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

const CURRENT_USER = "Abdullah Al Harbi";

// ─── ICS Calendar Download ────────────────────────────────────────────────────

function _dtStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function downloadICS(meeting: Meeting): void {
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

// ─── Conflict Detection ───────────────────────────────────────────────────────

function getConflictIds(meetings: Meeting[]): Set<string> {
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

// ─── Audio Player ────────────────────────────────────────────────────────────

function AudioPlayer({ duration, meetingId }: { duration: string; meetingId: string }) {
  const totalSec = React.useMemo(() => parseDuration(duration), [duration]);
  const bars = React.useMemo(() => generateWaveform(meetingId), [meetingId]);

  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // 0‑1
  const [muted, setMuted] = React.useState(false);
  const [speed, setSpeed] = React.useState<number>(1);
  const [speedMenuOpen, setSpeedMenuOpen] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const speedMenuRef = React.useRef<HTMLDivElement>(null);

  // ── playback tick ──
  const startPlayback = React.useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPlaying(false);
          return 0;
        }
        // each tick = 50ms real time; advance by speed factor
        return Math.min(1, prev + (0.05 * speed) / totalSec);
      });
    }, 50);
  }, [speed, totalSec]);

  const toggle = () => {
    setPlaying((p) => {
      if (!p) {
        startPlayback();
      } else {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      }
      return !p;
    });
  };

  // re-sync interval when speed changes mid-play
  React.useEffect(() => {
    if (playing) startPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  React.useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // ── seek via waveform ──
  const handleSeek = React.useCallback((p: number) => setProgress(p), []);

  // ── skip ±10s ──
  const skip = (delta: number) => {
    setProgress((prev) => Math.max(0, Math.min(1, prev + delta / totalSec)));
  };

  // close speed menu on outside click
  React.useEffect(() => {
    if (!speedMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setSpeedMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [speedMenuOpen]);

  const elapsed = fmtTime(progress * totalSec);
  const total = fmtTime(totalSec);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e9eaeb] bg-white px-4 py-3">
      {/* Play / Pause */}
      <button
        type="button"
        onClick={toggle}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#48476e] text-white transition hover:bg-[#3f3e63] active:scale-95"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
      </button>

      {/* Rewind 10s */}
      <button
        type="button"
        onClick={() => skip(-10)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#717680] transition hover:bg-[#f3f3f7] hover:text-[#414651]"
        aria-label="Rewind 10 seconds"
      >
        <SkipBack size={14} />
      </button>

      {/* Waveform (clickable + draggable) */}
      <div className="min-w-0 flex-1">
        <InteractiveWaveform bars={bars} progress={progress} onSeek={handleSeek} />
      </div>

      {/* Forward 10s */}
      <button
        type="button"
        onClick={() => skip(10)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#717680] transition hover:bg-[#f3f3f7] hover:text-[#414651]"
        aria-label="Forward 10 seconds"
      >
        <SkipForward size={14} />
      </button>

      {/* Elapsed / Total */}
      <span className="shrink-0 tabular-nums text-xs font-medium text-[#717680]">
        {elapsed} / {total}
      </span>

      {/* Speed */}
      <div className="relative" ref={speedMenuRef}>
        <button
          type="button"
          onClick={() => setSpeedMenuOpen((v) => !v)}
          className="flex h-7 items-center justify-center rounded-md border border-[#e0dde8] bg-[#f8f8fb] px-1.5 text-[11px] font-semibold text-[#545469] transition hover:bg-[#eeedf5]"
          aria-label="Playback speed"
        >
          {speed}x
        </button>
        {speedMenuOpen && (
          <div className="absolute bottom-full right-0 mb-1 z-50 min-w-[56px] overflow-hidden rounded-lg border border-[#e9eaeb] bg-white py-1 shadow-lg">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={cn(
                  "flex w-full items-center justify-center px-2 py-1.5 text-xs",
                  s === speed
                    ? "bg-[#f3f3f7] font-semibold text-[#545469]"
                    : "text-[#717680] hover:bg-[#f8f8fb]",
                )}
                onClick={() => { setSpeed(s); setSpeedMenuOpen(false); }}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mute / Unmute */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#717680] transition hover:bg-[#f3f3f7] hover:text-[#414651]"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
    </div>
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
            className="flex size-8 items-center justify-center rounded-full border-2 border-[#f3f3f7] text-[10px] font-semibold text-[#414651]"
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
      <span className="text-sm text-[#414651]">
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

// ─── More Menu ────────────────────────────────────────────────────────────────

function MoreMenu({
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
        <div className="absolute right-0 top-9 z-50 min-w-[188px] overflow-hidden rounded-lg border border-[#e9eaeb] bg-white py-1 shadow-lg">
          {isUpcoming ? (
            <>
              {/* Copy meeting link */}
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                  meeting?.meetingLink
                    ? "text-[#414651] hover:bg-[#f3f3f7]"
                    : "cursor-not-allowed text-[#a4a7ae]",
                )}
                onClick={meeting?.meetingLink ? handleCopyLink : undefined}
                disabled={!meeting?.meetingLink}
              >
                <Link2 size={14} aria-hidden />
                Copy meeting link
              </button>

              {/* Add to calendar */}
              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#414651] hover:bg-[#f3f3f7] transition-colors"
                onClick={() => {
                  if (meeting) downloadICS(meeting);
                  close();
                }}
              >
                <CalendarPlus size={14} aria-hidden />
                Add to calendar
              </button>

              {/* Reschedule (placeholder) */}
              <button
                type="button"
                className="flex w-full cursor-not-allowed items-center gap-2.5 px-3 py-2 text-left text-sm text-[#a4a7ae]"
                disabled
                title="Coming soon"
              >
                <Calendar size={14} aria-hidden />
                Reschedule
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-[#f0f0f4]" />

              {/* RSVP contextual actions */}
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

              {/* Cancel meeting (host only) */}
              {isHost && (
                <>
                  <div className="my-1 border-t border-[#f0f0f4]" />
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
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#414651] hover:bg-[#f3f3f7] transition-colors"
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

// ─── Date Chip ────────────────────────────────────────────────────────────────

function DateChipBadge({ month, day }: { month: string; day: number }) {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-lg border border-[#e9eaeb] shadow-[0_0_0_2px_white,0_0_0_4px_#8988ab] bg-white">
      <div className="flex w-full items-center justify-center bg-[#e7e7ee] pb-0.5 pt-1 px-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#717680]">
          {month}
        </span>
      </div>
      <div className="flex w-full items-center justify-center pb-[3px] pt-px px-2">
        <span className="text-lg font-bold leading-7 text-[#545469]">{day}</span>
      </div>
    </div>
  );
}

function DeclineConfirmationModal({
  meetingTitle,
  onCancel,
  onConfirm,
}: {
  meetingTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0a0d12]/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decline-meeting-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[#e9eaeb] bg-white p-6 shadow-[0_24px_64px_rgba(10,13,18,0.24)]">
        <div className="flex flex-col gap-2">
          <h2 id="decline-meeting-title" className="text-lg font-semibold text-[#414651]">
            Decline this meeting?
          </h2>
          <p className="text-sm leading-6 text-[#535862]">
            You are about to decline "{meetingTitle}". You can revoke the decline later from the meeting menu.
          </p>
        </div>
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
    </div>
  );
}

function CancelMeetingModal({
  meetingTitle,
  onCancel,
  onConfirm,
}: {
  meetingTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0a0d12]/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-meeting-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[#e9eaeb] bg-white p-6 shadow-[0_24px_64px_rgba(10,13,18,0.24)]">
        <div className="flex flex-col gap-2">
          <h2 id="cancel-meeting-title" className="text-lg font-semibold text-[#414651]">
            Cancel this meeting?
          </h2>
          <p className="text-sm leading-6 text-[#535862]">
            You are about to cancel "{meetingTitle}". All attendees will be notified and the meeting will be removed from their calendars.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onCancel}>
            Keep meeting
          </Button>
          <Button
            variant="primary"
            size="md"
            className="border-[#b42318] bg-[#b42318] hover:bg-[#912018]"
            onClick={onConfirm}
          >
            Cancel meeting
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────

function MeetingCard({
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
      <div className="flex flex-col gap-4 rounded-xl bg-[#f3f3f7] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="line-clamp-1 text-lg font-semibold text-[#414651]"
                title={meeting.title}
              >
                {meeting.title}
              </h3>
              {meeting.platform && <PlatformBadge platform={meeting.platform} />}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-[#414651]">
                <Calendar size={16} className="shrink-0 text-[#717680]" aria-hidden />
                <span>{meeting.date} • {meeting.timeRange}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-[#414651]">
                <User size={16} className="shrink-0 text-[#717680]" aria-hidden />
                <span>Host: {meeting.host}</span>
              </div>
              {meeting.languages && (
                <div className="flex items-center gap-1 text-sm text-[#414651]">
                  <Globe size={16} className="shrink-0 text-[#717680]" aria-hidden />
                  <span>Language: {meeting.languages}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={meeting.status} />
            <MoreMenu open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} meeting={meeting} />
          </div>
        </div>

        {meeting.audioDuration && (
          <AudioPlayer duration={meeting.audioDuration} meetingId={meeting.id} />
        )}

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
        "flex items-center gap-6 rounded-xl bg-[#f3f3f7] p-6 transition",
        isEnded && "opacity-65 grayscale",
      )}
    >
      {/* Date chip */}
      {chip && <DateChipBadge month={chip.month} day={chip.day} />}

      {/* Meeting info */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className="line-clamp-1 text-lg font-semibold text-[#414651]"
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
          <div className="flex items-center gap-1 text-sm text-[#414651]">
            <Calendar size={16} className="shrink-0 text-[#717680]" aria-hidden />
            <span>{meeting.date} • {meeting.timeRange}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-[#414651]">
            <User size={16} className="shrink-0 text-[#717680]" aria-hidden />
            <span>Host: {meeting.host}</span>
          </div>
          {meeting.languages && (
            <div className="flex items-center gap-1 text-sm text-[#414651]">
              <Globe size={16} className="shrink-0 text-[#717680]" aria-hidden />
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
                    className="gap-2 no-underline"
                  >
                    <Monitor size={16} aria-hidden />
                    Join Meeting
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
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[#d5d7da] bg-white px-3 py-2 text-sm font-semibold text-[#a4a7ae] opacity-60 select-none"
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
            <h1 className="text-2xl font-semibold text-[#414651]">All Your Meetings</h1>
            <p className="text-xs text-[#535862]">Showing all your meetings across organizations</p>
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
        <div className="border-b border-[#e9eaeb]">
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
                      ? "border-b-2 border-[#6f6e8a] text-[#545469]"
                      : "text-[#717680] hover:text-[#414651]",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-xs",
                      active ? "bg-[#e9e9f0] text-[#545469]" : "bg-[#f0f0f4] text-[#717680]",
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
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#717680]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search for meetings"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#d5d7da] bg-white pl-9 pr-3 text-sm text-[#414651] shadow-[0_1px_2px_0_rgba(10,13,18,0.05)] outline-none placeholder:text-[#717680] focus:ring-2 focus:ring-[#6f6e8a]/30"
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
                <div className="absolute right-0 top-12 z-50 min-w-[200px] overflow-hidden rounded-lg border border-[#e9eaeb] bg-white py-1 shadow-lg">
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
                          isActive ? "bg-[#e9e9f0] text-[#545469] font-medium" : "text-[#414651] hover:bg-[#f3f3f7]",
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
              <span className="rounded-full border border-[#d5d3e8] bg-[#f3f3f7] px-3 py-1 text-xs font-medium text-[#545469]">
                {rsvpFilter.charAt(0).toUpperCase() + rsvpFilter.slice(1)}
              </span>
              <button
                type="button"
                onClick={() => setRsvpFilter("all")}
                className="text-xs text-[#6f6e8a] hover:text-[#414651] underline transition-colors"
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
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e0dde8] bg-[#fafbfc] px-6 py-16 text-center">
              <p className="text-sm font-medium text-[#414651]">No meetings found</p>
              <p className="mt-1 text-sm text-[#717680]">
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
                  className="mt-3 text-sm text-[#6f6e8a] underline hover:text-[#414651] transition-colors"
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
          <div className="rounded-lg border border-[#d5d7da] bg-white px-4 py-3 text-sm font-semibold text-[#414651] shadow-[0_12px_30px_rgba(10,13,18,0.16)]">
            {toast.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

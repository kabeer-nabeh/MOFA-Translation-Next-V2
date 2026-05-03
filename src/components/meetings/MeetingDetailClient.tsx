"use client";

import * as React from "react";
import {
  ArrowLeft,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Globe,
  Hash,
  MessageSquare,
  Mic,
  Monitor,
  MoreVertical,
  Pause,
  Play,
  Search,
  Send,
  Share2,
  SkipBack,
  SkipForward,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  type MeetingDetail,
  type ParticipantDetail,
  type MinuteItem,
  type TranscriptEntry,
  MEETING_DETAILS,
} from "@/components/meetings/meeting-detail-data";
import { InAppMeetingRoom } from "@/components/meetings/InAppMeetingRoom";
import {
  MEETINGS,
  type Meeting,
  type MeetingPlatform,
} from "@/components/meetings/meetings-data";

// ─── Waveform ─────────────────────────────────────────────────────────────────

function generateWaveform(seed: string, barCount = 160): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < barCount; i++) {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    bars.push(Math.abs(h % 30) + 4);
  }
  return bars;
}

const BAR_W = 0.55;
const BAR_GAP = 1.85;
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

  const posToProgress = React.useCallback((clientX: number) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  return (
    <svg
      ref={svgRef}
      className="h-8 w-full cursor-pointer"
      viewBox={`0 0 ${bars.length * BAR_GAP} ${SVG_H}`}
      preserveAspectRatio="none"
      aria-hidden
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as Element).setPointerCapture(e.pointerId);
        onSeek(posToProgress(e.clientX));
      }}
      onPointerMove={(e) => { if (dragging.current) onSeek(posToProgress(e.clientX)); }}
      onPointerUp={() => { dragging.current = false; }}
      style={{ touchAction: "none" }}
    >
      {bars.map((h, i) => {
        const x = i * BAR_GAP + 0.5;
        const y = (SVG_H - h) / 2;
        const filled = i / bars.length <= progress;
        return <rect key={i} x={x} y={y} width={BAR_W} height={h} rx={0.3} fill={filled ? "#48476e" : "#d5d3e8"} />;
      })}
    </svg>
  );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────

function parseDuration(d: string): number {
  const parts = d.split(":").map(Number);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  return 0;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  return 0;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function AudioPlayer({
  duration,
  meetingId,
  progress,
  onProgressChange,
}: {
  duration: string;
  meetingId: string;
  progress: number;
  onProgressChange: React.Dispatch<React.SetStateAction<number>>;
}) {
  const totalSec = React.useMemo(() => parseDuration(duration), [duration]);
  const bars = React.useMemo(() => generateWaveform(meetingId, 200), [meetingId]);

  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [speed, setSpeed] = React.useState<number>(1);
  const [speedMenuOpen, setSpeedMenuOpen] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const speedMenuRef = React.useRef<HTMLDivElement>(null);

  const startPlayback = React.useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      onProgressChange((prev) => {
        if (prev >= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPlaying(false);
          return 0;
        }
        return Math.min(1, prev + (0.05 * speed) / totalSec);
      });
    }, 50);
  }, [speed, totalSec, onProgressChange]);

  const toggle = () => {
    setPlaying((p) => {
      if (!p) { startPlayback(); }
      else { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }
      return !p;
    });
  };

  React.useEffect(() => {
    if (playing) startPlayback();
  }, [speed]);
  React.useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  React.useEffect(() => {
    if (!speedMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) setSpeedMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [speedMenuOpen]);

  const skip = (delta: number) => onProgressChange((p) => Math.max(0, Math.min(1, p + delta / totalSec)));
  const elapsed = fmtTime(progress * totalSec);
  const total = fmtTime(totalSec);

  return (
    <div className="flex items-center gap-3 bg-white px-6 py-3 border-b border-[#e9eaeb]">
      <button type="button" onClick={toggle}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#48476e] text-white transition hover:bg-[#3f3e63] active:scale-95"
        aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
      </button>

      <button type="button" onClick={() => skip(-10)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#717680] transition hover:bg-[#f3f3f7] hover:text-[#414651]"
        aria-label="Rewind 10s">
        <SkipBack size={14} />
      </button>

      <div className="min-w-0 flex-1">
        <InteractiveWaveform bars={bars} progress={progress} onSeek={onProgressChange} />
      </div>

      <button type="button" onClick={() => skip(10)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#717680] transition hover:bg-[#f3f3f7] hover:text-[#414651]"
        aria-label="Forward 10s">
        <SkipForward size={14} />
      </button>

      <span className="shrink-0 tabular-nums text-xs font-medium text-[#717680]">{elapsed} / {total}</span>

      <div className="relative" ref={speedMenuRef}>
        <button type="button" onClick={() => setSpeedMenuOpen((v) => !v)}
          className="flex h-7 items-center justify-center rounded-md border border-[#e0dde8] bg-[#f8f8fb] px-1.5 text-[11px] font-semibold text-[#545469] transition hover:bg-[#eeedf5]"
          aria-label="Playback speed">
          {speed}x
        </button>
        {speedMenuOpen && (
          <div className="absolute bottom-full right-0 z-50 mb-1 min-w-[56px] overflow-hidden rounded-lg border border-[#e9eaeb] bg-white py-1 shadow-lg">
            {SPEED_OPTIONS.map((s) => (
              <button key={s} type="button"
                className={cn("flex w-full items-center justify-center px-2 py-1.5 text-xs",
                  s === speed ? "bg-[#f3f3f7] font-semibold text-[#545469]" : "text-[#717680] hover:bg-[#f8f8fb]")}
                onClick={() => { setSpeed(s); setSpeedMenuOpen(false); }}>
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={() => setMuted((m) => !m)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#717680] transition hover:bg-[#f3f3f7] hover:text-[#414651]"
        aria-label={muted ? "Unmute" : "Mute"}>
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
    </div>
  );
}

// ─── Platform icon ────────────────────────────────────────────────────────────

function PlatformIcon({ platform, containerSize }: { platform?: MeetingPlatform; containerSize?: boolean }) {
  if (!platform) return null;
  if (platform === "Teams") return <img src="/teams.png" alt="Teams" className={cn("object-contain", containerSize ? "size-4" : "size-3.5")} />;
  if (platform === "Beam") return <img src="/beam-logo.png" alt="" className={cn("object-contain", containerSize ? "size-4" : "size-3.5")} />;
  return <Monitor size={containerSize ? 13 : 13} className="text-[#545469]" />;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  meeting,
  detail,
  onParticipantClick,
}: {
  meeting: Meeting;
  detail: MeetingDetail;
  onParticipantClick?: (id: string) => void;
}) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto pr-1">
      {/* Meeting info card */}
      <div className="shrink-0 rounded-xl border border-[#e9eaeb] bg-white overflow-hidden">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#717680]">Meeting Info</p>
        </div>
        <div className="px-4 pt-2.5 pb-4 flex flex-col gap-4">
          {/* Host */}
          <div className="flex items-center gap-4">
            <User size={14} className="shrink-0 text-[#717680]" aria-hidden />
            <span className="w-16 shrink-0 text-xs text-[#9fa3ae]">Host</span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#181d27]">{meeting.host}</span>
          </div>
          {/* Date & Time */}
          <div className="flex gap-4">
            <Calendar size={14} className="shrink-0 text-[#717680] mt-0.5" aria-hidden />
            <div className="flex flex-col w-16">
              <span className="text-xs text-[#9fa3ae]">Date & Time</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#181d27]">{meeting.date}</p>
              <p className="truncate text-xs font-medium text-[#181d27] mt-0.5">{meeting.timeRange}</p>
            </div>
          </div>
          {/* Duration */}
          <div className="flex items-center gap-4">
            <Clock size={14} className="shrink-0 text-[#717680]" aria-hidden />
            <span className="w-16 shrink-0 text-xs text-[#9fa3ae]">Duration</span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#181d27]">{detail.totalSpeakingTime}</span>
          </div>
          {/* Platform */}
          {meeting.platform && (
            <div className="flex items-center gap-4">
              <PlatformIcon platform={meeting.platform} />
              <span className="w-16 shrink-0 text-xs text-[#9fa3ae]">Platform</span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#181d27]">{meeting.platform}</span>
            </div>
          )}
          {/* Languages */}
          {meeting.languages && (
            <div className="flex items-center gap-4">
              <Globe size={14} className="shrink-0 text-[#717680]" aria-hidden />
              <span className="w-16 shrink-0 text-xs text-[#9fa3ae]">Languages</span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#181d27]">{meeting.languages}</span>
            </div>
          )}
          {/* Participants */}
          <div className="flex items-center gap-4">
            <Users size={14} className="shrink-0 text-[#717680]" aria-hidden />
            <span className="w-16 shrink-0 text-xs text-[#9fa3ae]">Participants</span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#181d27]">{meeting.participantCount} people</span>
          </div>
        </div>
      </div>

      {/* Speakers quick list */}
      <div className="shrink-0 rounded-xl border border-[#e9eaeb] bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#717680]">Speakers</p>
        <div className="flex flex-col gap-2">
          {detail.participants.map((p) => {
            const dot = p.engagement === "Very High" ? "#17b26a"
              : p.engagement === "High" ? "#2e90fa"
              : p.engagement === "Medium" ? "#f79009"
              : p.engagement === "Low" ? "#f04438"
              : "#717680";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onParticipantClick?.(p.id)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-[#f3f3f7]"
              >
                <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[#414651]"
                  style={{ backgroundColor: p.bg }}>
                  {p.initials}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: dot }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#414651]">{p.name}</p>
                  <p className="text-[10px] text-[#717680]">{p.wordPercent}% · {p.speakingTime}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keywords */}
      <div className="shrink-0 rounded-xl border border-[#e9eaeb] bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#717680]">Keywords</p>
        <div className="flex flex-wrap gap-1.5">
          {detail.keywords.slice(0, 8).map((kw) => (
            <span key={kw}
              className="rounded-full border border-[#e0dde8] bg-[#f3f3f7] px-2 py-0.5 text-[11px] font-medium text-[#545469]">
              {kw}
            </span>
          ))}
          {detail.keywords.length > 8 && (
            <span className="rounded-full border border-[#e0dde8] bg-[#f3f3f7] px-2 py-0.5 text-[11px] text-[#717680]">
              +{detail.keywords.length - 8} more
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type TabId = "summary" | "transcript" | "participants" | "minutes" | "ask-ai";

// ─── Engagement badge ─────────────────────────────────────────────────────────

const ENGAGEMENT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Very High": { bg: "#ecfdf3", text: "#067647", border: "#abefc6" },
  "High":      { bg: "#eff8ff", text: "#175cd3", border: "#b2ddff" },
  "Medium":    { bg: "#fffaeb", text: "#b54708", border: "#fedf89" },
  "Low":       { bg: "#fff1f0", text: "#b42318", border: "#fecdca" },
  "Very Low":  { bg: "#f9fafb", text: "#717680", border: "#d5d7da" },
};

function EngagementBadge({ level }: { level: string }) {
  const style = ENGAGEMENT_STYLES[level] ?? ENGAGEMENT_STYLES["Medium"]!;
  return (
    <span className="rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}>
      {level} Engagement
    </span>
  );
}

// ─── Participant Card ─────────────────────────────────────────────────────────

function ParticipantCard({ p, id }: { p: ParticipantDetail; id?: string }) {
  return (
    <div id={id} className="rounded-xl border border-[#e9eaeb] bg-white p-5 scroll-mt-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[#414651]"
            style={{ backgroundColor: p.bg }}>
            {p.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#414651]">{p.name}</p>
            <p className="text-xs text-[#717680]">{p.role ?? "Participant"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <EngagementBadge level={p.engagement} />
          <p className="text-xs text-[#717680]">{p.speakingTime} speaking time</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-[#717680]">Participation Level</span>
          <span className="font-semibold text-[#414651]">
            {p.wordCount.toLocaleString()} words ({p.wordPercent}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f4]">
          <div className="h-full rounded-full bg-[#48476e] transition-all" style={{ width: `${p.participationLevel}%` }} />
        </div>
        <div className="mt-1 text-right text-xs text-[#717680]">{p.participationLevel}%</div>
      </div>

      <div className="mt-4 grid grid-cols-4 divide-x divide-[#f0f0f4] rounded-lg border border-[#f0f0f4] bg-[#fafbfc]">
        {[
          { label: "Segments", value: p.segments },
          { label: "Sentences", value: p.sentences },
          { label: "Words/Seg", value: p.wordsPerSegment },
          { label: "Words/min", value: p.wordsPerMin },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-3 px-2">
            <span className="text-base font-bold text-[#414651]">{value}</span>
            <span className="mt-0.5 text-center text-[10px] text-[#717680]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Summary Tab ───────────────────────────────────────────────────────────

function AISummaryTab({ detail }: { detail: MeetingDetail }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-[#48476e]" aria-hidden />
          <h2 className="text-sm font-semibold text-[#414651]">Meeting Overview</h2>
        </div>
        <div className="grid grid-cols-4 divide-x divide-[#e9eaeb] rounded-xl border border-[#e9eaeb] bg-white">
          {[
            { label: "Total Speakers", value: detail.totalSpeakers },
            { label: "Total Words", value: detail.totalWords.toLocaleString() },
            { label: "Speaking Time", value: detail.totalSpeakingTime },
            { label: "Avg Speed", value: `${detail.avgSpeakingRate} wpm` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-5">
              <span className="text-2xl font-bold text-[#414651]">{value}</span>
              <span className="mt-1 text-xs text-[#717680]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#f0f0f4]" />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[#48476e]" aria-hidden />
          <h2 className="text-sm font-semibold text-[#414651]">Executive Summary</h2>
        </div>
        <p className="leading-8 text-sm text-[#535862]" dir="auto">{detail.executiveSummary}</p>
      </section>

      <div className="border-t border-[#f0f0f4]" />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Hash size={16} className="text-[#48476e]" aria-hidden />
          <h2 className="text-sm font-semibold text-[#414651]">Keywords</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {detail.keywords.map((kw) => (
            <span key={kw}
              className="rounded-full border border-[#e0dde8] bg-[#f3f3f7] px-3 py-1 text-sm font-medium text-[#545469]">
              {kw}
            </span>
          ))}
        </div>
      </section>

      <div className="border-t border-[#f0f0f4]" />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} className="text-[#48476e]" aria-hidden />
          <h2 className="text-sm font-semibold text-[#414651]">Participant Engagement</h2>
        </div>
        <div className="flex flex-col gap-3">
          {detail.participants.map((p) => <ParticipantCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}

// ─── Transcript Tab ───────────────────────────────────────────────────────────

function TranscriptTab({
  entries,
  search,
  audioProgress,
  totalSec,
  onSeek,
}: {
  entries: TranscriptEntry[];
  search: string;
  audioProgress: number;
  totalSec: number;
  onSeek: (p: number) => void;
}) {
  const currentSec = audioProgress * totalSec;

  const filtered = React.useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) => e.text.toLowerCase().includes(q) || e.speakerName.toLowerCase().includes(q),
    );
  }, [entries, search]);

  const activeEntryIdx = React.useMemo(() => {
    if (totalSec === 0) return -1;
    for (let i = filtered.length - 1; i >= 0; i--) {
      if (parseTimestamp(filtered[i]?.timestamp ?? "99:99") <= currentSec) return i;
    }
    return -1;
  }, [filtered, currentSec, totalSec]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e0dde8] bg-[#fafbfc] py-16 text-center">
        <p className="text-sm font-medium text-[#414651]">No results found</p>
        <p className="mt-1 text-sm text-[#717680]">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {filtered.map((entry, idx) => {
        const prevSpeaker = idx > 0 ? filtered[idx - 1]?.speakerId : null;
        const showHeader = entry.speakerId !== prevSpeaker;
        const isActive = idx === activeEntryIdx;
        const entrySec = parseTimestamp(entry.timestamp);
        return (
          <div key={entry.id} className={cn("group", showHeader && idx > 0 && "mt-5")}>
            {showHeader && (
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[#414651]"
                  style={{ backgroundColor: entry.speakerBg }}>
                  {entry.speakerInitials}
                </div>
                <span className="text-xs font-semibold text-[#414651]">{entry.speakerName}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => onSeek(entrySec / totalSec)}
              className={cn(
                "ml-8 flex w-full items-start gap-3 rounded-xl px-4 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-[#eeedf5] ring-1 ring-[#c8c7d8]"
                  : "hover:bg-[#f9f9fc]",
              )}
            >
              <span className="mt-0.5 shrink-0 tabular-nums text-[11px] font-medium text-[#a4a7ae] group-hover:text-[#717680]">
                {entry.timestamp}
              </span>
              <p className={cn("flex-1 text-sm leading-6", isActive ? "text-[#414651] font-medium" : "text-[#535862]")}>
                {search.trim() ? <HighlightedText text={entry.text} query={search} /> : entry.text}
              </p>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="rounded bg-[#fef3c7] px-0.5 text-[#414651]">{part}</mark>
          : part,
      )}
    </>
  );
}

// ─── Participants Tab ─────────────────────────────────────────────────────────

function ParticipantsTab({ detail }: { detail: MeetingDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 divide-x divide-[#e9eaeb] rounded-xl border border-[#e9eaeb] bg-white">
        {[
          { label: "Total Speakers", value: detail.totalSpeakers },
          { label: "Total Words", value: detail.totalWords.toLocaleString() },
          { label: "Speaking Time", value: detail.totalSpeakingTime },
          { label: "Avg Speed", value: `${detail.avgSpeakingRate} wpm` },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-5">
            <span className="text-2xl font-bold text-[#414651]">{value}</span>
            <span className="mt-1 text-xs text-[#717680]">{label}</span>
          </div>
        ))}
      </div>
      {detail.participants.map((p) => (
        <ParticipantCard key={p.id} p={p} id={`participant-${p.id}`} />
      ))}
    </div>
  );
}

// ─── Meeting Minutes Tab ──────────────────────────────────────────────────────

const MINUTE_STYLES: Record<MinuteItem["type"], { label: string; bg: string; text: string; border: string; dot: string }> = {
  decision: { label: "Decision",    bg: "#eff8ff", text: "#175cd3", border: "#b2ddff", dot: "#2e90fa" },
  action:   { label: "Action Item", bg: "#fff1f0", text: "#b42318", border: "#fecdca", dot: "#f04438" },
  note:     { label: "Note",        bg: "#fffaeb", text: "#b54708", border: "#fedf89", dot: "#f79009" },
};

function MeetingMinutesTab({ items }: { items: MinuteItem[] }) {
  const groups: Record<MinuteItem["type"], MinuteItem[]> = {
    decision: items.filter((i) => i.type === "decision"),
    action: items.filter((i) => i.type === "action"),
    note: items.filter((i) => i.type === "note"),
  };

  return (
    <div className="flex flex-col gap-6">
      {(["decision", "action", "note"] as const).map((type) => {
        const list = groups[type];
        if (!list.length) return null;
        const style = MINUTE_STYLES[type];
        return (
          <section key={type}>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold"
                style={{ background: style.bg, color: style.text, borderColor: style.border }}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                {style.label}s
              </span>
              <span className="text-xs text-[#717680]">{list.length} item{list.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex flex-col gap-2">
              {list.map((item, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-[#e9eaeb] bg-white px-4 py-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: style.dot }} />
                  <div>
                    <p className="text-sm text-[#414651]">{item.text}</p>
                    {item.owner && (
                      <p className="mt-1 text-xs text-[#717680]">Owner: <span className="font-medium">{item.owner}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ─── Ask AI Tab ───────────────────────────────────────────────────────────────

type ChatMsg = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "What were the main decisions?",
  "Summarize the action items",
  "Who spoke the most?",
  "What were the key risks discussed?",
];

function AskAITab({ meetingTitle }: { meetingTitle: string }) {
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const aiResponse: ChatMsg = {
      role: "ai",
      text: `Based on the meeting "${meetingTitle}", here's what I found: "${text}". This is a demo response — in production this would query the actual meeting transcript and AI-generated summary.`,
    };
    setMessages((prev) => [...prev, { role: "user", text }, aiResponse]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 420 }}>
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-[#e0dde8] bg-[#f3f3f7]">
            <Bot size={24} className="text-[#48476e]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#414651]">Ask about this meeting</p>
            <p className="mt-1 text-xs text-[#717680]">Get instant answers from the transcript and AI analysis.</p>
          </div>
          <div className="grid w-full max-w-md grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => sendMessage(s)}
                className="rounded-xl border border-[#e0dde8] bg-white px-3 py-2.5 text-left text-xs text-[#414651] shadow-sm transition hover:bg-[#f3f3f7] hover:border-[#c8c7d8]">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "ai" && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#48476e] text-white">
                  <Bot size={13} />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6",
                msg.role === "user"
                  ? "bg-[#48476e] text-white rounded-br-sm"
                  : "bg-[#f3f3f7] text-[#414651] rounded-bl-sm",
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#d5d7da] bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#6f6e8a]/30">
        <Mic size={15} className="shrink-0 text-[#717680]" aria-hidden />
        <input
          type="text"
          placeholder="Ask anything about this meeting..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          className="flex-1 bg-transparent text-sm text-[#414651] outline-none placeholder:text-[#717680]"
        />
        <button type="button" onClick={() => sendMessage(input)} disabled={!input.trim()}
          className="flex size-7 items-center justify-center rounded-lg bg-[#48476e] text-white transition hover:bg-[#3f3e63] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send">
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Download Menu ────────────────────────────────────────────────────────────

const DOWNLOAD_FORMATS = [
  { label: "PDF Document", ext: ".pdf" },
  { label: "Word Document", ext: ".docx" },
  { label: "Plain Text", ext: ".txt" },
  { label: "Subtitles (SRT)", ext: ".srt" },
];

function DownloadMenu() {
  const [open, setOpen] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" size="sm" className="gap-2" onClick={() => setOpen((v) => !v)}>
        <Download size={14} aria-hidden />
        Download
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </Button>
      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[188px] overflow-hidden rounded-xl border border-[#e9eaeb] bg-white py-1 shadow-lg">
          {DOWNLOAD_FORMATS.map((f) => (
            <button
              key={f.ext}
              type="button"
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-[#414651] hover:bg-[#f3f3f7] transition-colors"
              onClick={() => {
                setDownloaded(f.ext);
                setOpen(false);
                setTimeout(() => setDownloaded(null), 2000);
              }}
            >
              <span>{f.label}</span>
              <span className="flex items-center gap-1">
                {downloaded === f.ext
                  ? <Check size={13} className="text-[#067647]" />
                  : <span className="text-xs text-[#717680]">{f.ext}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MeetingDetailClient({ meetingId }: { meetingId: string }) {
  const [activeTab, setActiveTab] = React.useState<TabId>("summary");
  const [search, setSearch] = React.useState("");
  const [audioProgress, setAudioProgress] = React.useState(0);

  const meeting = MEETINGS.find((m) => m.id === meetingId);

  const totalSec = React.useMemo(
    () => (meeting?.audioDuration ? parseDuration(meeting.audioDuration) : 0),
    [meeting],
  );

  const handleParticipantClick = (id: string) => {
    setActiveTab("participants");
    setTimeout(() => {
      document.getElementById(`participant-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  if (!meeting) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <p className="text-base font-semibold text-[#414651]">Meeting not found</p>
        <Link href="/meetings" className="text-sm text-[#6f6e8a] underline hover:text-[#414651]">
          Back to meetings
        </Link>
      </div>
    );
  }

  if (meeting.status === "upcoming" && meeting.platform === "In App") {
    return <InAppMeetingRoom meeting={meeting} />;
  }

  const detail = MEETING_DETAILS[meetingId];

  if (!detail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="text-base font-semibold text-[#414651]">No in-app recap yet</p>
        <p className="max-w-md text-sm text-[#717680]">
          This meeting is hosted outside MOFA or hasn&apos;t finished. Use{" "}
          <strong>Join</strong> on the meetings list to open the provider link, or pick a
          completed meeting to view AI summary and transcript.
        </p>
        <Link href="/meetings" className="text-sm font-medium text-[#6f6e8a] underline hover:text-[#414651]">
          Back to meetings
        </Link>
      </div>
    );
  }

  const TABS: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "summary", label: "AI Summary", icon: <Sparkles size={13} /> },
    { id: "transcript", label: "Transcript", icon: <FileText size={13} /> },
    { id: "participants", label: "Participants", icon: <Users size={13} />, count: detail.participants.length },
    { id: "minutes", label: "Meeting Minutes", icon: <MessageSquare size={13} /> },
    { id: "ask-ai", label: "Ask AI", icon: <Bot size={13} /> },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col pt-2">
      {/* Back nav + actions */}
      <div className="mb-5 flex items-center justify-between">
        <Link href="/meetings"
          className="inline-flex items-center gap-1.5 text-sm text-[#717680] transition hover:text-[#414651]">
          <ArrowLeft size={15} />
          Back to Meetings
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <Share2 size={14} aria-hidden />
            Share
          </Button>
          <button type="button"
            className="flex size-8 items-center justify-center rounded-lg border border-[#d5d7da] bg-white text-[#717680] transition hover:bg-[#f3f3f7]">
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* Page header */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-semibold text-[#414651]">{meeting.title}</h1>
          <span className="rounded-md border border-[#abefc6] bg-[#ecfdf3] px-2.5 py-0.5 text-sm font-medium text-[#067647]">
            Completed
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── Sidebar ── */}
        <Sidebar
          meeting={meeting}
          detail={detail}
          onParticipantClick={handleParticipantClick}
        />

        {/* ── Main content ── */}
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#e9eaeb] bg-white overflow-hidden">
          {/* Sticky audio player */}
          <div className="shrink-0">
            <AudioPlayer
              duration={meeting.audioDuration ?? "00:00"}
              meetingId={meeting.id}
              progress={audioProgress}
              onProgressChange={setAudioProgress}
            />
          </div>

          {/* Toolbar: search (transcript only) + download */}
          <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-3">
            <div className={cn("relative flex-1 max-w-xs transition-all", activeTab !== "transcript" && "opacity-40 pointer-events-none")}>
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#717680]" aria-hidden />
              <input
                type="search"
                placeholder="Search transcript…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={activeTab !== "transcript"}
                className="h-8 w-full rounded-lg border border-[#d5d7da] bg-white pl-8 pr-3 text-sm text-[#414651] outline-none placeholder:text-[#717680] focus:ring-2 focus:ring-[#6f6e8a]/30"
              />
            </div>
            <DownloadMenu />
          </div>

          {/* Tabs */}
          <div className="shrink-0 border-b border-[#e9eaeb] px-5">
            <div className="flex gap-0.5">
              {TABS.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 pb-3 pt-3 text-xs font-semibold transition whitespace-nowrap",
                      active
                        ? "border-b-2 border-[#6f6e8a] text-[#545469]"
                        : "text-[#717680] hover:text-[#414651]",
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px]",
                        active ? "bg-[#e9e9f0] text-[#545469]" : "bg-[#f0f0f4] text-[#717680]",
                      )}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {activeTab === "summary" && <AISummaryTab detail={detail} />}
            {activeTab === "transcript" && (
              <TranscriptTab
                entries={detail.transcript}
                search={search}
                audioProgress={audioProgress}
                totalSec={totalSec}
                onSeek={setAudioProgress}
              />
            )}
            {activeTab === "participants" && <ParticipantsTab detail={detail} />}
            {activeTab === "minutes" && <MeetingMinutesTab items={detail.minutes} />}
            {activeTab === "ask-ai" && <AskAITab meetingTitle={meeting.title} />}
          </div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4 shrink-0" />
    </div>
  );
}

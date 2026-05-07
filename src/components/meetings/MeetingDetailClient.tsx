"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
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
  PhoneOff,
  Pause,
  PictureInPicture,
  PictureInPicture2,
  Pin,
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
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  type MeetingDetail,
  type ParticipantDetail,
  type MinuteItem,
  type TranscriptEntry,
  MEETING_DETAILS,
} from "@/components/meetings/meeting-detail-data";
import { MEETINGS, type MeetingPlatform } from "@/components/meetings/meetings-data";

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

  React.useEffect(() => { if (playing) startPlayback(); }, [speed]); // eslint-disable-line
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
  if (platform === "Teams") return <img src="/teams.png" alt="Teams" className={cn("object-contain shrink-0", containerSize ? "size-4" : "size-5")} />;
  if (platform === "Beem") return <img src="/beam-logo.png" alt="Beem" className={cn("object-contain shrink-0", containerSize ? "size-4" : "size-5")} />;
  return <Monitor size={containerSize ? 13 : 14} className="text-[#717680] shrink-0" />;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  meeting,
  detail,
  onParticipantClick,
}: {
  meeting: ReturnType<typeof MEETINGS.find> & object;
  detail: MeetingDetail;
  onParticipantClick?: (id: string) => void;
}) {
  if (!meeting) return null;
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
      <div className="shrink-0 rounded-xl border border-[#e9eaeb] bg-white overflow-hidden flex flex-col">
        <p className="px-4 pt-4 pb-3 text-xs font-semibold uppercase tracking-wider text-[#717680]">Speakers</p>
        <div className="flex flex-col gap-2 px-4 pb-4 overflow-y-auto max-h-48">
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
      <div className="shrink-0 rounded-xl border border-[#e9eaeb] bg-white overflow-hidden flex flex-col">
        <p className="px-4 pt-4 pb-3 text-xs font-semibold uppercase tracking-wider text-[#717680]">Keywords</p>
        <div className="flex flex-wrap gap-1.5 px-4 pb-4 overflow-y-auto max-h-32">
          {detail.keywords.map((kw) => (
            <span key={kw}
              className="rounded-full border border-[#e0dde8] bg-[#f3f3f7] px-2 py-0.5 text-[11px] font-medium text-[#545469]">
              {kw}
            </span>
          ))}
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

const PARTICIPANT_DIRECTORY: Record<string, { name: string; role: string }> = {
  p1: { name: "Suliman Alawi", role: "Lead" },
  p2: { name: "Koray Okumus", role: "Engineering" },
  p3: { name: "Zara Malik", role: "Product" },
  p4: { name: "Ahmed Bashir", role: "Client" },
  p5: { name: "Rania Nasser", role: "Design" },
};

type LiveTranscriptMessage = {
  id: string;
  speakerId: string;
  text: string;
  time: string;
  translated?: boolean;
  language?: string;
};

/** Messages use relative participant indices: the first participant (index 0) = "You" */
function buildLiveMessages(participants: ReturnType<typeof normalizeLiveParticipants>): LiveTranscriptMessage[] {
  const pid = (idx: number) => participants[idx]?.id ?? "p1";
  return [
    { id: "l1", speakerId: pid(1), time: "6:02 PM", language: "Arabic", text: "We have the ambassadorial briefing in ten minutes, so let's lock the agenda and assignments." },
    { id: "l2", speakerId: pid(1), time: "6:02 PM", language: "Arabic", translated: true, text: "Please make sure all interpreter channels are active before we begin." },
    { id: "l3", speakerId: pid(0), time: "6:03 PM", language: "English", text: "Agreed. I've reviewed the latest briefing notes — everything looks good on my end." },
    { id: "l4", speakerId: pid(2), time: "6:04 PM", language: "English", text: "I'll cover the opening context and hand over to the diplomatic coordination updates." },
    { id: "l5", speakerId: pid(1), time: "6:06 PM", language: "Arabic", translated: true, text: "Engineering is ready. The live translation path for Arabic and English is stable on both channels." },
    { id: "l6", speakerId: pid(3), time: "6:08 PM", language: "English", text: "From the client side, the main concern is keeping terminology consistent during the security segment." },
    { id: "l7", speakerId: pid(0), time: "6:09 PM", language: "English", text: "Good point. Let me flag that with the translation team before we start." },
    { id: "l8", speakerId: pid(2), time: "6:10 PM", language: "English", text: "I am monitoring the interpreter panel and participant language preferences right now." },
  ];
}

function getParticipantMeta(id: string, initials: string, bg: string) {
  const directory = PARTICIPANT_DIRECTORY[id] ?? { name: initials, role: "Participant" };
  return { id, initials, bg, ...directory };
}

function normalizeLiveParticipants(meeting: NonNullable<ReturnType<typeof MEETINGS.find>>) {
  return meeting.participants.map((participant) => getParticipantMeta(participant.id, participant.initials, participant.bg));
}

// Tile min/max widths (px) — used for the auto-fill grid
const TILE_MIN_W = 200;
const TILE_MAX_W = 300;
const MAX_VISIBLE = 8; // show at most 8 tiles; beyond that → More tile

function LiveParticipantTile({
  participant,
  isYou,
  isSpeaking,
  index,
}: {
  participant: ReturnType<typeof getParticipantMeta>;
  isYou?: boolean;
  isSpeaking?: boolean;
  index: number;
}) {
  return (
    <div
      className={cn(
        "group relative flex h-full w-full flex-col items-center justify-center gap-2.5 overflow-hidden rounded-xl border bg-gradient-to-b from-[#f5f5f5] to-[#e9eaeb] py-5 transition-all duration-500 ease-out animate-[fadeSlideIn_0.3s_ease-out_both]",
        isSpeaking
          ? "border-[rgba(0,0,0,0.1)] shadow-[0_0_0_2px_white,0_0_0_4px_#8988ab]"
          : "border-[rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.15)]",
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Radial decorative background */}
      <div className="pointer-events-none absolute -top-8 left-1/2 size-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.025)_0%,transparent_70%)]" />

      {/* Avatar */}
      <div
        className="relative flex size-16 shrink-0 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] text-lg font-semibold text-[#414651] transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: participant.bg }}
      >
        {participant.initials}
      </div>

      {/* Name + role */}
      <div className="flex w-full min-w-0 flex-col items-center gap-0.5 px-3">
        <div className="flex w-full min-w-0 items-center justify-center gap-1.5">
          <p className="min-w-0 truncate text-sm font-semibold text-[#414651]">
            {participant.name}
          </p>
          {isYou && (
            <span className="shrink-0 rounded-full border border-[#d0cfdd] bg-[#fcfcfd] px-2 py-0.5 text-[10px] font-medium text-[#545469]">
              You
            </span>
          )}
        </div>
        <p className="w-full truncate text-center text-[11px] text-[#535862]">
          ({participant.role})
        </p>
      </div>
    </div>
  );
}

function MoreParticipantsTile({
  participants,
  onPin,
  pinnedIds,
}: {
  participants: ReturnType<typeof getParticipantMeta>[];
  onPin: (id: string) => void;
  pinnedIds: Set<string>;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative h-full min-h-[170px] w-full">
      {/* Tile */}
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={(e) => {
          // keep open if moving into the popover
          if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        onClick={() => setOpen((v) => !v)}
        className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#d5d7da] bg-[#f5f5f7] transition-colors duration-200 hover:bg-[#eeeff6]"
      >
        <div className="flex size-10 items-center justify-center rounded-full border border-[#d5d7da] bg-white">
          <Users size={18} className="text-[#717680]" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-sm font-semibold text-[#414651]">+{participants.length} more</p>
          <p className="text-[10px] text-[#9fa3ae]">Hover to view</p>
        </div>
      </button>

      {/* Popover */}
      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[260px] overflow-hidden rounded-2xl border border-[#e9eaeb] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.15s_ease-out_both]"
        >
          <div className="border-b border-[#eeedf5] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9fa3ae]">
              {participants.length} Participants
            </p>
          </div>
          <ul className="max-h-[220px] overflow-y-auto p-2">
            {participants.map((p) => {
              const isPinned = pinnedIds.has(p.id);
              return (
                <li key={p.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-[#f5f5f7]">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-[#414651]"
                    style={{ backgroundColor: p.bg }}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#414651]">{p.name}</p>
                    <p className="truncate text-[10px] text-[#717680]">{p.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPin(p.id)}
                    title={isPinned ? "Unpin" : "Pin to view"}
                    className={cn(
                      "shrink-0 rounded-md p-1.5 transition-colors duration-150",
                      isPinned
                        ? "text-[#8988ab] hover:bg-[#eeeff6]"
                        : "text-[#9fa3ae] hover:bg-[#f3f3f7] hover:text-[#414651]",
                    )}
                  >
                    <Pin size={13} className={isPinned ? "fill-[#8988ab]" : ""} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

const AVAILABLE_LANGUAGES = [
  "English", "Arabic", "French", "Spanish", "German",
  "Mandarin", "Japanese", "Russian", "Turkish", "Urdu",
];

function LiveTranscriptPanel({
  messages,
  participants,
  currentUserId,
}: {
  messages: LiveTranscriptMessage[];
  participants: ReturnType<typeof normalizeLiveParticipants>;
  currentUserId: string;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = React.useState(false);

  // ── Language state ───────────────────────────────────────────────────────
  const [targetLang, setTargetLang] = React.useState("English");
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);

  // Derive source language from the non-You speakers' messages
  const sourceLang = React.useMemo(() => {
    const langs = messages
      .filter((m) => m.speakerId !== currentUserId && m.language)
      .map((m) => m.language!);
    const unique = [...new Set(langs)];
    if (unique.length === 0) return "Auto";
    if (unique.length === 1) return unique[0]!;
    return "Multiple";
  }, [messages, currentUserId]);

  // Close the language dropdown on outside click
  React.useEffect(() => {
    if (!showLangMenu) return;
    const handler = (e: MouseEvent) => {
      if (!langMenuRef.current?.contains(e.target as Node)) setShowLangMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLangMenu]);

  // Word-by-word streaming for the last message
  const lastMsg = messages[messages.length - 1];
  const lastMsgWords = React.useMemo(() => lastMsg?.text.split(" ") ?? [], [lastMsg?.id]);
  const [revealedCount, setRevealedCount] = React.useState(0);

  React.useEffect(() => {
    setRevealedCount(0);
    const timer = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= lastMsgWords.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 160);
    return () => clearInterval(timer);
  }, [lastMsg?.id, lastMsgWords.length]);

  // Auto-scroll as words stream in
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [revealedCount]);

  // Track scroll position to show/hide scroll-to-bottom button
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll to bottom when new messages arrive, but only if already near bottom
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Compact language bar — single row, minimal height */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[#f0f0f4] bg-white px-4 pb-2.5 pt-0">
        {/* Source — label + value */}
        <span className="text-xs font-medium text-[#9fa3ae]">Source</span>
        <div className="flex items-center gap-1">
          <Globe size={12} className="shrink-0 text-[#717680]" />
          <span className="text-xs font-semibold text-[#535862]">{sourceLang}</span>
        </div>
        <ArrowRight size={12} className="shrink-0 text-[#c1c4cd]" />
        {/* Target — label + interactive value */}
        <span className="text-xs font-medium text-[#9fa3ae]">Target</span>
        <div ref={langMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowLangMenu((v) => !v)}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-[#eeedf5]"
          >
            <Globe size={12} className="shrink-0 text-[#48476e]" />
            <span className="text-xs font-semibold text-[#48476e]">{targetLang}</span>
            <ChevronDown
              size={11}
              className={cn("shrink-0 text-[#8988ab] transition-transform duration-150", showLangMenu && "rotate-180")}
            />
          </button>

          {showLangMenu && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[152px] overflow-hidden rounded-xl border border-[#e9eaeb] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)] animate-[fadeSlideIn_0.15s_ease-out]">
              <p className="px-3 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-wider text-[#9fa3ae]">
                Translate to
              </p>
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => { setTargetLang(lang); setShowLangMenu(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
                    lang === targetLang
                      ? "bg-[#f3f3f7] font-semibold text-[#48476e]"
                      : "text-[#414651] hover:bg-[#f8f8fb]",
                  )}
                >
                  <span className="flex w-3 shrink-0 items-center justify-center">
                    {lang === targetLang && <Check size={11} className="text-[#48476e]" />}
                  </span>
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        <div className="flex flex-col gap-3 px-4 pb-4">
          {messages.map((message, idx) => {
            const participant = participants.find((item) => item.id === message.speakerId);
            if (!participant) return null;
            const isYou = message.speakerId === currentUserId;
            const prevMsg = messages[idx - 1];
            const isSameAsPrev = prevMsg?.speakerId === message.speakerId;
            const isLastMsg = idx === messages.length - 1;

            return (
              <div
                key={message.id}
                className={cn(
                  "group flex gap-2 animate-[fadeSlideIn_0.25s_ease-out_both]",
                  isYou ? "flex-row-reverse" : "flex-row",
                  isSameAsPrev ? "mt-0" : "mt-1",
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Avatar — only on first of a consecutive group, others' messages only */}
                <div className="mt-0.5 shrink-0 self-start">
                  {!isYou ? (
                    isSameAsPrev ? (
                      <div className="size-8" /> /* spacer to keep alignment */
                    ) : (
                      <div
                        className="flex size-8 items-center justify-center rounded-full text-[10px] font-bold text-[#414651]"
                        style={{ backgroundColor: participant.bg }}
                      >
                        {participant.initials}
                      </div>
                    )
                  ) : null}
                </div>

                {/* Bubble + meta */}
                <div className={cn("flex max-w-[80%] flex-col gap-2", isYou ? "items-end" : "items-start")}>
                  {/* Speaker name + time + language + translated badge — only on first message of a group */}
                  {!isSameAsPrev && (
                    <div className={cn("flex items-center gap-2", isYou ? "flex-row-reverse pr-1" : "flex-row")}>
                      <span className="text-xs font-semibold text-[#414651]">
                        {isYou ? "You" : participant.name}
                      </span>
                      <span className="text-[10px] text-[#9fa3ae]">{message.time}</span>
                      {message.language && (
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-[#e0dde8] bg-white px-1.5 py-px text-[9px] font-medium text-[#717680]">
                          <Globe size={9} />
                          {message.language}
                        </span>
                      )}
                      {message.translated && (
                        <span className="inline-flex items-center rounded-full border border-[#b2ddff] bg-[#eff8ff] px-1 py-px text-[9px] font-semibold text-[#175cd3]">
                          Translated
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={cn(
                      "relative border px-3 py-2 text-sm leading-6 text-[#181d27] transition-colors duration-200",
                      isYou
                        ? "rounded-bl-lg rounded-br-lg rounded-tl-lg border-[#d0cfdd] bg-[#e7e7ee] hover:bg-[#dfdfe8]"
                        : "rounded-bl-lg rounded-br-lg rounded-tr-lg border-[#e9eaeb] bg-[#fafafa] hover:bg-[#f3f3f7]",
                    )}
                  >
                    {isLastMsg ? (
                      <>
                        {lastMsgWords.slice(0, revealedCount).map((word, wordIdx) => (
                          <React.Fragment key={wordIdx}>
                            <span className="animate-[wordPop_0.15s_ease-out_both]">
                              {word}
                            </span>
                            {wordIdx < lastMsgWords.length - 1 ? " " : ""}
                          </React.Fragment>
                        ))}
                        {revealedCount < lastMsgWords.length && (
                          <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse rounded-sm bg-[#9fa3ae] align-middle" />
                        )}
                      </>
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full border border-[#d5d7da] bg-white px-3 py-1.5 text-xs font-semibold text-[#414651] shadow-md transition-all duration-200 hover:bg-[#f3f3f7] animate-[fadeSlideIn_0.2s_ease-out]"
        >
          <ChevronDown size={12} />
          Jump to latest
        </button>
      )}
    </div>
  );
}

function LiveParticipantsPanel({
  participants,
  currentUserId,
}: {
  participants: ReturnType<typeof normalizeLiveParticipants>;
  currentUserId: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pb-2 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#717680]">
          Participants · {participants.length}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
        {participants.map((participant, index) => {
          const isYou = participant.id === currentUserId;
          const isSpeaking = index < 2;
          const dotColor = isSpeaking ? "#17b26a" : "#98a2b3";
          return (
            <div
              key={participant.id}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-[#f3f3f7] animate-[fadeSlideIn_0.3s_ease-out_both]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar with status dot */}
              <div
                className="relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[#414651]"
                style={{ backgroundColor: participant.bg }}
              >
                {participant.initials}
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white",
                    isSpeaking && "animate-pulse",
                  )}
                  style={{ backgroundColor: dotColor }}
                />
              </div>

              {/* Name + role */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-medium text-[#414651]">{participant.name}</p>
                  {isYou && (
                    <span className="shrink-0 rounded-full border border-[#d0cfdd] bg-[#fcfcfd] px-1.5 py-px text-[10px] font-medium text-[#545469]">
                      You
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#717680]">{participant.role}</p>
              </div>

              {/* Status label */}
              <span className={cn(
                "shrink-0 text-[11px] font-medium",
                isSpeaking ? "text-[#067647]" : "text-[#98a2b3]",
              )}>
                {isSpeaking ? "Speaking" : "Listening"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveTimer() {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <p className="tabular-nums text-xs font-medium text-[#535862]">
      {mm}<span className="animate-pulse">:</span>{ss}
    </p>
  );
}

function MeetingConnectingScreen({
  meeting,
  participants,
  onReady,
}: {
  meeting: NonNullable<ReturnType<typeof MEETINGS.find>>;
  participants: ReturnType<typeof normalizeLiveParticipants>;
  onReady: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onReady, 2500);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-gradient-to-br from-[#fafafa] to-[#f3f3f7] p-6">
      {/* Meeting title */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#181d27]">{meeting.title}</h1>
        <p className="mt-2 text-sm text-[#717680]">Connecting to meeting room...</p>
      </div>

      {/* Participant avatars preview */}
      <div className="flex items-center justify-center gap-3">
        {participants.slice(0, 4).map((p, idx) => (
          <div
            key={p.id}
            className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white text-base font-bold text-[#414651] shadow-md transition-all duration-500 hover:scale-110 animate-[fadeSlideIn_0.3s_ease-out_both]"
            style={{
              backgroundColor: p.bg,
              animationDelay: `${idx * 100}ms`,
            }}
          >
            {p.initials}
          </div>
        ))}
        {participants.length > 4 && (
          <div className="flex size-14 items-center justify-center rounded-full border-2 border-white bg-[#e9eaeb] text-sm font-bold text-[#414651] shadow-md animate-[fadeSlideIn_0.3s_ease-out_both]" style={{ animationDelay: '400ms' }}>
            +{participants.length - 4}
          </div>
        )}
      </div>

      {/* Loading animation */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2.5 rounded-full bg-[#8988ab] animate-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-[#535862]">
          {participants.length} participants
        </p>
      </div>

      {/* Ready indicator */}
      <div className="flex items-center gap-2 rounded-lg border border-[#e7e7ee] bg-white px-4 py-2">
        <div className="size-2 animate-pulse rounded-full bg-[#17b26a]" />
        <span className="text-xs font-semibold text-[#067647]">Ready to join</span>
      </div>
    </div>
  );
}

function LeaveConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 animate-[fadeSlideIn_0.15s_ease-out]"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        className="w-full max-w-sm rounded-2xl border border-[#e9eaeb] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.2s_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-[#fff1f0] mb-4">
          <PhoneOff size={20} className="text-[#d92d20]" />
        </div>
        <h2 id="leave-title" className="text-base font-semibold text-[#181d27]">
          Leave this meeting?
        </h2>
        <p className="mt-1 text-sm text-[#535862]">
          You will be disconnected from the live translation session. You can rejoin later from the meetings page.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 flex-1 items-center justify-center rounded-lg border border-[#d5d7da] bg-white text-sm font-semibold text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-all duration-200 hover:bg-[#f8f8fb] active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-10 flex-1 items-center justify-center rounded-lg border-2 border-white/10 bg-[#d92d20] text-sm font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-all duration-200 hover:bg-[#b42318] active:scale-[0.98]"
          >
            Leave Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PiP Transcript Content ───────────────────────────────────────────────────
// Compact read-only transcript rendered inside the floating Picture-in-Picture window

function PipTranscriptContent({
  messages,
  participants,
  currentUserId,
  meetingTitle,
  platform,
  onClose,
}: {
  messages: LiveTranscriptMessage[];
  participants: ReturnType<typeof normalizeLiveParticipants>;
  currentUserId: string;
  meetingTitle: string;
  platform?: MeetingPlatform;
  onClose: () => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div className="flex h-screen flex-col bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[#e9eaeb] bg-[#fafafa] px-3 py-2.5">
        <span className="text-[11px] font-extrabold tracking-tight text-[#48476e]">MOFA</span>
        {platform === "Teams" && <img src="/teams.png" alt="Teams" className="size-3.5 shrink-0 object-contain" />}
        {platform === "Beem" && <img src="/beam-logo.png" alt="Beem" className="size-3.5 shrink-0 object-contain" />}
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#414651]">{meetingTitle}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-[#067647]">
          <span className="size-1.5 animate-pulse rounded-full bg-[#17b26a]" />
          Live
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          className="flex size-5 shrink-0 items-center justify-center rounded text-[#9fa3ae] transition-colors hover:bg-[#f3f3f7] hover:text-[#414651]"
          aria-label="Close floating transcript"
        >
          <X size={12} />
        </button>
      </div>

      {/* Live feed label */}
      <div className="flex shrink-0 items-center justify-between px-3 pb-1 pt-2">
        <span className="text-[9px] font-medium uppercase tracking-wider text-[#9fa3ae]">Live feed</span>
        <span className="text-[9px] text-[#9fa3ae]">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex flex-col gap-2">
          {messages.map((message, idx) => {
            const participant = participants.find((p) => p.id === message.speakerId);
            if (!participant) return null;
            const isYou = message.speakerId === currentUserId;
            const prevMsg = messages[idx - 1];
            const isSameAsPrev = prevMsg?.speakerId === message.speakerId;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-1.5",
                  isYou ? "flex-row-reverse" : "flex-row",
                  !isSameAsPrev && idx > 0 ? "mt-1" : "",
                )}
              >
                {/* Avatar */}
                {!isYou && (
                  isSameAsPrev
                    ? <div className="size-5 shrink-0" />
                    : (
                      <div
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-[#414651]"
                        style={{ backgroundColor: participant.bg }}
                      >
                        {participant.initials}
                      </div>
                    )
                )}

                <div className={cn("flex max-w-[85%] flex-col gap-0.5", isYou ? "items-end" : "items-start")}>
                  {/* Name + meta — only first in a consecutive group */}
                  {!isSameAsPrev && (
                    <div className={cn("flex flex-wrap items-center gap-1", isYou ? "flex-row-reverse" : "flex-row")}>
                      <span className="text-[10px] font-semibold text-[#414651]">
                        {isYou ? "You" : participant.name}
                      </span>
                      <span className="text-[9px] text-[#9fa3ae]">{message.time}</span>
                      {message.language && (
                        <span className="inline-flex items-center gap-px rounded-full border border-[#e0dde8] bg-white px-1 py-px text-[8px] text-[#717680]">
                          <Globe size={7} />
                          {message.language}
                        </span>
                      )}
                      {message.translated && (
                        <span className="rounded-full border border-[#b2ddff] bg-[#eff8ff] px-1 py-px text-[8px] font-semibold text-[#175cd3]">
                          Translated
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={cn(
                      "px-2.5 py-1.5 text-[12px] leading-[18px]",
                      isYou
                        ? "rounded-bl-xl rounded-br-xl rounded-tl-xl border border-[#d0cfdd] bg-[#e7e7ee] text-[#181d27]"
                        : "rounded-bl-xl rounded-br-xl rounded-tr-xl border border-[#e9eaeb] bg-[#fafafa] text-[#181d27]",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-[#f0f0f4] px-3 py-1.5 text-center">
        <span className="text-[9px] text-[#c1c4cd]">Read-only · Powered by MOFA Translation</span>
      </div>
    </div>
  );
}

// ─── Live Meeting Room ────────────────────────────────────────────────────────

function LiveMeetingRoom({ meeting }: { meeting: NonNullable<ReturnType<typeof MEETINGS.find>> }) {
  const router = useRouter();
  const participants = normalizeLiveParticipants(meeting);
  const [activePanel, setActivePanel] = React.useState<"transcript" | "participants">("transcript");
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);

  // ── Picture-in-Picture / floating popup state ────────────────────────────
  const [pipWindow, setPipWindow] = React.useState<Window | null>(null);
  const [pipPopupBlocked, setPipPopupBlocked] = React.useState(false);
  const isPipOpen = !!pipWindow;
  // Ref to the polling interval used to detect popup-window close (non-Chrome path)
  const pipPollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Memoised live messages so both the panel and PiP share the same reference
  const liveMessages = React.useMemo(() => buildLiveMessages(participants), [participants]);

  // Inject all CSS into the secondary window as inline text — no network fetch,
  // so styles are available synchronously before the first paint.
  const injectPipStyles = React.useCallback((win: Window) => {
    // 1. Base reset — applied first so it can be overridden
    const base = win.document.createElement("style");
    base.textContent =
      "*, *::before, *::after { box-sizing: border-box; } html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #fff; }";
    win.document.head.appendChild(base);

    // 2. Inline <style> tags (Next.js injects Tailwind here) — clone directly
    document.querySelectorAll("style").forEach((el) => {
      win.document.head.appendChild(el.cloneNode(true));
    });

    // 3. Linked stylesheets — read already-parsed cssRules from memory instead of
    //    re-fetching over the network, which eliminates the flash of unstyled content.
    const linkedCss = Array.from(document.styleSheets)
      .filter((sheet) => !!sheet.href)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules).map((r) => r.cssText);
        } catch {
          // Cross-origin sheets block cssRules access — fall back to a <link> clone
          return [];
        }
      })
      .join("\n");

    if (linkedCss) {
      const inlined = win.document.createElement("style");
      inlined.textContent = linkedCss;
      win.document.head.appendChild(inlined);
    } else {
      // Fallback for cross-origin sheets: clone the <link> tag (may flash briefly)
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((el) => {
        win.document.head.appendChild(el.cloneNode(true));
      });
    }
  }, []);

  const openPip = React.useCallback(async () => {
    if ("documentPictureInPicture" in window) {
      // ── Chrome 116+: true always-on-top Document Picture-in-Picture ──────
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pipWin = await (window as any).documentPictureInPicture.requestWindow({
          width: 380,
          height: 540,
        });
        injectPipStyles(pipWin);
        pipWin.addEventListener("pagehide", () => setPipWindow(null));
        setPipWindow(pipWin);
      } catch {
        // User cancelled the browser prompt — do nothing
      }
    } else {
      // ── All other browsers: window.open() floating popup ─────────────────
      // window.open is only blocked when NOT triggered by a user gesture,
      // so this click handler ensures it passes the popup-blocker check.
      const popup = window.open(
        "",
        "mofa-transcript-pip",
        [
          "width=380",
          "height=540",
          "top=80",
          "left=80",
          "resizable=yes",
          "scrollbars=no",
          "menubar=no",
          "toolbar=no",
          "location=no",
          "status=no",
        ].join(","),
      );

      if (!popup) {
        // Browser popup blocker prevented the window from opening
        setPipPopupBlocked(true);
        setTimeout(() => setPipPopupBlocked(false), 4000);
        return;
      }

      popup.document.title = "Live Transcript · MOFA";
      injectPipStyles(popup);

      // Poll every 500 ms to detect when the user closes the popup window
      // (there is no reliable cross-browser "close" event for child windows)
      if (pipPollRef.current) clearInterval(pipPollRef.current);
      pipPollRef.current = setInterval(() => {
        if (popup.closed) {
          clearInterval(pipPollRef.current!);
          pipPollRef.current = null;
          setPipWindow(null);
        }
      }, 500);

      setPipWindow(popup);
    }
  }, [injectPipStyles]);

  const closePip = React.useCallback(() => {
    // Clear the close-detection poll if running
    if (pipPollRef.current) {
      clearInterval(pipPollRef.current);
      pipPollRef.current = null;
    }
    pipWindow?.close();
    setPipWindow(null);
  }, [pipWindow]);

  // Clean up the poll interval if the component unmounts while PiP is open
  React.useEffect(() => {
    return () => {
      if (pipPollRef.current) clearInterval(pipPollRef.current);
    };
  }, []);

  // First participant acts as "You" for the demo
  const currentUserId = participants[0]?.id ?? "";

  // Pinned participants (always shown in main grid)
  const [pinnedIds, setPinnedIds] = React.useState<Set<string>>(new Set());
  const handlePin = React.useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Order: You → pinned → others
  const orderedParticipants = React.useMemo(() => [
    ...participants.filter((p) => p.id === currentUserId),
    ...participants.filter((p) => pinnedIds.has(p.id) && p.id !== currentUserId),
    ...participants.filter((p) => !pinnedIds.has(p.id) && p.id !== currentUserId),
  ], [participants, currentUserId, pinnedIds]);

  const hasOverflow = orderedParticipants.length > MAX_VISIBLE;
  const visibleSlots = hasOverflow ? MAX_VISIBLE - 1 : orderedParticipants.length;
  const visibleParticipants = orderedParticipants.slice(0, visibleSlots);
  const overflowParticipants = orderedParticipants.slice(visibleSlots);

  // Active speaker — rotate through all participants every 4.5s
  const [activeSpeakerId, setActiveSpeakerId] = React.useState(
    () => participants[participants.length - 1]?.id ?? "",
  );
  React.useEffect(() => {
    if (participants.length <= 1) return;
    let idx = participants.findIndex((p) => p.id === activeSpeakerId);
    const timer = setInterval(() => {
      idx = (idx + 1) % participants.length;
      setActiveSpeakerId(participants[idx].id);
    }, 4500);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.length]);

  const handleLeave = React.useCallback(() => {
    setShowLeaveDialog(false);
    router.push("/meetings");
  }, [router]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 pb-6 pt-2">
      {/* Leave confirmation dialog */}
      <LeaveConfirmDialog
        open={showLeaveDialog}
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveDialog(false)}
      />

      {/* Picture-in-Picture transcript portal — renders into the floating window */}
      {isPipOpen && pipWindow &&
        createPortal(
          <PipTranscriptContent
            messages={liveMessages}
            participants={participants}
            currentUserId={currentUserId}
            meetingTitle={meeting.title}
            platform={meeting.platform}
            onClose={closePip}
          />,
          pipWindow.document.body,
        )
      }

      {/* Title */}
      <h1 className="shrink-0 text-xl font-medium text-[#414651]">{meeting.title}</h1>

      {/* Two-column body */}
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── Call area ── */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#d5d7da] bg-[#fafafa] p-4">
          {/* Participant grid — flex-wrap so tiles center and wrap naturally */}
          <div className="flex min-h-0 flex-1 items-center justify-center p-2">
            <div className="flex flex-wrap justify-center gap-4">
              {visibleParticipants.map((participant, idx) => (
                <div
                  key={participant.id}
                  className="min-h-[170px] max-h-[240px]"
                  style={{ flex: `1 1 ${TILE_MIN_W}px`, maxWidth: `${TILE_MAX_W}px` }}
                >
                  <LiveParticipantTile
                    participant={participant}
                    isYou={participant.id === currentUserId}
                    isSpeaking={participant.id === activeSpeakerId}
                    index={idx}
                  />
                </div>
              ))}
              {/* More participants tile */}
              {overflowParticipants.length > 0 && (
                <div style={{ flex: `1 1 ${TILE_MIN_W}px`, maxWidth: `${TILE_MAX_W}px` }}>
                  <MoreParticipantsTile
                    participants={overflowParticipants}
                    onPin={handlePin}
                    pinnedIds={pinnedIds}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Timer + controls */}
          <div className="flex shrink-0 flex-col items-center gap-2 pb-1 pt-3">
            <LiveTimer />
            <button
              type="button"
              onClick={() => setShowLeaveDialog(true)}
              className="flex size-12 items-center justify-center rounded-full border-2 border-white/10 bg-[#d92d20] text-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-all duration-200 hover:bg-[#b42318] hover:shadow-[0_4px_12px_rgba(217,45,32,0.3)] active:scale-95"
              aria-label="Leave meeting"
              title="Leave meeting"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </section>

        {/* ── Transcript / Participants sidebar ── */}
        <aside className="flex min-h-0 w-[417px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#e9eaeb] bg-white">
          {/* Segment-style tab bar + pop-out button */}
          <div className="shrink-0 flex items-center gap-2 p-4">
            <div className="flex flex-1 rounded-[10px] bg-[#fafafa] border border-[#e9eaeb] p-1">
              {([
                { id: "transcript" as const, label: "Transcript" },
                { id: "participants" as const, label: "Participants" },
              ]).map((tab) => {
                const active = tab.id === activePanel;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePanel(tab.id)}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center rounded-md text-sm font-semibold transition-all duration-200",
                      active
                        ? "bg-white text-[#414651] shadow-[0_1px_3px_rgba(10,13,18,0.1),0_1px_2px_-1px_rgba(10,13,18,0.1)]"
                        : "text-[#717680] hover:text-[#535862]",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Pop-out / PiP button */}
            <div className="group relative shrink-0">
              <button
                type="button"
                onClick={isPipOpen ? closePip : openPip}
                aria-label={isPipOpen ? "Close floating transcript" : "Pop out transcript"}
                className={cn(
                  // size-11 = 44px square, matches the tab pill height (p-1 wrapper + h-9 inner buttons)
                  "flex size-11 items-center justify-center rounded-[10px] border font-semibold shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-all duration-200",
                  isPipOpen
                    ? "border-[#c8c7d8] bg-[#eeedf5] text-[#48476e] hover:bg-[#e4e3f0] hover:border-[#b8b7cc]"
                    : "border-[#d5d7da] bg-white text-[#414651] hover:bg-[#f9fafb] hover:border-[#c2c6cd]",
                )}
              >
                {isPipOpen ? <PictureInPicture2 size={18} /> : <PictureInPicture size={18} />}
              </button>

              {/* Hover tooltip label */}
              <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 origin-top scale-95 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
                <div className="whitespace-nowrap rounded-lg border border-[#e9eaeb] bg-[#181d27] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg">
                  {isPipOpen ? "Close floating transcript" : "Pop out transcript"}
                  {/* Arrow */}
                  <div className="absolute -top-1 right-3.5 size-2 rotate-45 border-l border-t border-[#e9eaeb] bg-[#181d27]" />
                </div>
              </div>

              {/* Popup blocked tooltip — shown when the browser's popup blocker fires */}
              {pipPopupBlocked && (
                <div className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-lg border border-[#e9eaeb] bg-white px-3 py-2.5 shadow-lg animate-[fadeSlideIn_0.15s_ease-out]">
                  <p className="text-[11px] font-semibold text-[#414651]">Popup blocked</p>
                  <p className="mt-0.5 text-[11px] leading-[17px] text-[#717680]">
                    Allow popups for this site in your browser settings, then try again.
                  </p>
                </div>
              )}
            </div>
          </div>

          {activePanel === "transcript" ? (
            <LiveTranscriptPanel messages={liveMessages} participants={participants} currentUserId={currentUserId} />
          ) : (
            <LiveParticipantsPanel participants={participants} currentUserId={currentUserId} />
          )}
        </aside>
      </div>
    </div>
  );
}

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
  const [showLiveRoom, setShowLiveRoom] = React.useState(false);

  const meeting = MEETINGS.find((m) => m.id === meetingId);
  const detail = MEETING_DETAILS[meetingId];

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

  if (meeting.status === "upcoming") {
    const participants = normalizeLiveParticipants(meeting);
    return showLiveRoom ? (
      <LiveMeetingRoom meeting={meeting} />
    ) : (
      <MeetingConnectingScreen
        meeting={meeting}
        participants={participants}
        onReady={() => setShowLiveRoom(true)}
      />
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <p className="text-base font-semibold text-[#414651]">Meeting details unavailable</p>
        <Link href="/meetings" className="text-sm text-[#6f6e8a] underline hover:text-[#414651]">
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
          meeting={meeting as any}
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

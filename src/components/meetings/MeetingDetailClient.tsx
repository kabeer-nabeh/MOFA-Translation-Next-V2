"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  FileText,
  Globe,
  Hash,
  Link2,
  Lock,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MoreVertical,
  LogOut,
  PhoneOff,
  Pause,
  PictureInPicture,
  PictureInPicture2,
  Pin,
  Play,
  Plus,
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
import {
  useActiveMeeting,
  type ActiveTranscriptLine,
} from "@/contexts/ActiveMeetingContext";
import { GuestList } from "@/components/meetings/GuestList";
import { getGuests } from "@/lib/services/guests";
import type { Guest } from "@/types/meeting";
import { AISummaryTab } from "@/components/meetings/AISummaryTab";
import { TranscriptTab, countUnclearMarkers, renderWithUnclearPlaceholders } from "@/components/meetings/TranscriptTab";
import { ParticipantsTab } from "@/components/meetings/ParticipantsTab";
import { ParticipantCard, EngagementBadge } from "@/components/meetings/ParticipantCard";

// ─── Waveform ─────────────────────────────────────────────────────────────────

function parseTimestamp(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  return 0;
}

// ─── Platform icon ────────────────────────────────────────────────────────────

function PlatformIcon({ platform, containerSize }: { platform?: MeetingPlatform; containerSize?: boolean }) {
  if (!platform) return null;
  if (platform === "Teams") return <img src="/teams.png" alt="Teams" className={cn("object-contain shrink-0", containerSize ? "size-4" : "size-5")} />;
  if (platform === "Beem") return <img src="/beam-logo.png" alt="Beem" className={cn("object-contain shrink-0", containerSize ? "size-4" : "size-5")} />;
  return <Monitor size={containerSize ? 13 : 14} className="text-[color:var(--mofa-text-muted)] shrink-0" />;
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
    <aside className="flex w-72 min-h-0 shrink-0 flex-col gap-4 overflow-y-auto pr-1">
      {/* Meeting info card */}
      <div className="shrink-0 rounded-xl border border-[color:var(--mofa-border-default)] bg-white overflow-hidden">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--mofa-text-muted)]">Meeting Info</p>
        </div>
        <div className="px-4 pt-2.5 pb-4 flex flex-col gap-4">
          {/* Host */}
          <div className="flex items-center gap-4">
            <User size={14} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
            <span className="w-16 shrink-0 text-xs text-[color:var(--mofa-text-placeholder)]">Host</span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[color:var(--mofa-text-primary)]">{meeting.host}</span>
          </div>
          {/* Date & Time */}
          <div className="flex gap-4">
            <Calendar size={14} className="shrink-0 text-[color:var(--mofa-text-muted)] mt-0.5" aria-hidden />
            <div className="flex flex-col w-16">
              <span className="text-xs text-[color:var(--mofa-text-placeholder)]">Date & Time</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[color:var(--mofa-text-primary)]">{meeting.date}</p>
              <p className="truncate text-xs font-medium text-[color:var(--mofa-text-primary)] mt-0.5">{meeting.timeRange}</p>
            </div>
          </div>
          {/* Duration */}
          <div className="flex items-center gap-4">
            <Clock size={14} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
            <span className="w-16 shrink-0 text-xs text-[color:var(--mofa-text-placeholder)]">Duration</span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[color:var(--mofa-text-primary)]">{detail.totalSpeakingTime}</span>
          </div>
          {/* Platform */}
          {meeting.platform && (
            <div className="flex items-center gap-4">
              <PlatformIcon platform={meeting.platform} />
              <span className="w-16 shrink-0 text-xs text-[color:var(--mofa-text-placeholder)]">Platform</span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[color:var(--mofa-text-primary)]">{meeting.platform}</span>
            </div>
          )}
          {/* Languages */}
          {meeting.languages && (
            <div className="flex items-center gap-4">
              <Globe size={14} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
              <span className="w-16 shrink-0 text-xs text-[color:var(--mofa-text-placeholder)]">Languages</span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[color:var(--mofa-text-primary)]">{meeting.languages}</span>
            </div>
          )}
          {/* Participants */}
          <div className="flex items-center gap-4">
            <Users size={14} className="shrink-0 text-[color:var(--mofa-text-muted)]" aria-hidden />
            <span className="w-16 shrink-0 text-xs text-[color:var(--mofa-text-placeholder)]">Participants</span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[color:var(--mofa-text-primary)]">{meeting.participantCount} people</span>
          </div>
        </div>
      </div>

      {/* Speakers quick list */}
      <div className="shrink-0 rounded-xl border border-[color:var(--mofa-border-default)] bg-white overflow-hidden flex flex-col">
        <p className="px-4 pt-4 pb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--mofa-text-muted)]">Speakers</p>
        <div className="flex flex-col gap-2 px-4 pb-4 overflow-y-auto max-h-48">
          {detail.participants.map((p) => {
            const dot = p.engagement === "Very High" ? "#17b26a"
              : p.engagement === "High" ? "#2e90fa"
              : p.engagement === "Medium" ? "#f79009"
              : p.engagement === "Low" ? "#f04438"
              : "var(--mofa-text-muted)";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onParticipantClick?.(p.id)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-[color:var(--mofa-btn-outline-hover)]"
              >
                <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[color:var(--mofa-text-body)]"
                  style={{ backgroundColor: p.bg }}>
                  {p.initials}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: dot }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[color:var(--mofa-text-body)]">{p.name}</p>
                  <p className="text-[10px] text-[color:var(--mofa-text-muted)]">{p.wordPercent}% · {p.speakingTime}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keywords */}
      <div className="flex-1 min-h-0 rounded-xl border border-[color:var(--mofa-border-default)] bg-white overflow-hidden flex flex-col">
        <p className="shrink-0 px-4 pt-4 pb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--mofa-text-muted)]">Keywords</p>
        <div className="flex flex-1 flex-wrap content-start gap-1.5 overflow-y-auto px-4 pb-4">
          {detail.keywords.map((kw) => (
            <span key={kw} dir="rtl"
              className="rounded-full border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--mofa-text-secondary)]">
              {kw}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type TabId = "summary" | "transcript" | "participants";


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
              <span className="text-xs text-[color:var(--mofa-text-muted)]">{list.length} item{list.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex flex-col gap-2">
              {list.map((item, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-[color:var(--mofa-border-default)] bg-white px-4 py-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: style.dot }} />
                  <div>
                    <p className="text-sm text-[color:var(--mofa-text-body)]">{item.text}</p>
                    {item.owner && (
                      <p className="mt-1 text-xs text-[color:var(--mofa-text-muted)]">Owner: <span className="font-medium">{item.owner}</span></p>
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
  arabicText?: string;
  time: string;
  translated?: boolean;
  language?: string;
  /** True if this message contains [unclear] audio quality markers */
  hasUnclear?: boolean;
};


/** Messages use relative participant indices: the first participant (index 0) = "You" */
function buildLiveMessages(participants: ReturnType<typeof normalizeLiveParticipants>): LiveTranscriptMessage[] {
  const pid = (idx: number) => participants[idx]?.id ?? "p1";
  return [
    { id: "l1", speakerId: pid(1), time: "6:02 PM", language: "Arabic", text: "We have the ambassadorial briefing in ten minutes — let's confirm the consular affairs agenda.", arabicText: "لدينا الإحاطة السفارية في غضون عشر دقائق — دعنا نؤكد جدول أعمال الشؤون القنصلية." },
    { id: "l2", speakerId: pid(1), time: "6:02 PM", language: "Arabic", translated: true, text: "Please make sure all interpreter channels are active before we begin.", arabicText: "يرجى التأكد من أن جميع قنوات المترجمين نشطة قبل أن نبدأ." },
    { id: "l3", speakerId: pid(0), time: "6:03 PM", language: "English", text: "Agreed. I've reviewed the memorandum of understanding — everything looks good on my end.", arabicText: "موافق. لقد راجعت مذكرة تفاهم الأخيرة — كل شيء يبدو جيداً من جهتي." },
    { id: "l4", speakerId: pid(2), time: "6:04 PM", language: "English", text: "I'll cover the opening context and hand over to the [unclear] coordination updates.", arabicText: "سأتناول السياق الافتتاحي ثم أنتقل إلى تحديثات [unclear] الدبلوماسي.", hasUnclear: true },
    { id: "l5", speakerId: pid(1), time: "6:06 PM", language: "Arabic", translated: true, text: "Engineering is ready. The bilateral agreement draft was also cleared by the Foreign Affairs Ministry.", arabicText: "الفريق الهندسي جاهز. كما تمت مراجعة اتفاقية ثنائية من قِبل وزارة الخارجية." },
    { id: "l6", speakerId: pid(3), time: "6:08 PM", language: "English", text: "From the client side, the main concern is keeping [unclear] consistent during the [unclear] segment.", arabicText: "من جانب العميل، يتمحور الاهتمام الرئيسي حول [unclear] خلال مقطع الأمن.", hasUnclear: true },
    { id: "l7", speakerId: pid(0), time: "6:09 PM", language: "English", text: "Good point. The ambassador plenipotentiary flagged this — let me align with the translation team.", arabicText: "نقطة جيدة. أشار إليها سفير فوق العادة — دعني أنسق مع فريق الترجمة." },
    { id: "l8", speakerId: pid(2), time: "6:10 PM", language: "English", text: "I am monitoring the interpreter panel and participant language preferences right now.", arabicText: "أراقب لوحة المترجمين وتفضيلات اللغة للمشاركين الآن." },
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
          ? "border-[rgba(0,0,0,0.1)] shadow-[0_0_0_2px_#F5F4F1,0_0_0_3px_#C8C4BC]"
          : "border-[rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.15)]",
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Radial decorative background */}
      <div className="pointer-events-none absolute -top-8 left-1/2 size-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.025)_0%,transparent_70%)]" />

      {/* Avatar */}
      <div
        className="relative flex size-16 shrink-0 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] text-lg font-semibold text-[color:var(--mofa-text-body)] transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: participant.bg }}
      >
        {participant.initials}
      </div>

      {/* Name + role */}
      <div className="flex w-full min-w-0 flex-col items-center gap-0.5 px-3">
        <div className="flex w-full min-w-0 items-center justify-center gap-1.5">
          <p className="min-w-0 truncate text-sm font-semibold text-[color:var(--mofa-text-body)]">
            {participant.name}
          </p>
          {isYou && (
            <span className="shrink-0 rounded-full border border-[color:var(--mofa-border-default)] bg-white px-2 py-0.5 text-[10px] font-medium text-[color:var(--mofa-text-secondary)]">
              You
            </span>
          )}
        </div>
        <p className="w-full truncate text-center text-[11px] text-[color:var(--mofa-text-subtle)]">
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
        className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[color:var(--mofa-border-default)] bg-[#f5f5f7] transition-colors duration-200 hover:bg-[color:var(--mofa-btn-outline-hover)]"
      >
        <div className="flex size-10 items-center justify-center rounded-full border border-[color:var(--mofa-border-default)] bg-white">
          <Users size={18} className="text-[color:var(--mofa-text-muted)]" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-sm font-semibold text-[color:var(--mofa-text-body)]">+{participants.length} more</p>
          <p className="text-[10px] text-[color:var(--mofa-text-placeholder)]">Hover to view</p>
        </div>
      </button>

      {/* Popover */}
      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[260px] overflow-hidden rounded-2xl border border-[color:var(--mofa-border-default)] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.15s_ease-out_both]"
        >
          <div className="border-b border-[color:var(--mofa-border-default)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--mofa-text-placeholder)]">
              {participants.length} Participants
            </p>
          </div>
          <ul className="max-h-[220px] overflow-y-auto p-2">
            {participants.map((p) => {
              const isPinned = pinnedIds.has(p.id);
              return (
                <li key={p.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-[color:var(--mofa-btn-outline-hover)]">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-[color:var(--mofa-text-body)]"
                    style={{ backgroundColor: p.bg }}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[color:var(--mofa-text-body)]">{p.name}</p>
                    <p className="truncate text-[10px] text-[color:var(--mofa-text-muted)]">{p.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPin(p.id)}
                    title={isPinned ? "Unpin" : "Pin to view"}
                    className={cn(
                      "shrink-0 rounded-md p-1.5 transition-colors duration-150",
                      isPinned
                        ? "text-[color:var(--mofa-accent)] hover:bg-[color:var(--mofa-btn-outline-hover)]"
                        : "text-[color:var(--mofa-text-placeholder)] hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-body)]",
                    )}
                  >
                    <Pin size={13} className={isPinned ? "fill-[color:var(--mofa-accent)]" : ""} />
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
  isInApp = false,
}: {
  messages: LiveTranscriptMessage[];
  participants: ReturnType<typeof normalizeLiveParticipants>;
  currentUserId: string;
  isInApp?: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = React.useState(false);

  // ── Language state ───────────────────────────────────────────────────────
  const [targetLang, setTargetLang] = React.useState("Arabic");
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
      <div className="flex shrink-0 items-center gap-2 border-b border-[color:var(--mofa-border-default)] bg-white px-4 pb-2.5 pt-0">
        {/* Source — label + value */}
        <span className="text-xs font-medium text-[color:var(--mofa-text-placeholder)]">Source</span>
        <div className="flex items-center gap-1">
          <Globe size={12} className="shrink-0 text-[color:var(--mofa-text-muted)]" />
          <span className="text-xs font-semibold text-[color:var(--mofa-text-subtle)]">{sourceLang}</span>
        </div>
        <ArrowRight size={12} className="shrink-0 text-[color:var(--mofa-text-faint)]" />
        {/* Target — label + interactive value */}
        <span className="text-xs font-medium text-[color:var(--mofa-text-placeholder)]">Target</span>
        <div ref={langMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowLangMenu((v) => !v)}
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-[color:var(--mofa-btn-outline-hover)]"
          >
            <Globe size={12} className="shrink-0 text-[color:var(--mofa-accent)]" />
            <span className="text-xs font-semibold text-[color:var(--mofa-accent)]">{targetLang}</span>
            <ChevronDown
              size={11}
              className={cn("shrink-0 text-[color:var(--mofa-accent)] transition-transform duration-150", showLangMenu && "rotate-180")}
            />
          </button>

          {showLangMenu && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[152px] overflow-hidden rounded-xl border border-[color:var(--mofa-border-default)] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)] animate-[fadeSlideIn_0.15s_ease-out]">
              <p className="px-3 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-wider text-[color:var(--mofa-text-placeholder)]">
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
                      ? "bg-[color:var(--mofa-sidebar-active-bg)] font-semibold text-[color:var(--mofa-accent)]"
                      : "text-[color:var(--mofa-text-body)] hover:bg-[color:var(--mofa-btn-outline-hover)]",
                  )}
                >
                  <span className="flex w-3 shrink-0 items-center justify-center">
                    {lang === targetLang && <Check size={11} className="text-[color:var(--mofa-accent)]" />}
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
                        className="flex size-8 items-center justify-center rounded-full text-[10px] font-bold text-[color:var(--mofa-text-body)]"
                        style={{ backgroundColor: participant.bg }}
                      >
                        {participant.initials}
                      </div>
                    )
                  ) : null}
                </div>

                {/* Bubble + meta */}
                <div className={cn("flex max-w-[80%] flex-col gap-2", isYou ? "items-end" : "items-start")}>
                  {/* Bubble — extract hasUnclear/unclearWordsCount first for use in metadata row */}
                  {(() => {
                    const showArabic = targetLang === "Arabic" && !!message.arabicText;
                    const rawText = showArabic ? message.arabicText! : message.text;
                    const hasUnclear = !!message.hasUnclear;
                    const unclearWordsCount = hasUnclear ? countUnclearMarkers(rawText) : 0;

                    return (
                      <>
                        {/* Speaker name + time + unclear badge — only on first message of a group */}
                        {!isSameAsPrev && (
                          <div className={cn("flex items-center justify-between gap-2", isYou ? "flex-row-reverse" : "flex-row")}>
                            <div className={cn("flex items-center gap-2", isYou ? "flex-row-reverse" : "flex-row")}>
                              <span className="text-xs font-semibold text-[color:var(--mofa-text-body)]">
                                {isYou ? "You" : participant.name}
                              </span>
                              <span className="text-[10px] text-[color:var(--mofa-text-placeholder)]">{message.time}</span>
                            </div>
                            {hasUnclear && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#fde68a] bg-[#fffbeb] px-2 py-0.5 text-[10px] font-semibold text-[#b45309]">
                                <AlertTriangle size={9} className="shrink-0" aria-hidden />
                                {unclearWordsCount} word{unclearWordsCount > 1 ? "s" : ""} unclear
                              </span>
                            )}
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          dir={showArabic ? "rtl" : undefined}
                          className={cn(
                            "relative border px-3 py-2 text-sm leading-7 text-[color:var(--mofa-text-primary)] transition-colors duration-200",
                            showArabic && "text-right",
                            hasUnclear && "border-[#fde68a]",
                            isYou
                              ? "rounded-bl-lg rounded-br-lg rounded-tl-lg border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] hover:bg-[color:var(--mofa-btn-outline-hover)]"
                              : "rounded-bl-lg rounded-br-lg rounded-tr-lg border-[color:var(--mofa-border-default)] bg-[#fafafa] hover:bg-[color:var(--mofa-btn-outline-hover)]",
                          )}
                          style={showArabic ? { fontFamily: "var(--font-ibm-plex-sans-arabic, var(--font-ibm-plex-sans))" } : undefined}
                        >
                          {isLastMsg && !showArabic ? (
                            <>
                              {lastMsgWords.slice(0, revealedCount).map((word, wordIdx) => (
                                <React.Fragment key={wordIdx}>
                                  <span className="animate-[wordPop_0.15s_ease-out_both]">{word}</span>
                                  {wordIdx < lastMsgWords.length - 1 ? " " : ""}
                                </React.Fragment>
                              ))}
                              {revealedCount < lastMsgWords.length && (
                                <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse rounded-sm bg-[#9fa3ae] align-middle" />
                              )}
                            </>
                          ) : (
                            renderWithUnclearPlaceholders(rawText, {
                              isRtl: showArabic,
                              highlightKeywords: showArabic,
                            })
                          )}
                        </div>
                      </>
                    );
                  })()}
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
          className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--mofa-border-default)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--mofa-text-body)] shadow-md transition-all duration-200 hover:bg-[color:var(--mofa-btn-outline-hover)] animate-[fadeSlideIn_0.2s_ease-out]"
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
  meetingId,
  isInApp = false,
  showAddGuestModal = false,
  onAddGuestModalClose,
}: {
  participants: ReturnType<typeof normalizeLiveParticipants>;
  currentUserId: string;
  meetingId: string;
  isInApp?: boolean;
  showAddGuestModal?: boolean;
  onAddGuestModalClose?: () => void;
}) {
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [guestsReady, setGuestsReady] = React.useState(false);

  React.useEffect(() => {
    if (!isInApp) { setGuestsReady(true); return; }
    getGuests(meetingId).then((g) => { setGuests(g); setGuestsReady(true); });
  }, [meetingId, isInApp]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* ── Internal participants ── */}
      <div className="px-4 pb-2 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--mofa-text-muted)]">
          Participants · {participants.length}
        </p>
      </div>
      <div className="flex flex-col gap-0.5 px-3 pb-3">
        {participants.map((participant, index) => {
          const isYou = participant.id === currentUserId;
          const isSpeaking = index < 2;
          const dotColor = isSpeaking ? "#17b26a" : "#98a2b3";
          return (
            <div
              key={participant.id}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-[color:var(--mofa-btn-outline-hover)] animate-[fadeSlideIn_0.3s_ease-out_both]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[color:var(--mofa-text-body)]"
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-medium text-[color:var(--mofa-text-body)]">{participant.name}</p>
                  {isYou && (
                    <span className="shrink-0 rounded-full border border-[color:var(--mofa-border-default)] bg-white px-1.5 py-px text-[10px] font-medium text-[color:var(--mofa-text-secondary)]">
                      You
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[color:var(--mofa-text-muted)]">{participant.role}</p>
              </div>
              <span className={cn(
                "shrink-0 text-[11px] font-medium",
                isSpeaking ? "text-[#067647]" : "text-[color:var(--mofa-text-placeholder)]",
              )}>
                {isSpeaking ? "Speaking" : "Listening"}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Guests section — In App only ── */}
      {isInApp && (
        <>
          <div className="mx-3 my-1 h-px bg-[#f0f0f4]" />
          <div className="pb-3 pt-1">
            {guestsReady ? (
              <GuestList
                meetingId={meetingId}
                initialGuests={guests}
                showAddModal={showAddGuestModal}
                onAddModalClose={onAddGuestModalClose}
              />
            ) : (
              <div className="flex items-center justify-center py-4">
                <span className="size-4 animate-spin rounded-full border-2 border-[color:var(--mofa-border-default)] border-t-[color:var(--mofa-accent)]" />
              </div>
            )}
          </div>
        </>
      )}
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
    <p className="tabular-nums text-xs font-medium text-[color:var(--mofa-text-subtle)]">
      {mm}<span className="animate-pulse">:</span>{ss}
    </p>
  );
}

// ─── Microphone Test Screen (In-App meetings only) ───────────────────────────

type MicTestStatus = "idle" | "checking" | "passed" | "failed" | "testing-volume";

function MicrophoneTestScreen({
  meeting,
  participants,
  onReady,
}: {
  meeting: NonNullable<ReturnType<typeof MEETINGS.find>>;
  participants: ReturnType<typeof normalizeLiveParticipants>;
  onReady: () => void;
}) {
  const [status, setStatus] = React.useState<MicTestStatus>("checking");
  const [volumeLevel, setVolumeLevel] = React.useState(0);
  const [showSkipWarning, setShowSkipWarning] = React.useState(false);
  const streamRef = React.useRef<MediaStream | null>(null);
  const analyzerRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  // Start mic detection and volume test
  React.useEffect(() => {
    const startTest = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Create audio context for volume detection
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyzer = audioCtx.createAnalyser();
        analyzerRef.current = analyzer;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyzer);

        // Move to volume testing phase
        setStatus("testing-volume");

        // Monitor volume levels
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        const checkVolume = () => {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolumeLevel(Math.min(100, (average / 256) * 100));
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch (error) {
        setStatus("failed");
        cleanupStream();
      }
    };

    startTest();
    return () => cleanupStream();
  }, []);

  const cleanupStream = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleProceed = () => {
    if (status === "testing-volume") {
      setStatus("passed");
      cleanupStream();
      setTimeout(onReady, 500);
    }
  };

  const handleRetry = () => {
    cleanupStream();
    setStatus("checking");
    setVolumeLevel(0);
    setShowSkipWarning(false);
  };

  const handleSkip = () => {
    cleanupStream();
    setShowSkipWarning(false);
    onReady();
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-gradient-to-br from-[color:var(--mofa-page-bg)] to-[color:var(--mofa-sidebar-active-bg)] p-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[color:var(--mofa-text-primary)]">Microphone Test</h1>
        <p className="mt-1 text-sm text-[color:var(--mofa-text-muted)]">Checking your audio setup before we start</p>
      </div>

      {/* Test stages */}
      <div className="w-full max-w-sm space-y-4">
        {/* Stage 1: Mic detection */}
        <div className="rounded-lg border border-[color:var(--mofa-border-default)] bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                status === "checking" ? "bg-[color:var(--mofa-sidebar-active-bg)]" : status === "failed" ? "bg-[#fee2e2]" : "bg-[#dcfce7]"
              )}>
                {status === "failed" ? (
                  <Mic size={16} className="text-[#d92d20]" />
                ) : (
                  <Mic size={16} className={status === "checking" ? "text-[color:var(--mofa-text-muted)]" : "text-[#17b26a]"} />
                )}
              </div>
              <span className="text-sm font-medium text-[color:var(--mofa-text-body)]">Microphone detection</span>
            </div>
            {status === "checking" ? (
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full bg-[color:var(--mofa-accent)] animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            ) : status === "failed" ? (
              <span className="text-xs font-semibold text-[#d92d20]">✗ Not found</span>
            ) : (
              <span className="text-xs font-semibold text-[#17b26a]">✓ Connected</span>
            )}
          </div>
          {status === "failed" && (
            <p className="mt-2 text-xs text-[color:var(--mofa-text-muted)]">No microphone detected. Please connect a microphone and try again.</p>
          )}
        </div>

        {/* Stage 2: Volume test */}
        {status !== "failed" && (
          <div className="rounded-lg border border-[color:var(--mofa-border-default)] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  volumeLevel > 30 ? "bg-[#dcfce7]" : "bg-[#fef3c7]"
                )}>
                  <Volume2 size={16} className={volumeLevel > 30 ? "text-[#17b26a]" : "text-[#f59e0b]"} />
                </div>
                <span className="text-sm font-medium text-[color:var(--mofa-text-body)]">Volume level</span>
              </div>
              <span className="text-xs text-[color:var(--mofa-text-muted)]">{Math.round(volumeLevel)}%</span>
            </div>
            {/* Volume bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#e9eaeb]">
              <div
                className={cn(
                  "h-full transition-all duration-100",
                  volumeLevel > 30 ? "bg-[#17b26a]" : "bg-[#f59e0b]",
                )}
                style={{ width: `${volumeLevel}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[color:var(--mofa-text-muted)]">
              {volumeLevel < 10
                ? "Speak into your microphone to test volume"
                : volumeLevel < 30
                  ? "⚠️ Volume is low for translation quality"
                  : "✓ Volume level is good"}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {status === "failed" ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="flex h-10 items-center justify-center rounded-lg border border-[#212121] bg-[#212121] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-all duration-200 hover:bg-[#1a1a1a] active:scale-[0.98]"
          >
            Retry Test
          </button>
          <button
            type="button"
            onClick={() => setShowSkipWarning(true)}
            className="flex h-10 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-4 text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
          >
            Skip for now
          </button>
        </div>
      ) : status === "passed" ? (
        <div className="flex items-center gap-2 rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-4 py-2 animate-[fadeSlideIn_0.3s_ease-out]">
          <div className="size-2 rounded-full bg-[#17b26a]" />
          <span className="text-xs font-semibold text-[#067647]">Ready to enter meeting</span>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleProceed}
            className="flex h-10 items-center justify-center rounded-lg border border-[#212121] bg-[#212121] px-6 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-all duration-200 hover:bg-[#1a1a1a] active:scale-[0.98]"
          >
            Proceed to Meeting
          </button>
          <button
            type="button"
            onClick={handleRetry}
            className="flex h-10 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-4 text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
          >
            Retry Test
          </button>
          <button
            type="button"
            onClick={() => setShowSkipWarning(true)}
            className="flex h-10 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-4 text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
          >
            Skip
          </button>
        </div>
      )}

      {/* Skip confirmation warning */}
      {showSkipWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-[fadeSlideIn_0.15s_ease-out]">
          <div className="w-full max-w-xs rounded-2xl border border-[color:var(--mofa-border-default)] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.2s_ease-out]">
            <h3 className="text-base font-semibold text-[color:var(--mofa-text-primary)]">Skip microphone test?</h3>
            <p className="mt-2 text-sm text-[color:var(--mofa-text-subtle)]">
              Skipping this test may affect translation quality. Make sure your microphone is working properly before proceeding.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSkipWarning(false)}
                className="flex h-9 flex-1 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="flex h-9 flex-1 items-center justify-center rounded-lg border border-[#f59e0b] bg-[#fff7ed] text-sm font-semibold text-[#b45309] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-all hover:bg-[#fef3c7] active:scale-[0.98]"
              >
                Skip anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Connecting Screen (Teams/Beem or post-test) ────────────────────────────

function MeetingConnectingScreen({
  meeting,
  participants,
  onReady,
}: {
  meeting: NonNullable<ReturnType<typeof MEETINGS.find>>;
  participants: ReturnType<typeof normalizeLiveParticipants>;
  onReady: () => void;
}) {
  const [showMicTest, setShowMicTest] = React.useState(meeting.platform === "In App");
  const isInApp = meeting.platform === "In App";

  // Auto-proceed for non-in-app meetings
  React.useEffect(() => {
    if (!isInApp) {
      const timer = setTimeout(onReady, 2500);
      return () => clearTimeout(timer);
    }
  }, [isInApp, onReady]);

  // Show mic test for in-app, or skip to connecting screen
  if (isInApp && showMicTest) {
    return (
      <MicrophoneTestScreen
        meeting={meeting}
        participants={participants}
        onReady={() => {
          setShowMicTest(false);
          setTimeout(onReady, 500);
        }}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 bg-gradient-to-br from-[color:var(--mofa-page-bg)] to-[color:var(--mofa-sidebar-active-bg)] p-6">
      {/* Meeting title */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[color:var(--mofa-text-primary)]">{meeting.title}</h1>
        <p className="mt-2 text-sm text-[color:var(--mofa-text-muted)]">Connecting to meeting room...</p>
      </div>

      {/* Participant avatars preview */}
      <div className="flex items-center justify-center gap-3">
        {participants.slice(0, 4).map((p, idx) => (
          <div
            key={p.id}
            className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white text-base font-bold text-[color:var(--mofa-text-body)] shadow-md transition-all duration-500 hover:scale-110 animate-[fadeSlideIn_0.3s_ease-out_both]"
            style={{
              backgroundColor: p.bg,
              animationDelay: `${idx * 100}ms`,
            }}
          >
            {p.initials}
          </div>
        ))}
        {participants.length > 4 && (
          <div className="flex size-14 items-center justify-center rounded-full border-2 border-white bg-[#e9eaeb] text-sm font-bold text-[color:var(--mofa-text-body)] shadow-md animate-[fadeSlideIn_0.3s_ease-out_both]" style={{ animationDelay: '400ms' }}>
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
              className="size-2.5 rounded-full bg-[color:var(--mofa-accent)] animate-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-[color:var(--mofa-text-subtle)]">
          {participants.length} participants
        </p>
      </div>

      {/* Ready indicator */}
      <div className="flex items-center gap-2 rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-4 py-2">
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
        className="w-full max-w-sm rounded-2xl border border-[color:var(--mofa-border-default)] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.2s_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-[color:var(--mofa-sidebar-active-bg)] mb-4">
          <LogOut size={20} className="text-[color:var(--mofa-accent)]" />
        </div>
        <h2 id="leave-title" className="text-base font-semibold text-[color:var(--mofa-text-primary)]">
          Leave MOFA Translation view?
        </h2>
        <p className="mt-1 text-sm text-[color:var(--mofa-text-subtle)]">
          This closes the live translation panel only. Your call on <span className="font-medium text-[color:var(--mofa-text-body)]">Beem or Teams</span> will continue uninterrupted — you can rejoin the translation view anytime from the meetings page.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 flex-1 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-10 flex-1 items-center gap-2 justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
          >
            <LogOut size={14} aria-hidden />
            Leave View
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
  targetLang,
  onClose,
}: {
  messages: LiveTranscriptMessage[];
  participants: ReturnType<typeof normalizeLiveParticipants>;
  currentUserId: string;
  meetingTitle: string;
  platform?: MeetingPlatform;
  targetLang: string;
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
      <div className="flex shrink-0 items-center gap-2 border-b border-[color:var(--mofa-border-default)] bg-[#fafafa] px-3 py-2.5">
        <span className="text-[11px] font-extrabold tracking-tight text-[color:var(--mofa-accent)]">MOFA</span>
        {platform === "Teams" && <img src="/teams.png" alt="Teams" className="size-3.5 shrink-0 object-contain" />}
        {platform === "Beem" && <img src="/beam-logo.png" alt="Beem" className="size-3.5 shrink-0 object-contain" />}
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[color:var(--mofa-text-body)]">{meetingTitle}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-[#067647]">
          <span className="size-1.5 animate-pulse rounded-full bg-[#17b26a]" />
          Live
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          className="flex size-5 shrink-0 items-center justify-center rounded text-[color:var(--mofa-text-placeholder)] transition-colors hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-body)]"
          aria-label="Close floating transcript"
        >
          <X size={12} />
        </button>
      </div>

      {/* Live feed label */}
      <div className="flex shrink-0 items-center justify-between px-3 pb-1 pt-2">
        <span className="text-[9px] font-medium uppercase tracking-wider text-[color:var(--mofa-text-placeholder)]">Live feed</span>
        <span className="text-[9px] text-[color:var(--mofa-text-placeholder)]">{messages.length} messages</span>
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
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-[color:var(--mofa-text-body)]"
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
                      <span className="text-[10px] font-semibold text-[color:var(--mofa-text-body)]">
                        {isYou ? "You" : participant.name}
                      </span>
                      <span className="text-[9px] text-[color:var(--mofa-text-placeholder)]">{message.time}</span>
                      {message.language && (
                        <span className="inline-flex items-center gap-px rounded-full border border-[color:var(--mofa-border-default)] bg-white px-1 py-px text-[8px] text-[color:var(--mofa-text-muted)]">
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
                  {(() => {
                    const showArabic = targetLang === "Arabic" && !!message.arabicText;
                    return (
                      <div
                        dir={showArabic ? "rtl" : undefined}
                        className={cn(
                          "px-2.5 py-1.5 text-[12px] leading-[18px]",
                          showArabic && "text-right",
                          isYou
                            ? "rounded-bl-xl rounded-br-xl rounded-tl-xl border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] text-[color:var(--mofa-text-primary)]"
                            : "rounded-bl-xl rounded-br-xl rounded-tr-xl border border-[color:var(--mofa-border-default)] bg-[#fafafa] text-[color:var(--mofa-text-primary)]",
                        )}
                        style={showArabic ? { fontFamily: "var(--font-ibm-plex-sans-arabic, var(--font-ibm-plex-sans))" } : undefined}
                      >
                        {showArabic ? message.arabicText : message.text}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-[color:var(--mofa-border-default)] px-3 py-1.5 text-center">
        <span className="text-[9px] text-[color:var(--mofa-text-faint)]">Read-only · Powered by MOFA Translation</span>
      </div>
    </div>
  );
}

// MinimizedMeetingOverlay has been replaced by the global DraggableMinimizedOverlay
// in ActiveMeetingContext. The overlay now persists across all pages.

// ─── Live Meeting Room ────────────────────────────────────────────────────────

function LiveMeetingRoom({ meeting }: { meeting: NonNullable<ReturnType<typeof MEETINGS.find>> }) {
  const router = useRouter();
  const { startSession, endSession, minimizeSession, updateLines } = useActiveMeeting();
  // Memoize so the reference is stable across context-driven re-renders
  const participants = React.useMemo(() => normalizeLiveParticipants(meeting), [meeting]);
  const [activePanel, setActivePanel] = React.useState<"transcript" | "participants">("transcript");
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);
  const isInApp = meeting.platform === "In App";
  const [micOn, setMicOn] = React.useState(false);
  const [speakerOn, setSpeakerOn] = React.useState(true);
  // Target language for PiP transcript (mirrors LiveTranscriptPanel state)
  const [targetLang, setTargetLang] = React.useState("Arabic");
  const [showAddGuestModal, setShowAddGuestModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedPassword, setCopiedPassword] = React.useState(false);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [sendSummary, setSendSummary] = React.useState(false);
  const [sendTranscript, setSendTranscript] = React.useState(false);

  // Generate stable mock meeting link + password from meeting id
  const meetingLink = `https://meet.mofa.gov.sa/join/${meeting.id}`;
  const meetingPassword = React.useMemo(() => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let result = "";
    let seed = meeting.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    for (let i = 0; i < 8; i++) {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      result += chars[Math.abs(seed) % chars.length];
    }
    return result;
  }, [meeting.id]);

  const copyToClipboard = (text: string, type: "link" | "password") => {
    navigator.clipboard.writeText(text).catch(() => {});
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  // ── Space-bar press-to-talk shortcut (in-app only) ───────────────────────
  React.useEffect(() => {
    if (!isInApp) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setMicOn(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setMicOn(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isInApp]);

  // ── Register this meeting in the global context when we enter the live room ──
  React.useEffect(() => {
    startSession({ id: meeting.id, title: meeting.title, platform: meeting.platform });
    // When navigating away without explicitly leaving (e.g. nav-bar click),
    // auto-minimise so the overlay persists on other pages.
    return () => {
      minimizeSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting.id]);

  // ── Picture-in-Picture / floating popup state ────────────────────────────
  const [pipWindow, setPipWindow] = React.useState<Window | null>(null);
  const [pipPopupBlocked, setPipPopupBlocked] = React.useState(false);
  const isPipOpen = !!pipWindow;
  // Ref to the polling interval used to detect popup-window close (non-Chrome path)
  const pipPollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Memoised live messages so both the panel and PiP share the same reference
  const liveMessages = React.useMemo(() => buildLiveMessages(participants), [participants]);

  // ── Keep the global context transcript lines in sync ──────────────────────
  React.useEffect(() => {
    const lines: ActiveTranscriptLine[] = liveMessages.map((m) => {
      const p = participants.find((x) => x.id === m.speakerId);
      const isYou = m.speakerId === currentUserId;
      return {
        id: m.id,
        speakerName: isYou ? "You" : (p?.name ?? m.speakerId),
        initials: p?.initials ?? m.speakerId.slice(0, 2).toUpperCase(),
        colorClass: p?.bg ? `bg-[${p.bg}]` : "bg-[#6941c6]",
        text: m.text,
        isYou,
      };
    });
    updateLines(lines);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMessages]);

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
    endSession(); // clear global session — overlay disappears
    setShowLeaveDialog(false);
    router.push("/meetings");
  }, [endSession, router]);

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
            targetLang={targetLang}
            onClose={closePip}
          />,
          pipWindow.document.body,
        )
      }

      {/* Title row */}
      <div className="flex shrink-0 items-center gap-2.5">
        {/* Back button — minimises to global overlay and navigates back */}
        <button
          type="button"
          onClick={() => { minimizeSession(); router.back(); }}
          title="Back to meetings"
          aria-label="Back to meetings"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white text-[color:var(--mofa-text-muted)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-body)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
        >
          <ArrowLeft size={15} />
        </button>

        {/* Title + platform badge grouped together */}
        <h1 className="text-xl font-medium text-[color:var(--mofa-text-body)]">{meeting.title}</h1>
        {meeting.platform && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-btn-outline-hover)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--mofa-text-subtle)]">
            <PlatformIcon platform={meeting.platform} containerSize />
            {meeting.platform}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Share / Invite button — In App only */}
        {isInApp && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowShareModal((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98]"
            >
              <Share2 size={12} aria-hidden />
              Invite Guest
            </button>

            {/* Share popover */}
            {showShareModal && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowShareModal(false)}
                />
                {/* Popover card */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="invite-guest-title"
                  className="absolute right-0 top-full z-50 mt-2 w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-[color:var(--mofa-border-default)] bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 id="invite-guest-title" className="text-sm font-semibold text-[color:var(--mofa-text-body)]">Invite Guest to Meeting</h2>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setShowShareModal(false)}
                      className="flex size-6 items-center justify-center rounded-md text-[color:var(--mofa-text-muted)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-body)]"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  </div>

                  {/* Meeting info — flat section, no nested card */}
                  <div className="mb-4 border-b border-[color:var(--mofa-border-subtle)] pb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[color:var(--mofa-text-muted)]">Meeting</p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-[color:var(--mofa-text-body)]">{meeting.title}</p>
                  </div>

                  {/* Meeting Link */}
                  <div className="mb-3">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[color:var(--mofa-text-muted)]">
                      <Link2 size={12} aria-hidden />
                      Meeting Link
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] px-3 py-2">
                      <span className="flex-1 truncate text-xs text-[color:var(--mofa-text-body)]">{meetingLink}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(meetingLink, "link")}
                        className={cn(
                          "flex min-h-7 shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition hover:bg-[color:var(--mofa-btn-outline-hover)]",
                          copiedLink ? "text-[#16a34a]" : "text-[color:var(--mofa-text-muted)]"
                        )}
                      >
                        {copiedLink ? <Check size={11} aria-hidden /> : <Copy size={11} aria-hidden />}
                        {copiedLink ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[color:var(--mofa-text-muted)]">
                      <Lock size={12} aria-hidden />
                      Password
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] px-3 py-2">
                      <span className="flex-1 text-xs tracking-widest text-[color:var(--mofa-text-body)]">{meetingPassword}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(meetingPassword, "password")}
                        className={cn(
                          "flex min-h-7 shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition hover:bg-[color:var(--mofa-btn-outline-hover)]",
                          copiedPassword ? "text-[#16a34a]" : "text-[color:var(--mofa-text-muted)]"
                        )}
                      >
                        {copiedPassword ? <Check size={11} aria-hidden /> : <Copy size={11} aria-hidden />}
                        {copiedPassword ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Email toggles */}
                  <div className="mb-4 rounded-xl border border-[color:var(--mofa-border-default)] divide-y divide-[color:var(--mofa-border-subtle)]">
                    {/* Send AI Summary */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-[color:var(--mofa-text-body)]">Send AI Summary</p>
                        <p className="text-[11px] text-[color:var(--mofa-text-muted)]">Email the meeting summary to guests</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={sendSummary}
                        aria-label="Send AI Summary"
                        onClick={() => setSendSummary((v) => !v)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-2",
                          sendSummary ? "bg-[color:var(--mofa-btn-primary-bg)]" : "bg-[#ccc5bb]"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            sendSummary ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                    {/* Send Transcript */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-[color:var(--mofa-text-body)]">Send Transcript</p>
                        <p className="text-[11px] text-[color:var(--mofa-text-muted)]">Email the full transcript to guests</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={sendTranscript}
                        aria-label="Send Transcript"
                        onClick={() => setSendTranscript((v) => !v)}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-2",
                          sendTranscript ? "bg-[color:var(--mofa-btn-primary-bg)]" : "bg-[#ccc5bb]"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            sendTranscript ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Copy both button */}
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => {
                      navigator.clipboard.writeText(`Meeting Link: ${meetingLink}\nPassword: ${meetingPassword}`).catch(() => {});
                      setCopiedAll(true);
                      setTimeout(() => setCopiedAll(false), 2000);
                    }}
                  >
                    {copiedAll ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                    {copiedAll ? "Copied!" : "Copy Invite Details"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Two-column body */}
      <div className="flex min-h-0 flex-1 gap-6">
        {/* ── Call area ── */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-page-bg)] p-4">
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

          {/* Control bar */}
          <div className="flex shrink-0 items-center justify-between border-t border-[color:var(--mofa-border-default)] px-4 pb-3 pt-3">
            {/* Left: timer */}
            <LiveTimer />

            {/* Centre: mic + speaker (in-app only) */}
            {isInApp ? (
              <div className="flex items-center gap-4">
                {/* Mic — press to talk */}
                <div className="group flex flex-col items-center gap-1">
                  <div className="relative">
                    <button
                      type="button"
                      onPointerDown={() => setMicOn(true)}
                      onPointerUp={() => setMicOn(false)}
                      onPointerLeave={() => setMicOn(false)}
                      aria-label={micOn ? "Microphone active" : "Press to talk"}
                      title={micOn ? "Hold to speak" : "Press and hold to talk"}
                      className={cn(
                        "relative flex size-11 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-95",
                        micOn
                          ? "border-[#d92d20]/20 bg-[#d92d20] text-white shadow-[0_4px_12px_rgba(217,45,32,0.35)]"
                          : "border-[color:var(--mofa-border-default)] bg-white text-[color:var(--mofa-text-muted)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-body)]",
                      )}
                    >
                      {micOn && (
                        <span className="absolute inset-0 rounded-full border-2 border-[#d92d20] animate-ping opacity-40" />
                      )}
                      {micOn ? <Mic size={16} aria-hidden /> : <MicOff size={16} aria-hidden />}
                    </button>

                    {/* Shortcut tooltip — hover only, hidden while mic is active */}
                    <div
                      className={cn(
                        "pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 flex flex-col items-center transition-opacity duration-150",
                        micOn ? "opacity-0" : "opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <div className="relative flex items-center gap-1.5 rounded-lg bg-[#181d27] px-2.5 py-1.5 shadow-xl ring-1 ring-white/10">
                        <span className="whitespace-nowrap text-[11px] font-medium text-white/70">Hold</span>
                        <kbd className="inline-flex items-center rounded-[5px] border border-white/20 bg-white/15 px-1.5 py-0.5 font-sans text-[11px] font-semibold leading-none tracking-wide text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.3)]">
                          Space
                        </kbd>
                        <span className="whitespace-nowrap text-[11px] font-medium text-white/70">to talk</span>
                        {/* Arrow — sits inside pill, lower-half peeks out to form a sharp caret */}
                        <div className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#18181b]" />
                      </div>
                    </div>
                  </div>

                  <span className={cn("text-[10px] font-medium", micOn ? "text-[#d92d20]" : "text-[color:var(--mofa-text-placeholder)]")}>
                    {micOn ? "Live" : "Muted"}
                  </span>
                </div>

                {/* Speaker */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSpeakerOn((v) => !v)}
                    aria-label={speakerOn ? "Mute speaker" : "Unmute speaker"}
                    title={speakerOn ? "Mute speaker output" : "Unmute speaker output"}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full border-2 transition-all duration-200 active:scale-95",
                      speakerOn
                        ? "border-[color:var(--mofa-border-default)] bg-white text-[color:var(--mofa-accent)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[color:var(--mofa-btn-outline-hover)]"
                        : "border-[color:var(--mofa-border-default)] bg-white text-[color:var(--mofa-text-placeholder)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[color:var(--mofa-btn-outline-hover)]",
                    )}
                  >
                    {speakerOn ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
                  </button>
                  <span className="text-[10px] font-medium text-[color:var(--mofa-text-placeholder)]">
                    {speakerOn ? "Speaker" : "Silent"}
                  </span>
                </div>
              </div>
            ) : (
              /* Spacer to keep leave button right-aligned on non-in-app meetings */
              <div />
            )}

            {/* Right: leave */}
            <button
              type="button"
              onClick={() => setShowLeaveDialog(true)}
              className="flex h-8 items-center gap-1.5 rounded-full border border-[color:var(--mofa-border-default)] bg-white px-4 text-[12px] font-semibold text-[color:var(--mofa-text-muted)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition-all duration-200 hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-body)] active:scale-95"
              aria-label="Leave MOFA view"
              title={isInApp ? "Leave meeting" : "Leave MOFA view — your call on Beem/Teams continues"}
            >
              <LogOut size={12} aria-hidden />
              Leave
            </button>
          </div>
        </section>

        {/* ── Transcript / Participants sidebar ── */}
        <aside className="flex min-h-0 w-[417px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--mofa-border-default)] bg-white">
          {/* Segment-style tab bar + pop-out button */}
          <div className="shrink-0 flex items-center gap-2 p-4">
            <div role="tablist" className="flex flex-1 rounded-[10px] bg-[color:var(--mofa-sidebar-active-bg)] border border-[color:var(--mofa-border-default)] p-1">
              {([
                { id: "transcript" as const, label: "Transcript" },
                { id: "participants" as const, label: "Participants" },
              ]).map((tab) => {
                const active = tab.id === activePanel;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActivePanel(tab.id)}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1",
                      active
                        ? "bg-white text-[color:var(--mofa-text-body)] shadow-[0_1px_3px_rgba(10,13,18,0.1),0_1px_2px_-1px_rgba(10,13,18,0.1)]"
                        : "text-[color:var(--mofa-text-muted)] hover:text-[color:var(--mofa-text-subtle)]",
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
                    ? "border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] text-[color:var(--mofa-accent)] hover:bg-[color:var(--mofa-btn-outline-hover)] hover:border-[color:var(--mofa-border-default)]"
                    : "border-[color:var(--mofa-border-default)] bg-white text-[color:var(--mofa-text-body)] hover:bg-[color:var(--mofa-btn-outline-hover)] hover:border-[color:var(--mofa-border-default)]",
                )}
              >
                {isPipOpen ? <PictureInPicture2 size={18} /> : <PictureInPicture size={18} />}
              </button>

              {/* Hover tooltip label */}
              <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 origin-top scale-95 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
                <div className="whitespace-nowrap rounded-lg border border-[color:var(--mofa-border-default)] bg-[#181d27] px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg">
                  {isPipOpen ? "Close floating transcript" : "Pop out transcript"}
                  {/* Arrow */}
                  <div className="absolute -top-1 right-3.5 size-2 rotate-45 border-l border-t border-[color:var(--mofa-border-default)] bg-[#181d27]" />
                </div>
              </div>

              {/* Popup blocked tooltip — shown when the browser's popup blocker fires */}
              {pipPopupBlocked && (
                <div className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-3 py-2.5 shadow-lg animate-[fadeSlideIn_0.15s_ease-out]">
                  <p className="text-[11px] font-semibold text-[color:var(--mofa-text-body)]">Popup blocked</p>
                  <p className="mt-0.5 text-[11px] leading-[17px] text-[color:var(--mofa-text-muted)]">
                    Allow popups for this site in your browser settings, then try again.
                  </p>
                </div>
              )}
            </div>
          </div>

          {activePanel === "transcript" ? (
            <LiveTranscriptPanel messages={liveMessages} participants={participants} currentUserId={currentUserId} isInApp={isInApp} />
          ) : (
            <LiveParticipantsPanel
              participants={participants}
              currentUserId={currentUserId}
              meetingId={meeting.id}
              isInApp={isInApp}
              showAddGuestModal={showAddGuestModal}
              onAddGuestModalClose={() => setShowAddGuestModal(false)}
            />
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
        <div className="absolute right-0 top-10 z-50 min-w-[188px] overflow-hidden rounded-xl border border-[color:var(--mofa-border-default)] bg-white py-1 shadow-lg">
          {DOWNLOAD_FORMATS.map((f) => (
            <button
              key={f.ext}
              type="button"
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-[color:var(--mofa-text-body)] hover:bg-[color:var(--mofa-btn-outline-hover)] transition-colors"
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
                  : <span className="text-xs text-[color:var(--mofa-text-muted)]">{f.ext}</span>}
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
  const [showLiveRoom, setShowLiveRoom] = React.useState(false);

  // Map "current" to the live meeting (m8)
  const resolvedId = meetingId === "current" ? "m8" : meetingId;
  const meeting = MEETINGS.find((m) => m.id === resolvedId);
  const detail = MEETING_DETAILS[resolvedId];

  const handleParticipantClick = (id: string) => {
    setActiveTab("participants");
    setTimeout(() => {
      document.getElementById(`participant-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  if (!meeting) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <p className="text-base font-semibold text-[color:var(--mofa-text-body)]">Meeting not found</p>
        <Link href="/meetings" className="text-sm text-[color:var(--mofa-text-muted)] underline hover:text-[color:var(--mofa-text-body)]">
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
        <p className="text-base font-semibold text-[color:var(--mofa-text-body)]">Meeting details unavailable</p>
        <Link href="/meetings" className="text-sm text-[color:var(--mofa-text-muted)] underline hover:text-[color:var(--mofa-text-body)]">
          Back to meetings
        </Link>
      </div>
    );
  }

  const TABS: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "summary", label: "AI Summary", icon: <Sparkles size={13} /> },
    { id: "transcript", label: "Transcript", icon: <FileText size={13} /> },
    { id: "participants", label: "Participants", icon: <Users size={13} />, count: detail.participants.length },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col pt-2">
      {/* Header row: back + title + actions */}
      <div className="mb-5 flex items-center gap-3">
        <Link href="/meetings"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white text-[color:var(--mofa-text-muted)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-body)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1">
          <ArrowLeft size={15} />
        </Link>
        <h1 className="flex-1 truncate text-xl font-semibold text-[color:var(--mofa-text-body)]">{meeting.title}</h1>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="tertiary" size="sm" className="gap-1.5">
            <Share2 size={14} aria-hidden />
            Share
          </Button>
          <Button variant="tertiary" size="sm" className="w-9 px-0">
            <MoreVertical size={15} />
          </Button>
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
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[color:var(--mofa-border-default)] bg-white overflow-hidden">
          {/* Toolbar: search (transcript only) + download */}
          <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-3">
            <div className={cn("relative flex-1 max-w-xs transition-all", activeTab !== "transcript" && "opacity-40 pointer-events-none")}>
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--mofa-text-muted)]" aria-hidden />
              <input
                type="search"
                aria-label="Search transcript"
                placeholder="Search transcript…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={activeTab !== "transcript"}
                className="h-8 w-full rounded-lg border border-[color:var(--mofa-border-default)] bg-white pl-8 pr-3 text-sm text-[color:var(--mofa-text-body)] outline-none placeholder:text-[color:var(--mofa-text-muted)] focus:ring-2 focus:ring-[#6f6e8a]/30"
              />
            </div>
            <DownloadMenu />
          </div>

          {/* Tabs */}
          <div className="shrink-0 border-b border-[color:var(--mofa-border-default)] px-5">
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
                        ? "border-b-2 border-[color:var(--mofa-active-tab)] text-[color:var(--mofa-active-tab)]"
                        : "text-[color:var(--mofa-text-muted)] hover:text-[color:var(--mofa-text-body)]",
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px]",
                        active ? "bg-[#e9e9f0] text-[color:var(--mofa-text-secondary)]" : "bg-[#f0f0f4] text-[color:var(--mofa-text-muted)]",
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
              />
            )}
            {activeTab === "participants" && <ParticipantsTab detail={detail} />}
          </div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4 shrink-0" />
    </div>
  );
}

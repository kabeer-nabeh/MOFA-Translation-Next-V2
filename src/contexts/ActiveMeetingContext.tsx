"use client";

/**
 * ActiveMeetingContext
 *
 * Tracks an ongoing live meeting session globally so the minimised overlay
 * can persist across page navigations.  Any component can call
 * `useActiveMeeting()` to read/write the session.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Maximize2, Monitor, PhoneOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { type MeetingPlatform } from "@/components/meetings/meetings-data";

// ─── Public types ────────────────────────────────────────────────────────────

export type ActiveTranscriptLine = {
  id: string;
  speakerName: string;
  initials: string;
  /** Tailwind bg-* colour class, e.g. "bg-[#6941c6]" */
  colorClass: string;
  text: string;
  isYou: boolean;
};

export type ActiveMeetingSession = {
  id: string;
  title: string;
  platform?: MeetingPlatform;
  /** `Date.now()` captured when the session first started — keeps the timer running across navigations */
  startedAt: number;
  latestLines: ActiveTranscriptLine[];
};

// ─── Context value type ───────────────────────────────────────────────────────

type Ctx = {
  session: ActiveMeetingSession | null;
  isMinimized: boolean;
  /** Register (or re-enter) a live meeting. Preserves timer if the same meeting id is already active. */
  startSession: (meeting: Pick<ActiveMeetingSession, "id" | "title" | "platform">) => void;
  /** Fully clear the session (meeting ended / user left). */
  endSession: () => void;
  /** Collapse to the floating overlay — the session stays alive. */
  minimizeSession: () => void;
  /** Restore the full meeting room view. */
  expandSession: () => void;
  /** Push the latest transcript lines into the session (called from LiveMeetingRoom). */
  updateLines: (lines: ActiveTranscriptLine[]) => void;
};

export const ActiveMeetingContext = React.createContext<Ctx>({
  session: null,
  isMinimized: false,
  startSession: () => {},
  endSession: () => {},
  minimizeSession: () => {},
  expandSession: () => {},
  updateLines: () => {},
});

export function useActiveMeeting(): Ctx {
  return React.useContext(ActiveMeetingContext);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function LiveTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = React.useState(() =>
    Math.floor((Date.now() - startedAt) / 1000),
  );
  React.useEffect(() => {
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, [startedAt]);
  const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");
  return (
    <span className="font-mono text-[12px] tabular-nums text-[#535862]">
      {m}:{s}
    </span>
  );
}

function PlatformBadge({ platform }: { platform?: MeetingPlatform }) {
  const label = platform ?? "In App";
  const icon =
    platform === "Teams" ? (
      <img src="/teams.png" alt="" className="h-3 w-3 object-contain" />
    ) : platform === "Beem" ? (
      <img src="/beam-logo.png" alt="" className="h-3 w-3 object-contain" />
    ) : (
      <Monitor size={10} className="shrink-0 text-[#717680]" aria-hidden />
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#e0dde8] bg-[#f8f7fc] px-2 py-0.5 text-[11px] font-semibold text-[#535862]">
      {icon}
      {label}
    </span>
  );
}

// ─── Draggable minimised overlay ──────────────────────────────────────────────

function DraggableMinimizedOverlay({
  session,
  onExpand,
  onLeave,
}: {
  session: ActiveMeetingSession;
  onExpand: () => void;
  onLeave: () => void;
}) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef(false);
  const originPointer = React.useRef({ x: 0, y: 0 });
  const originEl = React.useRef({ left: 0, top: 0 });
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);

  // Place card in bottom-left on first paint
  React.useLayoutEffect(() => {
    if (!cardRef.current) return;
    const h = cardRef.current.offsetHeight;
    setPos({ left: 24, top: window.innerHeight - h - 24 });
  }, []);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't start drag when the user clicks a button inside the card
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      draggingRef.current = true;
      originPointer.current = { x: e.clientX, y: e.clientY };
      if (cardRef.current) {
        const r = cardRef.current.getBoundingClientRect();
        originEl.current = { left: r.left, top: r.top };
      }

      function onMove(ev: PointerEvent) {
        if (!draggingRef.current) return;
        const dx = ev.clientX - originPointer.current.x;
        const dy = ev.clientY - originPointer.current.y;
        const W = cardRef.current?.offsetWidth ?? 288;
        const H = cardRef.current?.offsetHeight ?? 180;
        setPos({
          left: Math.max(8, Math.min(window.innerWidth - W - 8, originEl.current.left + dx)),
          top: Math.max(8, Math.min(window.innerHeight - H - 8, originEl.current.top + dy)),
        });
      }
      function onUp() {
        draggingRef.current = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [],
  );

  const latestLines = session.latestLines.slice(-3);

  return (
    <div
      ref={cardRef}
      className="fixed z-[300] w-72 cursor-grab select-none rounded-2xl border border-[#e0dde8] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.16)] active:cursor-grabbing"
      style={pos ? { left: pos.left, top: pos.top } : { bottom: 24, left: 24 }}
      onPointerDown={handlePointerDown}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#f0f0f4] px-3 pb-2.5 pt-3">
        <span className="flex size-2 shrink-0 animate-pulse rounded-full bg-[#16a34a]" />
        {session.platform === "Teams" ? (
          <img src="/teams.png" alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
        ) : session.platform === "Beem" ? (
          <img src="/beam-logo.png" alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
        ) : (
          <Monitor size={13} className="shrink-0 text-[#717680]" aria-hidden />
        )}
        <p className="flex-1 truncate text-[13px] font-semibold leading-snug text-[#181d27]">
          {session.title}
        </p>
      </div>

      {/* Platform badge */}
      <div className="px-3 pt-2">
        <PlatformBadge platform={session.platform} />
      </div>

      {/* Latest transcript lines */}
      <div className="mt-2 max-h-[96px] space-y-1 overflow-hidden px-3">
        {latestLines.length === 0 ? (
          <p className="text-[11px] italic text-[#9fa3ae]">Waiting for transcript…</p>
        ) : (
          latestLines.map((line) => (
            <div key={line.id} className="flex items-start gap-1.5">
              <span
                className={cn(
                  "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white",
                  line.colorClass,
                )}
              >
                {line.initials}
              </span>
              <p className="line-clamp-2 text-[11px] leading-[1.45] text-[#414651]">
                {line.isYou && (
                  <span className="font-semibold">You: </span>
                )}
                {line.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer — timer + actions */}
      <div className="flex items-center justify-between border-t border-[#f0f0f4] bg-[#fafafa] px-3 py-2.5 mt-2 rounded-b-2xl">
        <LiveTimer startedAt={session.startedAt} />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExpand}
            aria-label="Expand meeting"
            title="Expand meeting"
            className="flex size-7 items-center justify-center rounded-lg border border-[#d5d7da] bg-white text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[#f3f3f7]"
          >
            <Maximize2 size={13} />
          </button>
          <button
            type="button"
            onClick={onLeave}
            aria-label="Leave meeting"
            title="Leave meeting"
            className="flex size-7 items-center justify-center rounded-lg bg-[#d92d20] text-white transition hover:bg-[#b42318]"
          >
            <PhoneOff size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ActiveMeetingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = React.useState<ActiveMeetingSession | null>(null);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => setMounted(true), []);

  const startSession = React.useCallback(
    (meeting: Pick<ActiveMeetingSession, "id" | "title" | "platform">) => {
      setSession((prev) => ({
        id: meeting.id,
        title: meeting.title,
        platform: meeting.platform,
        // Preserve start time and transcript if re-entering the same meeting
        startedAt:
          prev?.id === meeting.id ? prev.startedAt : Date.now(),
        latestLines:
          prev?.id === meeting.id ? prev.latestLines : [],
      }));
      setIsMinimized(false);
    },
    [],
  );

  const endSession = React.useCallback(() => {
    setSession(null);
    setIsMinimized(false);
  }, []);

  const minimizeSession = React.useCallback(() => {
    setIsMinimized(true);
  }, []);

  const expandSession = React.useCallback(() => {
    setIsMinimized(false);
  }, []);

  const updateLines = React.useCallback((lines: ActiveTranscriptLine[]) => {
    setSession((prev) => (prev ? { ...prev, latestLines: lines } : prev));
  }, []);

  const handleExpand = React.useCallback(() => {
    if (!session) return;
    expandSession();
    router.push(`/meetings/${session.id}`);
  }, [session, expandSession, router]);

  const handleLeave = React.useCallback(() => {
    endSession();
  }, [endSession]);

  return (
    <ActiveMeetingContext.Provider
      value={{
        session,
        isMinimized,
        startSession,
        endSession,
        minimizeSession,
        expandSession,
        updateLines,
      }}
    >
      {children}
      {mounted && session && isMinimized &&
        createPortal(
          <DraggableMinimizedOverlay
            session={session}
            onExpand={handleExpand}
            onLeave={handleLeave}
          />,
          document.body,
        )}
    </ActiveMeetingContext.Provider>
  );
}

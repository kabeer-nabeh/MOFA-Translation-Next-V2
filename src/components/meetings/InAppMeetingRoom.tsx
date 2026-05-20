"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Users,
  Video,
  VideoOff,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Meeting } from "@/components/meetings/meetings-data";

function meetingIsLive(m: Meeting): boolean {
  if (!m.startDatetime || !m.endDatetime) return false;
  const now = Date.now();
  const a = new Date(m.startDatetime).getTime();
  const b = new Date(m.endDatetime).getTime();
  return now >= a && now <= b;
}

const DEMO_TRANSCRIPT = [
  { id: "t1", speaker: "Host", initials: "AH", bg: "#e5ddce", time: "00:02", text: "Welcome everyone — we’ll begin once translation channels are synced." },
  { id: "t2", speaker: "Participant", initials: "KO", bg: "#e5cfe7", time: "00:08", text: "Arabic channel confirmed on my side." },
  { id: "t3", speaker: "Participant", initials: "ZM", bg: "#d3d6e9", time: "00:14", text: "English relay looks stable." },
];

export function InAppMeetingRoom({ meeting }: { meeting: Meeting }) {
  const [micOn, setMicOn] = React.useState(true);
  const [camOn, setCamOn] = React.useState(true);
  const [rightTab, setRightTab] = React.useState<"transcript" | "participants">("transcript");

  const live = meetingIsLive(meeting);
  const tiles = meeting.participants.slice(0, 6);

  return (
    <div className="flex h-full min-h-0 w-full flex-col pt-2">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--mofa-text-muted)] transition hover:text-[color:var(--mofa-text-body)]"
        >
          <ArrowLeft size={15} />
          Back to Meetings
        </Link>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="truncate text-lg font-semibold text-[color:var(--mofa-text-body)]">{meeting.title}</h1>
          <span
            className={cn(
              "shrink-0 rounded-md border px-2.5 py-0.5 text-xs font-semibold",
              live
                ? "border-[#fecdca] bg-[#fff1f0] text-[#b42318]"
                : "border-[color:var(--mofa-border-default)] bg-[#f9fafb] text-[color:var(--mofa-text-subtle)]",
            )}
          >
            {live ? "Live" : "Scheduled"}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Stage */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl bg-[#1f1f2e] shadow-inner ring-1 ring-black/10">
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 p-4 sm:grid-cols-3">
            {tiles.map((p) => (
              <div
                key={p.id}
                className="flex aspect-video min-h-[120px] flex-col items-center justify-center rounded-xl bg-[#2a2a3d] ring-1 ring-white/10"
              >
                <div
                  className="flex size-16 items-center justify-center rounded-2xl text-lg font-semibold text-[#27272f]"
                  style={{ backgroundColor: p.bg }}
                >
                  {p.initials}
                </div>
                <p className="mt-3 text-xs font-medium text-white/80">Guest</p>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 justify-center gap-3 border-t border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={() => setMicOn((v) => !v)}
              className={cn(
                "flex size-11 items-center justify-center rounded-full border-2 transition",
                micOn
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                  : "border-[#fecdca] bg-[#b42318]/90 text-white hover:bg-[#b42318]",
              )}
              aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setCamOn((v) => !v)}
              className={cn(
                "flex size-11 items-center justify-center rounded-full border-2 transition",
                camOn
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                  : "border-white/30 bg-white/5 text-white/60 hover:bg-white/10",
              )}
              aria-label={camOn ? "Turn camera off" : "Turn camera on"}
            >
              {camOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Share screen"
            >
              <MonitorUp size={18} />
            </button>
            <Link
              href="/meetings"
              className="flex size-11 items-center justify-center rounded-full border-2 border-[#fecdca] bg-[#b42318] text-white transition hover:bg-[#a11d15]"
              aria-label="Leave meeting"
            >
              <PhoneOff size={18} />
            </Link>
          </div>
        </div>

        {/* Side panel */}
        <aside className="flex w-full max-w-[320px] shrink-0 flex-col rounded-xl border border-[color:var(--mofa-border-default)] bg-white shadow-sm">
          <div className="flex border-b border-[color:var(--mofa-border-default)]">
            <button
              type="button"
              onClick={() => setRightTab("transcript")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold transition",
                rightTab === "transcript"
                  ? "border-b-2 border-[color:var(--mofa-active-tab)] text-[color:var(--mofa-active-tab)]"
                  : "text-[color:var(--mofa-text-muted)] hover:text-[color:var(--mofa-text-body)]",
              )}
            >
              <MessageSquare size={13} aria-hidden />
              Transcript
            </button>
            <button
              type="button"
              onClick={() => setRightTab("participants")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold transition",
                rightTab === "participants"
                  ? "border-b-2 border-[color:var(--mofa-active-tab)] text-[color:var(--mofa-active-tab)]"
                  : "text-[color:var(--mofa-text-muted)] hover:text-[color:var(--mofa-text-body)]",
              )}
            >
              <Users size={13} aria-hidden />
              Participants
              <span className="rounded-full bg-[#f0f0f4] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--mofa-text-muted)]">
                {meeting.participantCount}
              </span>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {rightTab === "transcript" ? (
              <ul className="space-y-4">
                {DEMO_TRANSCRIPT.map((line) => (
                  <li key={line.id} className="flex gap-3 text-sm leading-relaxed">
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-[#27272f]"
                      style={{ backgroundColor: line.bg }}
                    >
                      {line.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-semibold text-[color:var(--mofa-text-body)]">{line.speaker}</span>
                        <span className="text-xs text-[color:var(--mofa-text-faint)]">{line.time}</span>
                      </div>
                      <p className="mt-0.5 text-[color:var(--mofa-text-subtle)]">{line.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {meeting.participants.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-[color:var(--mofa-border-default)] px-3 py-2"
                  >
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[#27272f]"
                      style={{ backgroundColor: p.bg }}
                    >
                      {p.initials}
                    </div>
                    <span className="text-sm font-medium text-[color:var(--mofa-text-body)]">Participant</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <div className="h-4 shrink-0" />
    </div>
  );
}

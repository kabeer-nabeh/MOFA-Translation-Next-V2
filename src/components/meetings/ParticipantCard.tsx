"use client";

import * as React from "react";
import type { ParticipantDetail } from "@/components/meetings/meeting-detail-data";

const ENGAGEMENT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Very High": { bg: "#ecfdf3", text: "#067647", border: "#abefc6" },
  "High":      { bg: "#eff8ff", text: "#175cd3", border: "#b2ddff" },
  "Medium":    { bg: "#fffaeb", text: "#b54708", border: "#fedf89" },
  "Low":       { bg: "#fff1f0", text: "#b42318", border: "#fecdca" },
  "Very Low":  { bg: "#f9fafb", text: "var(--mofa-text-muted)", border: "#d5d7da" },
};

export function EngagementBadge({ level }: { level: string }) {
  const style = ENGAGEMENT_STYLES[level] ?? ENGAGEMENT_STYLES["Medium"]!;
  return (
    <span
      className="rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {level} Engagement
    </span>
  );
}

export function ParticipantCard({ p, id }: { p: ParticipantDetail; id?: string }) {
  return (
    <div id={id} className="rounded-xl border border-[color:var(--mofa-border-default)] bg-white p-5 scroll-mt-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[color:var(--mofa-text-body)]"
            style={{ backgroundColor: p.bg }}
          >
            {p.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--mofa-text-body)]">{p.name}</p>
            <p className="text-xs text-[color:var(--mofa-text-muted)]">{p.role ?? "Participant"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <EngagementBadge level={p.engagement} />
          <p className="text-xs text-[color:var(--mofa-text-muted)]">{p.speakingTime} speaking time</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-[color:var(--mofa-text-muted)]">Participation Level</span>
          <span className="font-semibold text-[color:var(--mofa-text-body)]">
            {p.wordCount.toLocaleString()} words translated ({p.wordPercent}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f4]">
          <div
            className="h-full rounded-full bg-[#212121] transition-all"
            style={{ width: `${p.participationLevel}%` }}
          />
        </div>
      </div>
    </div>
  );
}

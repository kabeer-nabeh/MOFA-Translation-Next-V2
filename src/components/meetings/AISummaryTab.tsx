"use client";

import * as React from "react";
import { Hash, Sparkles, TrendingUp, Users } from "lucide-react";

import type { MeetingDetail } from "@/components/meetings/meeting-detail-data";
import { ParticipantCard } from "@/components/meetings/ParticipantCard";

export function AISummaryTab({ detail }: { detail: MeetingDetail }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-[color:var(--mofa-accent)]" aria-hidden />
          <h2 className="text-sm font-semibold text-[color:var(--mofa-text-body)]">Meeting Overview</h2>
        </div>
        <div className="grid grid-cols-4 divide-x divide-[#e9eaeb] rounded-xl border border-[color:var(--mofa-border-default)] bg-white">
          {[
            { label: "Total Speakers", value: detail.totalSpeakers },
            { label: "Total Words", value: detail.totalWords.toLocaleString() },
            { label: "Speaking Time", value: detail.totalSpeakingTime },
            { label: "Avg Speed", value: `${detail.avgSpeakingRate} wpm` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-5">
              <span className="text-2xl font-bold text-[color:var(--mofa-text-body)]">{value}</span>
              <span className="mt-1 text-xs text-[color:var(--mofa-text-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-[color:var(--mofa-border-default)]" />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[color:var(--mofa-accent)]" aria-hidden />
          <h2 className="text-sm font-semibold text-[color:var(--mofa-text-body)]">Executive Summary</h2>
        </div>
        <p className="leading-8 text-sm text-[color:var(--mofa-text-subtle)]" dir="rtl">
          {detail.executiveSummary}
        </p>
      </section>

      <div className="border-t border-[color:var(--mofa-border-default)]" />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Hash size={16} className="text-[color:var(--mofa-accent)]" aria-hidden />
          <h2 className="text-sm font-semibold text-[color:var(--mofa-text-body)]">Keywords</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {detail.keywords.map((kw) => (
            <span
              key={kw}
              dir="rtl"
              className="rounded-full border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] px-3 py-1 text-sm font-medium text-[color:var(--mofa-text-secondary)]"
            >
              {kw}
            </span>
          ))}
        </div>
      </section>

      <div className="border-t border-[color:var(--mofa-border-default)]" />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} className="text-[color:var(--mofa-accent)]" aria-hidden />
          <h2 className="text-sm font-semibold text-[color:var(--mofa-text-body)]">Participant Engagement</h2>
        </div>
        <div className="flex flex-col gap-3">
          {detail.participants.map((p) => (
            <ParticipantCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

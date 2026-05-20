"use client";

import * as React from "react";

import type { MeetingDetail } from "@/components/meetings/meeting-detail-data";
import { ParticipantCard } from "@/components/meetings/ParticipantCard";

export function ParticipantsTab({ detail }: { detail: MeetingDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 divide-x divide-[#e9eaeb] rounded-xl border border-[color:var(--mofa-border-default)] bg-white">
        {[
          { label: "Total Speakers", value: detail.totalSpeakers },
          { label: "Total Words Translated", value: detail.totalWords.toLocaleString() },
          { label: "Speaking Time", value: detail.totalSpeakingTime },
          { label: "Translation Accuracy", value: "92.3%" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-5">
            <span className="text-2xl font-bold text-[color:var(--mofa-text-body)]">{value}</span>
            <span className="mt-1 text-xs text-[color:var(--mofa-text-muted)]">{label}</span>
          </div>
        ))}
      </div>
      {detail.participants.map((p) => (
        <ParticipantCard key={p.id} p={p} id={`participant-${p.id}`} />
      ))}
    </div>
  );
}

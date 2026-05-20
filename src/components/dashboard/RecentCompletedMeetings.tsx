"use client";

import { MeetingCard, CURRENT_USER } from "@/components/meetings/MeetingsPageClient";
import { MEETINGS } from "@/components/meetings/meetings-data";

const recent = MEETINGS.filter((m) => m.status === "completed").slice(0, 3);

export function RecentCompletedMeetings() {
  return (
    <div className="flex flex-col gap-4">
      {recent.map((m) => (
        <MeetingCard
          key={m.id}
          meeting={m}
          onRsvp={() => {}}
          currentUser={CURRENT_USER}
        />
      ))}
    </div>
  );
}

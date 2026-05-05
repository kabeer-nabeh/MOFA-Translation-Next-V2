"use client";

import * as React from "react";

import {
  CURRENT_USER,
  MeetingCard,
  getConflictIds,
  sortMeetingsForTab,
} from "@/components/meetings/MeetingsPageClient";
import {
  MEETINGS,
  type RsvpStatus,
} from "@/components/meetings/meetings-data";

type Props = {
  /** Limit rows on the dashboard; full list stays on /meetings */
  maxItems?: number;
};

export function DashboardUpcomingMeetings({ maxItems = 6 }: Props) {
  const conflictIds = React.useMemo(() => getConflictIds(MEETINGS), []);
  const [rsvpOverrides, setRsvpOverrides] = React.useState<
    Record<string, RsvpStatus>
  >({});

  const handleRsvp = React.useCallback((id: string, status: RsvpStatus) => {
    setRsvpOverrides((prev) => ({ ...prev, [id]: status }));
  }, []);

  const upcoming = React.useMemo(() => {
    const sorted = sortMeetingsForTab(
      MEETINGS.filter((m) => m.status === "upcoming"),
      "upcoming",
    );
    return typeof maxItems === "number" ? sorted.slice(0, maxItems) : sorted;
  }, [maxItems]);

  if (upcoming.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#717680]">
        No upcoming meetings.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {upcoming.map((meeting) => (
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
      ))}
    </div>
  );
}

import type { Meeting } from "@/types/meeting";

/** Returns an ISO string for <daysOffset> days from today at <hour>:<minute> */
function _isoAt(daysOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Returns an ISO string <minutesOffset> minutes from right now */
function _isoFromNow(minutesOffset: number): string {
  return new Date(Date.now() + minutesOffset * 60_000).toISOString();
}

/** "May 5, 2026" style */
function _fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "10:00 AM" style */
function _fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** "10:00 AM - 11:00 AM" */
function _range(startIso: string, endIso: string): string {
  return `${_fmtTime(startIso)} - ${_fmtTime(endIso)}`;
}

// ─── Pre-computed datetimes ──────────────────────────────────────────────────

// Current meeting — LIVE: started 15 min ago, ends in 45 min
const CURR_START = _isoFromNow(-15);
const CURR_END = _isoFromNow(45);

// Second live meeting — In App: started 5 min ago, ends in 55 min
const INAPP_START = _isoFromNow(-5);
const INAPP_END = _isoFromNow(55);

// Upcoming 1 — starting soon: begins 20 min from now, 60-min long
const UP1_START = _isoFromNow(20);
const UP1_END = _isoFromNow(80);

// Upcoming 2 — 3 days away
const UP2_START = _isoAt(3, 14);
const UP2_END = _isoAt(3, 15);

// Upcoming 3 — 7 days away
const UP3_START = _isoAt(7, 11);
const UP3_END = _isoAt(7, 12);

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CURRENT_MEETING: Meeting = {
  id: "current",
  title: "Product Strategy Discussion - Q2 Planning",
  startLabel: _fmtDate(CURR_START),
  timeRangeLabel: _range(CURR_START, CURR_END),
  hostName: "Abdullah Al Harbi",
  languages: ["Arabic", "English"],
  platform: "Beem",
  startDatetime: CURR_START,
  endDatetime: CURR_END,
  rsvpStatus: "accepted",
  participantsCount: 8,
  participants: [
    {
      id: "p1",
      name: "Suliman Alawi",
      avatarSrc:
        "https://www.figma.com/api/mcp/asset/3904c2c1-4d89-4db1-8efb-ba59d98c2eda",
    },
    {
      id: "p2",
      name: "Koray Okumus",
      avatarSrc:
        "https://www.figma.com/api/mcp/asset/a4a72550-e60d-42a5-b21c-02891bc83701",
    },
    {
      id: "p3",
      name: "Fatima Al Rashid",
      avatarSrc:
        "https://www.figma.com/api/mcp/asset/0905d49c-639c-4738-8ea6-fa8b30371aa4",
    },
  ],
};

const MOCK_INAPP_LIVE_MEETING: Meeting = {
  id: "m8-inapp",
  title: "GCC Diplomatic Coordination - Live Translation",
  startLabel: _fmtDate(INAPP_START),
  timeRangeLabel: _range(INAPP_START, INAPP_END),
  hostName: "Suliman Alawi",
  languages: ["Arabic", "English"],
  platform: "In App",
  startDatetime: INAPP_START,
  endDatetime: INAPP_END,
  rsvpStatus: "accepted",
  participantsCount: 5,
  participants: [],
};

const MOCK_UPCOMING_MEETINGS: Array<{ id: string } & Meeting> = [
  {
    id: "up-1",
    title: "Weekly Standup - Engineering Team",
    startLabel: _fmtDate(UP1_START),
    timeRangeLabel: _range(UP1_START, UP1_END),
    hostName: "Koray Okumus",
    languages: ["English"],
    platform: "In App",
    startDatetime: UP1_START,
    endDatetime: UP1_END,
    rsvpStatus: "pending",
  },
  {
    id: "up-2",
    title: "MOFA Diplomatic Coordination - Ambassadorial Briefing",
    startLabel: _fmtDate(UP2_START),
    timeRangeLabel: _range(UP2_START, UP2_END),
    hostName: "Suliman Alawi",
    languages: ["Arabic", "English"],
    platform: "Teams",
    startDatetime: UP2_START,
    endDatetime: UP2_END,
    rsvpStatus: "pending",
  },
  {
    id: "up-3",
    title: "Client Onboarding - MOFA Translation Demo",
    startLabel: _fmtDate(UP3_START),
    timeRangeLabel: _range(UP3_START, UP3_END),
    hostName: "Abdullah Al Harbi",
    languages: ["Arabic"],
    platform: "Beem",
    startDatetime: UP3_START,
    endDatetime: UP3_END,
    rsvpStatus: "accepted",
  },
];

/**
 * Fetches the currently active meeting for the user.
 * Replace with actual API call (e.g. fetch('/api/meetings/current'))
 */
export async function getCurrentMeeting(): Promise<Meeting | null> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_CURRENT_MEETING), 100);
  });
}

/**
 * Returns all meetings that are currently live (multiple concurrent sessions).
 */
export async function getLiveMeetings(): Promise<Meeting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([MOCK_CURRENT_MEETING, MOCK_INAPP_LIVE_MEETING]), 100);
  });
}

/**
 * Fetches upcoming meetings for the user.
 * Replace with actual API call (e.g. fetch('/api/meetings/upcoming'))
 */
export async function getUpcomingMeetings(): Promise<
  Array<{ id: string } & Meeting>
> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_UPCOMING_MEETINGS), 100);
  });
}

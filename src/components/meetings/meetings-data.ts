export type MeetingStatus = "completed" | "upcoming";

/** For upcoming meetings: pending = not yet responded, accepted = will join, declined = won't attend */
export type RsvpStatus = "pending" | "accepted" | "declined";

export type MeetingParticipant = {
  id: string;
  initials: string;
  bg: string;
};

export type DateChip = {
  month: string; // e.g. "JAN"
  day: number;
};

/** Must match the LOCATION options in NewMeetingModal */
export type MeetingPlatform = "In App" | "Teams" | "Beem";

export type Meeting = {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  host: string;
  languages: string;
  status: MeetingStatus;
  participants: MeetingParticipant[];
  participantCount: number;
  /** Duration string shown in audio player (completed meetings only) */
  audioDuration?: string;
  meetingLink?: string;
  /** Which platform the meeting is held on */
  platform?: MeetingPlatform;
  /** Date chip shown on upcoming meeting cards */
  dateChip?: DateChip;
  /** RSVP state for upcoming meetings */
  rsvpStatus?: RsvpStatus;
  /** ISO 8601 datetime for start — drives time-aware state (soon / live / ended) */
  startDatetime?: string;
  /** ISO 8601 datetime for end */
  endDatetime?: string;
};

export const DEMO_PARTICIPANTS: MeetingParticipant[] = [
  { id: "p1", initials: "SA", bg: "#e5ddce" },
  { id: "p2", initials: "KO", bg: "#e5cfe7" },
  { id: "p3", initials: "ZM", bg: "#d3d6e9" },
  { id: "p4", initials: "AB", bg: "#c7d1b0" },
  { id: "p5", initials: "RN", bg: "#c7a8b0" },
];

// ─── Dynamic date helpers (computed once at module load) ──────────────────────

const _MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

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

/** DateChip from an ISO string */
function _chip(iso: string): DateChip {
  const d = new Date(iso);
  return { month: _MONTHS[d.getMonth()], day: d.getDate() };
}

/** "May 2, 2026" style */
function _fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/** "10:00 AM" style */
function _fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

/** "10:00 AM - 11:00 AM" */
function _range(startIso: string, endIso: string): string {
  return `${_fmtTime(startIso)} - ${_fmtTime(endIso)}`;
}

// ─── Pre-computed datetimes for dynamic demo meetings ─────────────────────────

// m6 — Starting soon: begins 20 min from now, 60-min long
const M6_START = _isoFromNow(20);
const M6_END   = _isoFromNow(80);

// m8 — Live: started 15 min ago, ends in 45 min
const M8_START = _isoFromNow(-15);
const M8_END   = _isoFromNow(45);

// m9 — Missed: yesterday 9–10 AM
const M9_START = _isoAt(-1, 9, 0);
const M9_END   = _isoAt(-1, 10, 0);

// ─── Meetings ─────────────────────────────────────────────────────────────────

export const MEETINGS: Meeting[] = [
  // ── Completed ──────────────────────────────────────────────────────────────
  {
    id: "m1",
    title: "MOFA Live Translation - System Performance Review",
    date: "Dec 24, 2025",
    timeRange: "9:00 AM - 9:30 AM",
    host: "Suliman Alawi",
    languages: "Arabic, English",
    status: "completed",
    platform: "In App",
    participants: DEMO_PARTICIPANTS.slice(0, 3),
    participantCount: 10,
    audioDuration: "00:28",
  },
  {
    id: "m2",
    title: "Q4 Strategy Review - Leadership Sync",
    date: "Dec 20, 2025",
    timeRange: "2:00 PM - 3:00 PM",
    host: "Abdullah Al Harbi",
    languages: "Arabic, English",
    status: "completed",
    platform: "Teams",
    participants: DEMO_PARTICIPANTS.slice(1, 4),
    participantCount: 8,
    audioDuration: "00:47",
  },
  {
    id: "m3",
    title: "Translation Pipeline - Technical Walkthrough",
    date: "Dec 18, 2025",
    timeRange: "11:00 AM - 11:45 AM",
    host: "Koray Okumus",
    languages: "Arabic, English, French",
    status: "completed",
    platform: "Beem",
    participants: DEMO_PARTICIPANTS.slice(0, 3),
    participantCount: 6,
    audioDuration: "01:12",
  },

  // ── Upcoming ───────────────────────────────────────────────────────────────

  /** m4 — future (3 days), pending */
  {
    id: "m4",
    title: "MOFA Diplomatic Coordination - Ambassadorial Briefing",
    date: _fmtDate(_isoAt(3, 10)),
    timeRange: _range(_isoAt(3, 10), _isoAt(3, 11)),
    host: "Suliman Alawi",
    languages: "Arabic, English",
    status: "upcoming",
    platform: "Teams",
    participants: DEMO_PARTICIPANTS.slice(0, 3),
    participantCount: 12,
    meetingLink: "https://us06web.zoom.us/j/0000001",
    dateChip: _chip(_isoAt(3, 10)),
    rsvpStatus: "pending",
    startDatetime: _isoAt(3, 10),
    endDatetime: _isoAt(3, 11),
  },

  /** m5 — future (7 days), accepted */
  {
    id: "m5",
    title: "Client Onboarding - MOFA Translation Demo",
    date: _fmtDate(_isoAt(7, 13)),
    timeRange: _range(_isoAt(7, 13), _isoAt(7, 14)),
    host: "Abdullah Al Harbi",
    languages: "Arabic",
    status: "upcoming",
    platform: "Beem",
    participants: DEMO_PARTICIPANTS.slice(2, 5),
    participantCount: 5,
    meetingLink: "https://us06web.zoom.us/j/0000002",
    dateChip: _chip(_isoAt(7, 13)),
    rsvpStatus: "accepted",
    startDatetime: _isoAt(7, 13),
    endDatetime: _isoAt(7, 14),
  },

  /** m6 — starting soon (~20 min), pending */
  {
    id: "m6",
    title: "Weekly Standup - Engineering Team",
    date: _fmtDate(M6_START),
    timeRange: _range(M6_START, M6_END),
    host: "Koray Okumus",
    languages: "English",
    status: "upcoming",
    platform: "In App",
    participants: DEMO_PARTICIPANTS.slice(1, 4),
    participantCount: 7,
    meetingLink: "https://us06web.zoom.us/j/0000003",
    dateChip: _chip(M6_START),
    rsvpStatus: "pending",
    startDatetime: M6_START,
    endDatetime: M6_END,
  },

  /** m7 — future (10 days), declined */
  {
    id: "m7",
    title: "MOFA Security Review - Quarterly Assessment",
    date: _fmtDate(_isoAt(10, 14)),
    timeRange: _range(_isoAt(10, 14), _isoAt(10, 15)),
    host: "Suliman Alawi",
    languages: "Arabic",
    status: "upcoming",
    platform: "Teams",
    participants: DEMO_PARTICIPANTS.slice(0, 4),
    participantCount: 9,
    meetingLink: "https://us06web.zoom.us/j/0000004",
    dateChip: _chip(_isoAt(10, 14)),
    rsvpStatus: "declined",
    startDatetime: _isoAt(10, 14),
    endDatetime: _isoAt(10, 15),
  },

  /** m8 — LIVE right now, accepted */
  {
    id: "m8",
    title: "Product Strategy Discussion - Q2 Planning",
    date: _fmtDate(M8_START),
    timeRange: _range(M8_START, M8_END),
    host: "Abdullah Al Harbi",
    languages: "Arabic, English",
    status: "upcoming",
    platform: "Beem",
    participants: DEMO_PARTICIPANTS.slice(1, 5),
    participantCount: 8,
    meetingLink: "https://us06web.zoom.us/j/0000005",
    dateChip: _chip(M8_START),
    rsvpStatus: "accepted",
    startDatetime: M8_START,
    endDatetime: M8_END,
  },

  /** m9 — ended / missed (yesterday), pending */
  {
    id: "m9",
    title: "GCC Partnership Review - Bilateral Coordination",
    date: _fmtDate(M9_START),
    timeRange: _range(M9_START, M9_END),
    host: "Koray Okumus",
    languages: "Arabic, English, French",
    status: "upcoming",
    platform: "In App",
    participants: DEMO_PARTICIPANTS.slice(0, 3),
    participantCount: 6,
    dateChip: _chip(M9_START),
    rsvpStatus: "pending",
    startDatetime: M9_START,
    endDatetime: M9_END,
  },
];

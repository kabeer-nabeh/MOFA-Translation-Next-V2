export const TIMELINE_START_HOUR = 8; // 8 AM
export const PX_PER_HOUR = 96;
/** 8 AM through 5 PM = 9 hour bands in the Figma day grid. */
export const TIMELINE_HEIGHT_PX = 9 * PX_PER_HOUR;

export type EventBlockVariant = "neutral" | "soft" | "indigo";

export type TimelineEvent = {
  id: string;
  title: string;
  /** minutes from 8:00 (first slot) */
  startMin: number;
  endMin: number;
  variant: EventBlockVariant;
  detail: EventDetail;
};

export type EventGuest = { id: string; initials: string; bg: string };

export type EventDetail = {
  title: string;
  monthLabel: string; // e.g. "JANUARY 10, 2025"
  weekday: string; // e.g. "SUNDAY"
  timeRange: string; // e.g. "1:00 PM to 1:00 PM" — design has typo; we show real range
  endTimeLabel: string;
  remindLabel: string;
  guests: EventGuest[];
  otherGuestsInitials: string;
  about: string;
  meetingLink: string;
  linkLabel: string;
  rsvpSummary: string;
};

export const VISIBLE_HOUR_LABELS: Array<{
  hour: number;
  label: string;
  /** display row */
}> = [
  { hour: 8, label: "8 AM" },
  { hour: 9, label: "9" },
  { hour: 10, label: "10" },
  { hour: 11, label: "11" },
  { hour: 12, label: "12" },
  { hour: 13, label: "1" },
  { hour: 14, label: "2" },
  { hour: 15, label: "3" },
  { hour: 16, label: "4" },
  { hour: 17, label: "5 PM" },
];

export const DEMO_EVENT_DETAIL: EventDetail = {
  title: "Product demo",
  monthLabel: "JANUARY 10, 2025",
  weekday: "FRIDAY",
  timeRange: "1:30 — 3:30 PM",
  endTimeLabel: "3:30 PM",
  remindLabel: "1 hour before",
  guests: [
    { id: "g1", initials: "AB", bg: "#e9dcbb" },
    { id: "g2", initials: "S", bg: "#c7d1b0" },
    { id: "g3", initials: "O", bg: "#c7a8b0" },
    { id: "g4", initials: "A", bg: "#c0c7d0" },
    { id: "g5", initials: "B", bg: "#9aa5b0" },
  ],
  otherGuestsInitials: "",
  about:
    "A technical session where we will highlight new features, improvements, and use cases, followed by a quick Q&A so teams can test and adapt the product effectively.",
  meetingLink: "https://us06web.zoom.us/j/0000000",
  linkLabel: "us06web.zoom.us/j/0000000",
  rsvpSummary: "6 guests | 5 yes | 1 awaiting",
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "standup",
    title: "Friday standup",
    startMin: 60, // 9:00
    endMin: 90, // 9:30
    variant: "neutral",
    detail: {
      title: "Friday standup",
      monthLabel: "JANUARY 10, 2025",
      weekday: "FRIDAY",
      timeRange: "9:00 — 9:30 AM",
      endTimeLabel: "9:30 AM",
      remindLabel: "15 min before",
      guests: [
        { id: "g1", initials: "AB", bg: "#e9dcbb" },
        { id: "g2", initials: "S", bg: "#c7d1b0" },
      ],
      otherGuestsInitials: "+1",
      about: "Short sync to align the team and surface blockers before the main sessions.",
      meetingLink: "https://mofa.gov/standup",
      linkLabel: "mofa.gov/standup",
      rsvpSummary: "4 guests | 4 yes",
    },
  },
  {
    id: "olivia-riley",
    title: "Olivia x Riley",
    startMin: 120, // 10:00
    endMin: 180, // 11:00
    variant: "soft",
    detail: {
      title: "Olivia x Riley",
      monthLabel: "JANUARY 10, 2025",
      weekday: "FRIDAY",
      timeRange: "10:00 — 11:00 AM",
      endTimeLabel: "11:00 AM",
      remindLabel: "15 min before",
      guests: [
        { id: "g1", initials: "O", bg: "#c7a8b0" },
        { id: "g2", initials: "R", bg: "#9aa5b0" },
      ],
      otherGuestsInitials: "",
      about: "1:1 to align on priorities, risks, and next deliverables for the product track.",
      meetingLink: "https://mofa.gov/olivia-riley",
      linkLabel: "mofa.gov/olivia-riley",
      rsvpSummary: "2 guests | 2 yes",
    },
  },
  {
    id: "product-demo",
    title: "Product demo",
    startMin: 330, // 1:30 PM
    endMin: 450, // 3:30 PM
    variant: "indigo",
    detail: DEMO_EVENT_DETAIL,
  },
];

export const DEFAULT_SELECTED_EVENT_ID = "product-demo";

/** Days in mini calendar (Jan 2025) that show the “has events” dot */
export const DAYS_WITH_DOTS = new Set([1, 4, 10, 30]);

export function eventTopAndHeight(
  startMin: number,
  endMin: number
): { top: number; height: number } {
  const top = (startMin / 60) * PX_PER_HOUR;
  const height = ((endMin - startMin) / 60) * PX_PER_HOUR;
  return { top, height };
}

/** Current time indicator for the demo: 2:20 PM */
export const NOW_MINUTES_FROM_8 = 6 * 60 + 20;

export const calendarViewOptions = [
  { id: "day" as const, label: "Day view" },
  { id: "week" as const, label: "Week view" },
];

export const TIMELINE_START_HOUR = 0; // midnight
export const PX_PER_HOUR = 96;
/** 24 hours = 24 hour bands in the full day grid. */
export const TIMELINE_HEIGHT_PX = 24 * PX_PER_HOUR;

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
}> = [
  { hour: 0,  label: "12 AM" },
  { hour: 1,  label: "1 AM"  },
  { hour: 2,  label: "2 AM"  },
  { hour: 3,  label: "3 AM"  },
  { hour: 4,  label: "4 AM"  },
  { hour: 5,  label: "5 AM"  },
  { hour: 6,  label: "6 AM"  },
  { hour: 7,  label: "7 AM"  },
  { hour: 8,  label: "8 AM"  },
  { hour: 9,  label: "9 AM"  },
  { hour: 10, label: "10 AM" },
  { hour: 11, label: "11 AM" },
  { hour: 12, label: "12 PM" },
  { hour: 13, label: "1 PM"  },
  { hour: 14, label: "2 PM"  },
  { hour: 15, label: "3 PM"  },
  { hour: 16, label: "4 PM"  },
  { hour: 17, label: "5 PM"  },
  { hour: 18, label: "6 PM"  },
  { hour: 19, label: "7 PM"  },
  { hour: 20, label: "8 PM"  },
  { hour: 21, label: "9 PM"  },
  { hour: 22, label: "10 PM" },
  { hour: 23, label: "11 PM" },
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
    startMin: 540, // 9:00 AM
    endMin: 570,   // 9:30 AM
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
    startMin: 600, // 10:00 AM
    endMin: 660,   // 11:00 AM
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
    startMin: 810, // 1:30 PM
    endMin: 930,   // 3:30 PM
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

/** Current time indicator for the demo: 2:20 PM = 14h20m from midnight */
export const NOW_MINUTES_FROM_8 = 14 * 60 + 20;

export const calendarViewOptions = [
  { id: "day" as const, label: "Day view" },
  { id: "week" as const, label: "Week view" },
];

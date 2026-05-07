export type MeetingLanguage = string;

export type Participant = {
  id: string;
  name: string;
  avatarSrc?: string | null;
};

/** Must match the LOCATION options in NewMeetingModal */
export type MeetingPlatform = "In App" | "Teams" | "Beem";

export type RsvpStatus = "pending" | "accepted" | "declined";

export type Meeting = {
  id: string;
  title: string;
  startLabel: string;
  timeRangeLabel: string;
  hostName: string;
  languages: MeetingLanguage[];
  participants?: Participant[];
  participantsCount?: number;
  /** Which platform the meeting is held on */
  platform?: MeetingPlatform;
  /** ISO 8601 datetime for start — drives time-aware badges */
  startDatetime?: string;
  /** ISO 8601 datetime for end */
  endDatetime?: string;
  /** RSVP state */
  rsvpStatus?: RsvpStatus;
  /** Meeting join link (external platforms) */
  meetingLink?: string;
};

export type CalendarBadgeDate = {
  monthShort: string;
  day: string;
};

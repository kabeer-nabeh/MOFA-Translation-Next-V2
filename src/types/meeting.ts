export type MeetingLanguage = string;

export type Participant = {
  id: string;
  name: string;
  avatarSrc?: string | null;
};

export type Meeting = {
  id: string;
  title: string;
  startLabel: string;
  timeRangeLabel: string;
  hostName: string;
  languages: MeetingLanguage[];
  participants?: Participant[];
  participantsCount?: number;
};

export type CalendarBadgeDate = {
  monthShort: string;
  day: string;
};


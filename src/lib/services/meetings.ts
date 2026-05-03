import type { Meeting } from "@/types/meeting";

// Mock data representing the backend database
/** Matches demo row `m1` in `meetings-data` / `MEETING_DETAILS` so Join navigates to a real detail page. */
const MOCK_CURRENT_MEETING: Meeting = {
  id: "m1",
  title: "AmplifAI Project - Client Feedback Discussion",
  startLabel: "Dec 24, 2025",
  timeRangeLabel: "9:00 AM - 9:30 AM",
  hostName: "Suliman Alawi",
  languages: ["Arabic", "English"],
  participantsCount: 8,
  participants: [
    {
      id: "p1",
      name: "Participant One",
      avatarSrc:
        "https://www.figma.com/api/mcp/asset/3904c2c1-4d89-4db1-8efb-ba59d98c2eda",
    },
    {
      id: "p2",
      name: "Participant Two",
      avatarSrc:
        "https://www.figma.com/api/mcp/asset/a4a72550-e60d-42a5-b21c-02891bc83701",
    },
    {
      id: "p3",
      name: "Participant Three",
      avatarSrc:
        "https://www.figma.com/api/mcp/asset/0905d49c-639c-4738-8ea6-fa8b30371aa4",
    },
  ],
};

const MOCK_UPCOMING_MEETINGS: Array<{ id: string } & Meeting> = [
  {
    id: "up-1",
    title: "MOFA Diplomatic Coordination - Ambassadorial Briefing",
    startLabel: "Dec 24",
    timeRangeLabel: "9:00 AM - 9:30 AM",
    hostName: "Suliman Alawi",
    languages: ["Arabic", "English"],
  },
  {
    id: "up-2",
    title: "MOFA Diplomatic Coordination - Ambassadorial Briefing",
    startLabel: "Dec 24",
    timeRangeLabel: "9:00 AM - 9:30 AM",
    hostName: "Suliman Alawi",
    languages: ["Arabic", "English"],
  },
  {
    id: "up-3",
    title: "MOFA Diplomatic Coordination - Ambassadorial Briefing",
    startLabel: "Dec 24",
    timeRangeLabel: "9:00 AM - 9:30 AM",
    hostName: "Suliman Alawi",
    languages: ["Arabic", "English"],
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
 * Fetches upcoming meetings for the user.
 * Replace with actual API call (e.g. fetch('/api/meetings/upcoming'))
 */
export async function getUpcomingMeetings(): Promise<Array<{ id: string } & Meeting>> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_UPCOMING_MEETINGS), 100);
  });
}

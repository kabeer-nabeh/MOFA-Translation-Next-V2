export type FlowStatus = "built" | "missing";

export type Flow = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: FlowStatus;
  screenshotPath?: string;
  liveRoute?: string;
  lastUpdated: string;
};

export type FlowCategory = {
  id: string;
  label: string;
};

export const FLOW_CATEGORIES: FlowCategory[] = [
  { id: "onboarding",     label: "Onboarding" },
  { id: "dashboard",      label: "Dashboard" },
  { id: "meetings-list",  label: "Meetings List" },
  { id: "meeting-detail", label: "Meeting Detail" },
  { id: "guest",          label: "Guest Flow" },
  { id: "calendar",       label: "Calendar" },
  { id: "analytics",      label: "Analytics" },
  { id: "settings",       label: "Settings" },
  { id: "errors",         label: "Errors & Edge Cases" },
];

export const FLOWS: Flow[] = [
  // ── Onboarding ────────────────────────────────────────────────────────────
  {
    id: "ON-01",
    name: "First launch — empty app",
    category: "onboarding",
    description: "A brand-new user opens the app for the first time. No meetings, no data, no history. Shows the zero-state experience across dashboard and meetings.",
    status: "missing",
    lastUpdated: "—",
  },
  {
    id: "ON-02",
    name: "Sign-in / welcome screen",
    category: "onboarding",
    description: "The entry point before authentication. User sees the Baseer Voice branding, enters credentials, and lands in the app for the first time.",
    status: "missing",
    lastUpdated: "—",
  },
  {
    id: "ON-03",
    name: "Post-login redirect",
    category: "onboarding",
    description: "After a successful sign-in the user is routed to the dashboard. Covers the transition animation and initial data load.",
    status: "missing",
    lastUpdated: "—",
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    id: "DB-01",
    name: "Dashboard — populated",
    category: "dashboard",
    description: "The main dashboard with meetings, usage stats, activity feed, and sidebar metrics. The default state for a returning user with data.",
    status: "built",
    liveRoute: "/dashboard",
    lastUpdated: "2025-05-21",
  },
  {
    id: "DB-02",
    name: "Dashboard — empty state",
    category: "dashboard",
    description: "A new user who has no meetings, no translation history, and no activity. Every widget shows its zero-state treatment.",
    status: "missing",
    lastUpdated: "—",
  },

  // ── Meetings List ─────────────────────────────────────────────────────────
  {
    id: "ML-01",
    name: "Meetings list — populated",
    category: "meetings-list",
    description: "The meetings index with all tabs: Upcoming, Live, and Past. Cards show meeting title, participants, language pair, and status badges.",
    status: "built",
    liveRoute: "/meetings",
    lastUpdated: "2025-05-21",
  },
  {
    id: "ML-02",
    name: "Meetings list — empty state",
    category: "meetings-list",
    description: "No meetings have been created or joined yet. Each tab shows its own empty state with a prompt to create the first meeting.",
    status: "missing",
    lastUpdated: "—",
  },
  {
    id: "ML-03",
    name: "New meeting modal",
    category: "meetings-list",
    description: "The modal triggered from the meetings list to create a new meeting. Covers title, date, language pair selection, and participant invite.",
    status: "built",
    liveRoute: "/meetings",
    lastUpdated: "2025-05-21",
  },

  // ── Meeting Detail ────────────────────────────────────────────────────────
  {
    id: "MD-01",
    name: "Meeting detail — pre-join lobby",
    category: "meeting-detail",
    description: "A scheduled meeting that has not started yet. The user sees participants, meeting info, and a 'Join' call-to-action. Integration badges are visible.",
    status: "built",
    liveRoute: "/meetings/m2",
    lastUpdated: "2025-05-21",
  },
  {
    id: "MD-02",
    name: "Meeting detail — live in-app session",
    category: "meeting-detail",
    description: "An active in-app meeting in full live room mode. Real-time transcript stream, participant panel, mic and speaker controls, and the translation feed.",
    status: "built",
    liveRoute: "/meetings/m8",
    lastUpdated: "2025-05-21",
  },
  {
    id: "MD-03",
    name: "Meeting detail — summary tab",
    category: "meeting-detail",
    description: "Post-meeting summary view with AI-generated key points, action items, and language breakdown. The default tab after a meeting ends.",
    status: "built",
    liveRoute: "/meetings/m1",
    lastUpdated: "2025-05-21",
  },
  {
    id: "MD-04",
    name: "Meeting detail — transcript tab",
    category: "meeting-detail",
    description: "Full bilingual transcript of a completed meeting. Arabic and English turns are side by side with speaker labels and timestamps.",
    status: "built",
    liveRoute: "/meetings/m1",
    lastUpdated: "2025-05-21",
  },
  {
    id: "MD-05",
    name: "Meeting detail — participants panel",
    category: "meeting-detail",
    description: "The participants side panel showing all attendees, their roles, connection status, and language preferences during a live session.",
    status: "built",
    liveRoute: "/meetings/m8",
    lastUpdated: "2025-05-21",
  },
  {
    id: "MD-06",
    name: "Meeting detail — invite guest popover",
    category: "meeting-detail",
    description: "The share popover opened from inside a live meeting. Shows a copyable guest link, meeting password, and options to email the summary or transcript.",
    status: "built",
    liveRoute: "/meetings/m8",
    lastUpdated: "2025-05-21",
  },
  {
    id: "MD-07",
    name: "Meeting detail — leave confirmation",
    category: "meeting-detail",
    description: "The confirmation dialog shown when a user tries to leave or end an active meeting. Distinguishes between 'Leave' (stay connected) and 'End for all'.",
    status: "missing",
    lastUpdated: "—",
  },
  {
    id: "MD-08",
    name: "Meeting not found",
    category: "meeting-detail",
    description: "A meeting ID that does not exist or has expired. Shows an error state with options to go back to the meetings list.",
    status: "missing",
    lastUpdated: "—",
  },

  // ── Guest Flow ────────────────────────────────────────────────────────────
  {
    id: "GU-01",
    name: "Guest join — form",
    category: "guest",
    description: "The password-gated join form a guest sees when opening an invite link. Collects full name, organisation, and meeting password before granting access.",
    status: "built",
    liveRoute: "/guest-join/m8",
    lastUpdated: "2025-05-21",
  },
  {
    id: "GU-02",
    name: "Guest join — success state",
    category: "guest",
    description: "After the guest submits valid credentials the form transitions to a success screen with a spinner and 3-second countdown before redirecting to the meeting.",
    status: "built",
    liveRoute: "/guest-join/m8",
    lastUpdated: "2025-05-21",
  },
  {
    id: "GU-03",
    name: "Guest join — wrong password",
    category: "guest",
    description: "The validation error state when a guest enters an incorrect password. The field shakes, an inline error appears, and the form stays open.",
    status: "built",
    liveRoute: "/guest-join/m8",
    lastUpdated: "2025-05-21",
  },
  {
    id: "GU-04",
    name: "Guest meeting view",
    category: "guest",
    description: "The meeting view for an authenticated guest. Displays only the Baseer logo — no sidebar, no notification bell, no profile avatar. View-only translation feed.",
    status: "built",
    liveRoute: "/guest-view/m8",
    lastUpdated: "2025-05-21",
  },
  {
    id: "GU-05",
    name: "Guest join — invalid or expired link",
    category: "guest",
    description: "A guest opens a link that has expired or belongs to a meeting that no longer exists. Shows a clear error with a contact-host prompt.",
    status: "missing",
    lastUpdated: "—",
  },

  // ── Calendar ──────────────────────────────────────────────────────────────
  {
    id: "CA-01",
    name: "Calendar — populated",
    category: "calendar",
    description: "The calendar view with scheduled meetings displayed as date chips. Users can see upcoming meetings at a glance and click through to meeting detail.",
    status: "built",
    liveRoute: "/calendar",
    lastUpdated: "2025-05-21",
  },
  {
    id: "CA-02",
    name: "Calendar — empty state",
    category: "calendar",
    description: "No meetings are scheduled. The calendar grid is visible but empty, with a prompt to schedule a new meeting or connect a calendar integration.",
    status: "missing",
    lastUpdated: "—",
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  {
    id: "AN-01",
    name: "Analytics — full data view",
    category: "analytics",
    description: "The analytics page with usage charts, user type breakdown, language pair stats, and word counts. Reflects a user with several weeks of meeting history.",
    status: "built",
    liveRoute: "/analytics",
    lastUpdated: "2025-05-21",
  },
  {
    id: "AN-02",
    name: "Analytics — empty state",
    category: "analytics",
    description: "A new user with no meeting history. All chart areas show zero-state treatments with instructional copy pointing toward creating the first meeting.",
    status: "missing",
    lastUpdated: "—",
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  {
    id: "SE-01",
    name: "Settings — general preferences",
    category: "settings",
    description: "The main settings page covering language defaults, notification preferences, and profile information for the signed-in user.",
    status: "built",
    liveRoute: "/settings",
    lastUpdated: "2025-05-21",
  },
  {
    id: "SE-02",
    name: "Settings — integrations (disconnected)",
    category: "settings",
    description: "The integrations tab with all third-party connections (Teams, Outlook, Beem) in their disconnected state. Each shows a 'Connect' call-to-action.",
    status: "built",
    liveRoute: "/settings",
    lastUpdated: "2025-05-21",
  },
  {
    id: "SE-03",
    name: "Settings — integration connecting",
    category: "settings",
    description: "The in-progress OAuth handshake flow when a user clicks Connect on an integration. Shows the redirect and callback states.",
    status: "built",
    liveRoute: "/settings",
    lastUpdated: "2025-05-21",
  },
  {
    id: "SE-04",
    name: "Settings — integration connected",
    category: "settings",
    description: "An integration that has been successfully authorised. The integration card shows the connected account, last sync time, and a Disconnect option.",
    status: "built",
    liveRoute: "/settings",
    lastUpdated: "2025-05-21",
  },

  // ── Errors & Edge Cases ───────────────────────────────────────────────────
  {
    id: "ER-01",
    name: "404 — page not found",
    category: "errors",
    description: "A URL that does not match any route in the application. Branded 404 page with navigation back to the dashboard.",
    status: "missing",
    lastUpdated: "—",
  },
  {
    id: "ER-02",
    name: "Network / server error",
    category: "errors",
    description: "A critical failure when the application cannot reach the server. Shows a clear error message with a retry action and support contact.",
    status: "missing",
    lastUpdated: "—",
  },
  {
    id: "ER-03",
    name: "Session expired",
    category: "errors",
    description: "The user's authentication session has expired mid-session. A prompt to re-authenticate appears without losing the current page context.",
    status: "missing",
    lastUpdated: "—",
  },
  {
    id: "ER-04",
    name: "No microphone permission",
    category: "errors",
    description: "The browser has blocked microphone access. Shown inside the live meeting room with step-by-step instructions to re-enable it.",
    status: "missing",
    lastUpdated: "—",
  },
];

// ── Derived helpers ───────────────────────────────────────────────────────────

export function getFlowsByCategory(categoryId: string): Flow[] {
  return FLOWS.filter((f) => f.category === categoryId);
}

export function getCategoryStats(categoryId: string) {
  const flows = getFlowsByCategory(categoryId);
  return {
    total: flows.length,
    built: flows.filter((f) => f.status === "built").length,
  };
}

export function getOverallStats() {
  return {
    total: FLOWS.length,
    built: FLOWS.filter((f) => f.status === "built").length,
  };
}

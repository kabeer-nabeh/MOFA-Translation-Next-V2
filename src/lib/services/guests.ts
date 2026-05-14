import type { Guest, GuestOutputs } from "@/types/meeting";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#c7d1b0", "#e5cfe7", "#d3d6e9",
  "#e5ddce", "#c7a8b0", "#b0c7c1",
] as const;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function pickColor(id: string): string {
  const idx = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx]!;
}

// ─── In-memory mock store — keyed by meetingId ────────────────────────────────

const MOCK_GUESTS: Record<string, Guest[]> = {
  // m6 — In App, starting soon (~20 min) — pre-seeded with one invited guest
  m6: [
    {
      id: "g1",
      meetingId: "m6",
      name: "Sarah Johnson",
      email: "s.johnson@un.org",
      affiliation: "United Nations Office",
      status: "invited",
      invitedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      outputs: { sendTranscript: true, sendSummary: true },
      initials: "SJ",
      bg: "#c7d1b0",
    },
  ],
  // m9 — In App, live — guest already joined
  m9: [
    {
      id: "g2",
      meetingId: "m9",
      name: "Ahmed Al-Faisal",
      email: "a.faisal@gccsg.org",
      affiliation: "GCC Secretariat",
      status: "joined",
      invitedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      outputs: { sendTranscript: true, sendSummary: false },
      initials: "AF",
      bg: "#d3d6e9",
    },
  ],
};

let _nextId = 10;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all guests registered for a given meeting.
 * Replace with real API call: GET /api/meetings/:id/guests
 */
export async function getGuests(meetingId: string): Promise<Guest[]> {
  return new Promise((resolve) =>
    setTimeout(() => resolve([...(MOCK_GUESTS[meetingId] ?? [])]), 60)
  );
}

/**
 * Registers a new external guest and sends them an invite email (mocked).
 * Replace with real API call: POST /api/meetings/:id/guests
 */
export async function addGuest(
  meetingId: string,
  data: { name: string; email: string; affiliation: string; outputs: GuestOutputs }
): Promise<Guest> {
  return new Promise((resolve) => {
    const id = `g${++_nextId}`;
    const guest: Guest = {
      id,
      meetingId,
      name: data.name,
      email: data.email,
      affiliation: data.affiliation,
      status: "invited",
      invitedAt: new Date().toISOString(),
      outputs: data.outputs,
      initials: getInitials(data.name),
      bg: pickColor(id),
    };
    if (!MOCK_GUESTS[meetingId]) MOCK_GUESTS[meetingId] = [];
    MOCK_GUESTS[meetingId]!.push(guest);
    setTimeout(() => resolve(guest), 250);
  });
}

/**
 * Revokes a guest's access — immediately invalidates their session link.
 * Replace with real API call: PATCH /api/meetings/:id/guests/:guestId/revoke
 */
export async function revokeGuest(meetingId: string, guestId: string): Promise<void> {
  return new Promise((resolve) => {
    const list = MOCK_GUESTS[meetingId];
    if (list) {
      const g = list.find((item) => item.id === guestId);
      if (g) g.status = "revoked";
    }
    setTimeout(resolve, 180);
  });
}

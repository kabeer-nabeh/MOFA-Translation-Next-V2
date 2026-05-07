# MOFA Translation Platform — Implementation Plan

## Core Product Model (Updated Understanding)

There are **two distinct meeting types** that drive different user experiences:

### External Meetings (Teams / Beem)
1. User schedules meeting in Teams or Beem (not in this app)
2. This app **syncs/fetches** the meeting from the integration
3. At meeting time, user starts the meeting in Teams or Beem (externally)
4. User comes to MOFA, sees the meeting is "In Progress"
5. User joins the MOFA transcript viewer — **read-only**
   - ❌ No microphone
   - ❌ No audio playback
   - ✅ Live translated transcript

### In-App Meetings
1. User creates meeting directly in MOFA ("In App")
2. All participants join via MOFA
3. Participants speak in their own language
4. Others hear audio + read translated transcript in real time
   - ✅ Microphone (for In App only)
   - ✅ Audio listening
   - ✅ Live translated transcript

---

## Current State Gaps (File-by-File Analysis)

### `MeetingDetailClient.tsx` — Live Room
- **Gap**: Single `LiveMeetingRoom` for all platforms — no branching by platform type
- **Gap**: Participant grid (avatar tiles) is only relevant for In App meetings; external meetings have no WebRTC presence
- **Gap**: `Mic` icon appears in `AskAITab` input — should only appear for In App
- **Gap**: `MeetingConnectingScreen` says "Connecting to meeting room..." regardless of platform
- **Gap**: No "view transcript mode" UI for external meetings (Teams/Beem)
- **Gap**: No language-per-participant UI for In App meetings
- **Gap**: Leave button uses phone-off icon — fine for In App; for external it should be "Stop Viewing"

### `MeetingsPageClient.tsx` — Meeting Cards
- **Gap**: "Join Meeting" button goes to `/meetings/:id` for all platforms — should open Teams/Beem link AND offer "View Transcript" separately for external platforms
- **Gap**: "Open Meeting Room" for In App should be distinct from external join flow
- **Gap**: No visual distinction between "you need to join externally first" (Teams/Beem) vs "join here" (In App)

### `DashboardView.tsx` + `MeetingCard.tsx` — Dashboard Current Meeting
- **Gap**: "Join Meeting" CTA is the same for all platforms — needs platform-aware routing
- **Gap**: Subtitle like "Your meeting is in progress — join now" doesn't distinguish if user needs to open Teams first

### `dashboard/UpcomingMeetingItem.tsx` — Upcoming Cards
- **Gap**: Accept/Decline actions exist but no distinction: for Teams/Beem, user eventually starts meeting externally; no guidance on that flow
- **Gap**: When meeting is "soon" and platform is Teams/Beem, the CTA should be "Open in Teams" + "View Transcript"

### `NewMeetingModal.tsx` — Creating Meetings
- **Gap**: Selecting Teams or Beem implies user will schedule there — the modal should clarify this and pivot to "sync" flow, not creation
- **Gap**: Language assignment per participant is missing (critical for In App — who speaks what language)
- **Gap**: No distinction between "create" (In App) and "sync/import" (Teams/Beem)

### `IntegrationsSettingsPanel.tsx` — Integrations
- **Gap**: Currently just OAuth connect/disconnect — no visibility into sync status, last sync time, or which meetings were pulled in
- **Gap**: No "re-sync" or "check for new meetings" action
- **Gap**: No indication of whether the integration is actively pulling meetings

### `meetings-data.ts` + `lib/services/meetings.ts` — Data Layer
- **Gap**: No `meetingMode` field distinguishing the two flows (`"external"` | `"in-app"`)
- **Gap**: No `externalJoinUrl` separate from `meetingLink` (Teams meetings need both: external URL to join Teams + internal transcript viewer URL)
- **Gap**: No sync-related metadata (syncedAt, syncSource, etc.)

---

## Phase 1 — Data Model & Platform Routing
**Goal**: Establish the correct data foundation and fix all CTAs to route correctly by platform.

### 1.1 — Extend Type System
**File**: `src/types/meeting.ts`, `src/components/meetings/meetings-data.ts`

Add to `Meeting` type:
```ts
meetingMode: "in-app" | "external"; // derived from platform
externalJoinUrl?: string;           // Teams/Beem meeting URL
syncedAt?: string;                  // ISO timestamp of last sync
syncSource?: "teams" | "beem";      // which integration pulled it
```

Helper:
```ts
function getMeetingMode(platform?: MeetingPlatform): "in-app" | "external" {
  return platform === "In App" ? "in-app" : "external";
}
```

### 1.2 — Update Mock Data
**File**: `src/lib/services/meetings.ts`

Update all mock meetings to include `meetingMode`, `externalJoinUrl`, and make CTAs differentiated:
- Teams/Beem meetings: separate `externalJoinUrl` (the actual Teams/Beem link) from the MOFA transcript viewer route
- In App meetings: only have the MOFA route

### 1.3 — Fix Meeting Card CTAs (Meetings Page)
**File**: `src/components/meetings/MeetingsPageClient.tsx`

For accepted + live/soon meetings:
- **In App** → `"Open Meeting Room"` → `/meetings/:id`
- **Teams/Beem** → Two actions:
  1. `"Open in Teams/Beem"` (primary) → external URL (new tab)
  2. `"View Transcript"` (secondary) → `/meetings/:id`

### 1.4 — Fix Dashboard CTAs
**Files**: `src/components/dashboard/MeetingCard.tsx`, `src/components/dashboard/UpcomingMeetingItem.tsx`

Same CTA logic as 1.3, applied to all dashboard cards.

**Deliverables**: All cards show correct, platform-appropriate buttons. No user confusion about where to go.

---

## Phase 2 — External Meeting Transcript Viewer (Teams/Beem)
**Goal**: Build the read-only transcript view experience for external meetings.

### 2.1 — Platform-Aware Connecting Screen
**File**: `src/components/meetings/MeetingDetailClient.tsx` — `MeetingConnectingScreen`

Branch by `meetingMode`:
- **External**: Show "Joining as transcript viewer..." with a document/eye icon, platform logo (Teams/Beem), and note: "Audio is handled in [Teams/Beem]. MOFA provides live translated transcript."
- **In App**: Current experience ("Connecting to meeting room...")

### 2.2 — External Transcript Viewer Mode
**File**: `src/components/meetings/MeetingDetailClient.tsx` — `LiveMeetingRoom`

When `meetingMode === "external"`:
- **Remove** participant avatar tile grid (no WebRTC — participants are in Teams/Beem, not here)
- Replace with a **"Live from [Teams/Beem]"** header panel showing:
  - Platform logo + meeting title
  - Participant count (from sync data, not WebRTC)
  - "Audio in [Teams/Beem]" indicator
  - Elapsed time
  - `"Stop Viewing"` button (instead of Leave/PhoneOff)
- The full width goes to the **transcript panel** (expanded, not sidebar)
- No mic controls anywhere

Layout for external mode:
```
┌─────────────────────────────────────┐
│  [Beem Logo] Meeting Title    12:34 │  ← compact header
│  👥 8 participants in Beem   [Stop] │
├─────────────────────────────────────┤
│                                     │
│        LIVE TRANSLATED TRANSCRIPT   │  ← full width
│        (word-by-word streaming)     │
│                                     │
└─────────────────────────────────────┘
```

### 2.3 — External "Before You Join" Banner
When a user opens `/meetings/:id` for an external meeting that's live but they haven't joined the external platform:
- Show a contextual banner: "This meeting is running in [Teams/Beem]. Open it there to participate, then return here to view the live transcript."
- CTA: `"Open in [Teams/Beem]"` + `"I'm already in the meeting"`

**Deliverables**: External meeting viewers see a clean, focused transcript-only experience. No confusion about mic/audio.

---

## Phase 3 — In-App Meeting Room (Full Experience)
**Goal**: Build the complete in-app meeting experience with audio + mic + translation.

### 3.1 — In-App Connecting Screen Enhancement
**File**: `MeetingDetailClient.tsx` — `MeetingConnectingScreen`

For In App mode:
- Show participant avatars (current behavior, keep)
- Add language detection readiness: "Translation engine ready"
- Show assigned languages per participant if available

### 3.2 — Mic Controls for In App Only
**File**: `MeetingDetailClient.tsx` — `LiveMeetingRoom`

When `meetingMode === "in-app"`:
- Add microphone button in the call controls row (next to Leave button)
- Mic states: `muted` / `active` / `speaking`
- Mute/unmute toggles your mic

Layout for in-app mode (current structure, enhanced):
```
┌──────────────────┬────────────────────┐
│  Participant     │  Transcript /      │
│  Tiles Grid      │  Participants      │
│                  │  Panel             │
├──────────────────┤                    │
│  [Timer] [🎤] [📵] │                  │
└──────────────────┴────────────────────┘
```

### 3.3 — Language Assignment per Participant
**File**: `NewMeetingModal.tsx`

When creating an In App meeting:
- After selecting attendees, show a language assignment step:
  - Each invited participant can be assigned a "speaks" language
  - Each can be assigned a "translation target" language
- This drives what transcript each participant sees in their language

### 3.4 — Speaker Language Indicator in Transcript
**File**: `MeetingDetailClient.tsx` — `LiveTranscriptPanel`

For In App meetings:
- Show each message's source language (e.g., "Arabic →") with translation indicator
- For external meetings: already partially done, refine styling

**Deliverables**: In App meetings have full mic/audio controls. Each participant's language is clear. Transcript properly labels translations.

---

## Phase 4 — Meeting Sync & Integration UX
**Goal**: Make the integration flow clearly communicate that Teams/Beem meetings are synced, not created here.

### 4.1 — Integration Sync Status
**File**: `src/components/settings/IntegrationsSettingsPanel.tsx`

Enhance connected integrations to show:
- Last synced time: "Synced 2 min ago"
- Synced meeting count: "12 meetings synced"
- Manual re-sync button: "Sync Now"
- Sync error states with retry

### 4.2 — "Import from Teams/Beem" Flow in New Meeting Modal
**File**: `src/components/meetings/NewMeetingModal.tsx`

When user selects Teams or Beem as location:
- Instead of the "create" form, pivot to: "Meetings from [Teams/Beem] are automatically synced. No need to create — they appear here as they're scheduled."
- CTA: `"Go to Settings to connect [Teams/Beem]"` (if not connected) or `"View synced meetings"` (if connected)
- Keep In App creation as is

### 4.3 — Sync Indicator on Meeting Cards
**Files**: `MeetingsPageClient.tsx`, `UpcomingMeetingItem.tsx`

For Teams/Beem meetings, add subtle sync source badge:
- Small platform icon with "Synced from Teams" tooltip
- Different from the existing platform badge (which just shows the platform)

**Deliverables**: Users understand the sync model. Integration settings are informative, not just connect/disconnect.

---

## Phase 5 — Notifications & Smart Status
**Goal**: Proactively alert users when external meetings start and when transcripts are ready.

### 5.1 — Dashboard "Meeting Starting" Alert
**File**: `src/components/dashboard/DashboardView.tsx`

When a Teams/Beem meeting transitions to "In Progress":
- Dashboard subtitle becomes: "Your [Teams] meeting has started — open it in Teams, then view the transcript here"
- CTA on the meeting card splits into: `"Open in Teams"` (primary) + `"View Transcript"` (secondary)

### 5.2 — Completed Meeting Transcript Ready State
**File**: `src/components/meetings/MeetingsPageClient.tsx` — completed cards

After a Teams/Beem meeting ends:
- Show "Transcript Ready" badge instead of just "Completed"
- Quick action: "View Transcript" directly from the card (no audio player needed for external meetings)

### 5.3 — In-App Meeting Completed State
- Audio player shown only for In App completed meetings (audio was recorded locally)
- Teams/Beem completed meetings: show transcript viewer only (no audio player)

**Deliverables**: Dashboard and meetings list are contextually smart. Users always know what action to take next.

---

## Phase 6 — Completed Meeting Detail (Post-Meeting)
**Goal**: Differentiate the completed meeting detail view by platform.

### 6.1 — Completed External Meeting (Teams/Beem)
**File**: `MeetingDetailClient.tsx` — completed meeting view

- Remove audio player (no local audio for external meetings)
- Show full-width transcript with search, download options
- Show AI summary tab (available for all)
- Show participant list with speaking time (from transcript analysis)

### 6.2 — Completed In-App Meeting
- Keep audio player (recorded locally)
- Full transcript with speaker attribution
- AI summary tab
- Download options (transcript + audio)

### 6.3 — Transcript Quality & Features
- Highlight translated vs original language segments
- Click a transcript line → jump to that time in audio (In App only)
- Search within transcript
- Speaker filter

---

## Implementation Order Summary

| Phase | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Phase 1 — Data model + CTA routing | 🔴 Critical | Medium | High — fixes core confusion |
| Phase 2 — External transcript viewer | 🔴 Critical | Medium | High — core external meeting flow |
| Phase 3 — In-app meeting room | 🟡 High | High | High — core in-app flow |
| Phase 4 — Integration sync UX | 🟡 High | Low-Medium | Medium — clarity on sync model |
| Phase 5 — Smart notifications/status | 🟢 Medium | Medium | Medium — proactive UX |
| Phase 6 — Completed meeting detail | 🟢 Medium | Medium | Medium — post-meeting value |

---

## Files Changed Per Phase

| Phase | Files Modified |
|-------|---------------|
| 1 | `types/meeting.ts`, `meetings-data.ts`, `lib/services/meetings.ts`, `MeetingsPageClient.tsx`, `MeetingCard.tsx`, `UpcomingMeetingItem.tsx`, `DashboardView.tsx` |
| 2 | `MeetingDetailClient.tsx` (major) |
| 3 | `MeetingDetailClient.tsx`, `NewMeetingModal.tsx` |
| 4 | `IntegrationsSettingsPanel.tsx`, `NewMeetingModal.tsx` |
| 5 | `DashboardView.tsx`, `MeetingsPageClient.tsx`, `MeetingCard.tsx` |
| 6 | `MeetingDetailClient.tsx`, `meetings-data.ts` |

---

## Open Questions for Review

1. **External meeting audio**: Should users on MOFA ever hear audio from a Teams/Beem meeting piped through? Or strictly read-only transcript only?
2. **In-App recording**: Should In App meetings auto-record for playback after the meeting ends?
3. **Language assignment**: Is language assigned at meeting creation time, or can participants set their own language when joining?
4. **Sync frequency**: How often should meetings sync from Teams/Beem? Real-time webhook? Polling?
5. **Transcript source**: For Teams/Beem meetings, does MOFA receive the raw transcript from their APIs, or does MOFA generate its own via a separate audio stream?
6. **Participant presence**: For external meetings, do we show participants from the integration API, or do we track who's viewing the transcript on MOFA?

# Upcoming Meetings — Implementation Plan

## Current State

- 3 upcoming meetings with demo data (m4, m5, m6)
- RSVP states: pending, accepted, declined (local overrides via React state)
- Upcoming card shows: date chip, title, platform badge, metadata, RSVP actions
- More menu with generic options (Copy link, Share, Download transcript, Delete)
- Filter dropdown with: Accepted, Declined, Pending, All (UI only, not wired)
- Search filters by title only

---

## Phase 1: RSVP State Transitions & Reversibility

**Goal:** Allow users to change their mind after accepting or declining.

### Tasks

- [x] **1.1** After accepting, show "Join Meeting" button and move the decline action into the more menu
- [x] **1.2** After declining, show "Declined" badge and move the re-accept/revoke action into the more menu
- [x] **1.3** Add a confirmation toast/snackbar when RSVP state changes (e.g. "Meeting accepted", "Meeting declined") — use a simple auto-dismiss banner at the bottom
- [x] **1.4** Animate the transition between RSVP states (fade out old buttons, fade in new ones)
- [x] **1.5** Ask for confirmation in a modal before declining a meeting

### Files to modify

- `MeetingsPageClient.tsx` → MeetingCard upcoming section (lines 554–600)

---

## Phase 2: Time-Aware Meeting States

**Goal:** Show contextual urgency based on how close the meeting is.

### Tasks

- [x] **2.1** Add `startDatetime` / `endDatetime` fields to Meeting type for time-state calculations
- [x] **2.2** Create a `useRelativeTime` hook that returns the meeting's temporal state:
  - `future` — more than 1 hour away
  - `soon` — within 1 hour (show "Starts in X min")
  - `live` — current time is within the meeting window (show pulsing "Live" badge)
  - `ended` — meeting time has passed
- [x] **2.3** Display a relative time chip on the card:
  - "Tomorrow", "In 2 days" for far-future meetings
  - "Starts in 45 min" → yellow/amber urgency indicator
  - "Starts in 10 min" → red urgency indicator
  - "Live" → pulsing green dot with "In Progress" badge
- [x] **2.4** For "live" meetings, make the Join button more prominent (pulsing border or glow)
- [x] **2.5** For "ended" meetings still in upcoming tab, show a muted "Missed" badge and gray out the card slightly
- [x] **2.6** Update demo data dates to be relative to `new Date()` so states can be demoed

### Files to modify

- `meetings-data.ts` → add `startTime`/`endTime` or a helper to parse them
- `MeetingsPageClient.tsx` → MeetingCard upcoming section, new badges/indicators

---

## Phase 3: Filter & Search Enhancements

**Goal:** Make filters functional and combine with search.

### Tasks

- [ ] **3.1** Wire up RSVP filter (Accepted / Declined / Pending / All) to actually filter the upcoming meeting list
- [ ] **3.2** Add active filter indicator — show selected filter as a pill/tag below the filter button
- [ ] **3.3** Combine filter + search: both should apply simultaneously
- [ ] **3.4** Add "Clear filters" link when any filter is active
- [ ] **3.5** Update meeting count badge on the tab to reflect filtered count (e.g. "2 of 3")
- [ ] **3.6** Persist filter selection in URL params or session state so it survives tab switches

### Files to modify

- `MeetingsPageClient.tsx` → filter state, filtering logic, UI

---

## Phase 4: More Menu — Context-Aware Actions

**Goal:** Make the 3-dot menu show relevant actions for upcoming meetings.

### Tasks

- [x] **4.1** Change more menu items for upcoming meetings:
  - "Copy meeting link"
  - "Add to calendar" (download .ics)
  - "Reschedule" (placeholder)
  - "Cancel meeting" (only if user is host)
- [x] **4.2** Differentiate menu items based on whether user is host vs attendee
- [x] **4.3** Add confirmation dialog for "Cancel meeting" action
- [x] **4.4** "Copy meeting link" should actually copy to clipboard with visual feedback

### Files to modify

- `MeetingsPageClient.tsx` → MoreMenu component, new menu items

---

## Phase 5: Edge Case Handling

**Goal:** Handle all edge cases gracefully.

### Tasks

- [x] **5.1** Long meeting titles — add `line-clamp-1` or `truncate` with full title in tooltip
- [x] **5.2** Singular participant text — "1 Participant" vs "10 Participants"
- [x] **5.3** No meeting link — disable Join button with "Link not available" tooltip for external platforms; for "In App" show "Open Meeting Room"
- [x] **5.4** No language specified — hide the language field entirely
- [x] **5.5** Meeting conflict detection — if two upcoming meetings overlap in time, show a small warning icon "Scheduling conflict"

### Files to modify

- `MeetingsPageClient.tsx` → MeetingCard, ParticipantAvatars
- `meetings-data.ts` → add edge-case demo entries

---

## Phase 6: Empty & Loading States

**Goal:** Polish the experience when there's nothing to show.

### Tasks

- [ ] **6.1** Upcoming tab empty state — friendly illustration + "No upcoming meetings" + CTA to create one
- [ ] **6.2** Filtered empty state — "No meetings match your filters" + "Clear filters" link
- [ ] **6.3** Search empty state — "No meetings found for '{query}'" (already partially done)

### Files to modify

- `MeetingsPageClient.tsx` → empty state sections

---

## Phase 7: Polish & Micro-Interactions

**Goal:** Make it feel premium.

### Tasks

- [ ] **7.1** Card hover effect — subtle lift/shadow on hover
- [ ] **7.2** RSVP button loading state — brief spinner when clicking Accept/Decline
- [ ] **7.3** Date chip style variants — different ring color when meeting is "soon" (amber) or "live" (green)
- [ ] **7.4** Smooth card re-ordering animation when filter changes
- [ ] **7.5** Keyboard accessibility — tab navigation through cards, Enter to accept/decline

### Files to modify

- `MeetingsPageClient.tsx` → various components

---

## Implementation Order (Recommended)

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| 1        | Phase 1 — RSVP Transitions | Small | High |
| 2        | Phase 3 — Filters working | Small | High |
| 3        | Phase 5 — Edge cases | Medium | High |
| 4        | Phase 2 — Time-aware states | Medium | High |
| 5        | Phase 4 — Context menus | Small | Medium |
| 6        | Phase 6 — Empty states | Small | Medium |
| 7        | Phase 7 — Polish | Medium | Medium |

---

## Demo Data Updates Needed

To properly demonstrate all states, update `meetings-data.ts` with:

```
m4 — Pending RSVP, future date (days away)
m5 — Accepted, shows Join Meeting
m6 — Pending, starting soon (within 15 min of current time)
m7 — Declined meeting (new)
m8 — Live / in-progress meeting (new)
m9 — Missed / ended meeting still in upcoming (new)
m10 — Conflicting time with m6 (new)
```

Total new demo meetings to add: 4 (m7–m10)

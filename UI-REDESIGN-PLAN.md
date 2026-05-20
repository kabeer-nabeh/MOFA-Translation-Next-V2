# MOFA UI Redesign Plan

## Vision

Shift from a top-navbar, full-width layout to a **left sidebar + content area** shell (Wispr Flow pattern).
New color theme uses a warm off-white base (`#FCFCFB`), a warm cream sidebar (`#F5F4F1`), and violet accent.
Home page is restructured: **hero banner → live/upcoming meeting → recent completed meetings**.

All functionality stays intact. Only layout, color, and component styling changes.

---

## Design System Reference

| Token | Current | New |
|---|---|---|
| Page background | `#ffffff` | `#FCFCFB` |
| Sidebar background | white (top navbar) | `#F5F4F1` (warm cream) |
| Sidebar text | `slate-700` | `#3D3D3D` (near-black) |
| Sidebar text muted | — | `#7A7A7A` |
| Sidebar active bg | `#eeeff6` | `#ECEAE5` (darker cream pill) |
| Sidebar active text | `#252b37` | `#1A1A1A` |
| Sidebar active border | none | `#D9D6CE` |
| Sidebar divider | — | `#E3E1DC` |
| Primary accent | `#48476e` | `#7C3AED` (violet) |
| Primary accent hover | `#3f3e63` | `#6D28D9` |
| Primary border | `#5a597d` | `#7C3AED` |
| Card bg | `white` / `#f3f3f7` | `white` with `#E9E9EF` border |
| Card radius | `rounded-xl` | `rounded-xl` (keep) |
| Body font | IBM Plex Sans | IBM Plex Sans (keep) |
| Secondary button | white + `#d5d7da` border | white + `#D4D4DB` border |
| Tertiary button | transparent | transparent |

### New CSS Variables (globals.css additions)

```css
/* Sidebar */
--mofa-sidebar-bg: #F5F4F1;
--mofa-sidebar-text: #3D3D3D;
--mofa-sidebar-text-muted: #7A7A7A;
--mofa-sidebar-active-bg: #ECEAE5;
--mofa-sidebar-active-border: #D9D6CE;
--mofa-sidebar-active-text: #1A1A1A;
--mofa-sidebar-divider: #E3E1DC;
--mofa-sidebar-width: 220px;

/* Updated primary button */
--mofa-btn-primary-bg: #7C3AED;
--mofa-btn-primary-border: #7C3AED;
--mofa-btn-primary-hover: #6D28D9;
--mofa-btn-primary-text: #ffffff;

/* Page background */
--mofa-page-bg: #FCFCFB;

/* Content borders */
--mofa-border-default: #E9E9EF;
--mofa-border-subtle: #F0F0F5;

/* Text */
--mofa-text-primary: #1A1A2E;
--mofa-text-secondary: #52525B;
--mofa-text-muted: #A1A1AA;
```

---

## Phase 1 — Design Tokens & Global Styles

**Goal**: Establish all new CSS variables and update base styles. Everything still looks the same in layout — only colors shift.

### Files to change

**`src/app/globals.css`**
- Replace all current `--mofa-*` variable values with new palette above
- Add the new sidebar and page-bg variables
- Keep all animations unchanged

**`src/app/layout.tsx`**
- `body` className: change `bg-white` → `bg-[color:var(--mofa-page-bg)]`
- `text-slate-900` → `text-[color:var(--mofa-text-primary)]`

**`tailwind.config.ts`**
- No changes needed (we use CSS vars directly)

### Deliverable
App background becomes `#FCFCFB`. Primary buttons become violet. No layout changes yet.

---

## Phase 2 — Left Sidebar Shell (replaces top Navbar)

**Goal**: Replace the fixed top `<Navbar>` with a persistent left sidebar navigation. All pages use the new shell.

### New component: `src/components/layout/AppSidebar.tsx`

Structure (mirrors Wispr Flow):

```
┌─────────────────────┐
│  [Logo]  Baseer     │  ← 32px logo + product name
├─────────────────────┤
│  🏠  Home           │  ← nav items: icon (20px) + label
│  📹  Meetings       │
│  📅  Calendar       │
│  📊  Analytics      │
│  ⚙️  Settings       │
│                     │
│  ─────────────────  │  ← subtle divider
│  🌐  عربي           │  ← language switcher
├─────────────────────┤  ← spacer pushes bottom section down
│  ┌───────────────┐  │
│  │ 👤 User name  │  │  ← user card with avatar, small
│  │   Notifications│  │
│  └───────────────┘  │
└─────────────────────┘
```

Active nav item: full-width pill with `#ECEAE5` bg + `#D9D6CE` border + `#1A1A1A` text.
Inactive: `#7A7A7A` text, transparent bg, hover → `#ECEAE5`.

**Props**: `activeHref`, `user`, `language`

### New component: `src/components/layout/AppShell.tsx`

```tsx
// Fixed sidebar + scrollable content area
<div className="flex min-h-dvh">
  <AppSidebar ... />
  <main className="flex-1 overflow-y-auto bg-[color:var(--mofa-page-bg)]">
    {children}
  </main>
</div>
```

### Updated component: `src/components/layout/PageContainer.tsx`

Adjust padding from `px-[120px]` to `px-8 py-8 max-w-5xl` — the sidebar already handles the left edge.

### Pages to update (remove `<Navbar>` + wrap in `<AppShell>`)

| Page | File |
|---|---|
| Home | `src/components/dashboard/DashboardView.tsx` |
| Meetings | `src/components/meetings/MeetingsView.tsx` |
| Calendar | `src/app/calendar/page.tsx` or its client component |
| Analytics | `src/app/analytics/page.tsx` or its client component |
| Settings | `src/components/settings/*` |
| Meeting detail | `src/components/meetings/MeetingDetailClient.tsx` |

Each page: remove `<Navbar ... />` and the spacer `<div className="h-20">`, wrap content in `<AppShell activeHref="...">`.

### Deliverable
All pages use left sidebar. Top navbar is gone. Layout shifts to sidebar + content.

---

## Phase 3 — Home Page Redesign

**Goal**: Restructure `/` into three clear sections: hero banner → live/upcoming meeting → recent completed.

### Section 1: Hero Banner

Dark card (`#1B1B2E` bg) spanning full content width, ~180px tall.

```
┌────────────────────────────────────────────────────────────┐
│                                          [meeting photo]   │
│  Create meetings with                                       │
│  Live Translation  ← purple accent                         │
│                                                            │
│  Break language barriers in real time.                     │
│  [Create Meeting ⊕]                                        │
└────────────────────────────────────────────────────────────┘
```

- Background: `#1B1B2E` with a subtle radial gradient toward `#2D1B69` on the right
- Heading: white, `text-3xl font-bold`, "Live Translation" in `#A78BFA` (soft violet)
- Subtext: `#9CA3AF`
- CTA: white pill button `bg-white text-[#1B1B2E] font-semibold`
- Right side: meeting photo image (use existing public assets or a decorative element)

**File**: New `src/components/dashboard/HeroBanner.tsx`

### Section 2: Live / Upcoming Meeting (join CTA)

If a meeting is live → show `MeetingCard` (existing, re-skinned in Phase 4).
If no live meeting but there's an upcoming one soon → show the next upcoming meeting with a "Ready to join" state.
If nothing → hide this section entirely (no empty state needed on home).

### Section 3: Upcoming Meetings (next 3–5)

Keep existing `UpcomingMeetingItem` list, but:
- Wrap in a bordered card container (`border border-[#E9E9EF] rounded-xl bg-white`)
- Section header "Upcoming Meetings" + "View All →" link
- Show max 4 items

### Section 4: Recent Completed Meetings (NEW)

New section below upcoming:
- Header: "Recent Meetings" + "View All →"
- Pull from `getMeetings()` filtered to `status === "completed"`, last 3
- Each item: a compact row — title, date, platform badge, "View Transcript →" link
- Wrap in same bordered card container

**New file**: `src/components/dashboard/RecentMeetingsSection.tsx`
**Updated file**: `src/components/dashboard/DashboardView.tsx`
**Updated service**: `src/lib/services/meetings.ts` — add `getRecentCompletedMeetings()` helper

### Deliverable
Home page has 4 clear sections. No empty states clutter. Clean hierarchy.

---

## Phase 4 — Component Re-skin

**Goal**: Update all shared UI components to use the new token values.

### `src/components/ui/Button.tsx`
- `primary` variant: `--mofa-btn-primary-bg` (now violet `#7C3AED`) — variable already used, just update the variable value in Phase 1.
- `secondary` variant: border → `--mofa-border-default`
- `tertiary` variant: hover bg → `#F4F4F8`

### `src/components/ui/Card.tsx`
- Default: `border-[color:var(--mofa-border-default)] bg-white` (replace `border-slate-200`)

### `src/components/dashboard/MeetingCard.tsx`
- Background: `bg-white border border-[color:var(--mofa-border-default)]` (replace `bg-[#f3f3f7]`)
- Date chip ring: update accent ring from `#8988ab` → `#7C3AED`
- "Live" badge: keep green (status colors don't change)

### `src/components/dashboard/UpcomingMeetingItem.tsx`
- Border colors: `--mofa-border-default` instead of hardcoded slate values

### `src/components/meetings/MeetingsPageClient.tsx`
- Filter pills, table borders: update to `--mofa-border-default`
- Active filter: violet accent

### `src/components/layout/Navbar.tsx`
- No changes needed — it will be removed in Phase 2 (kept in file for reference, just not used)

### Platform badge colors
- Keep as-is (Teams blue, Beem blue, In App neutral) — platform colors are intentional

### Deliverable
All cards and buttons use the new palette. Purple replaces navy on interactive elements.

---

## Phase 5 — Remaining Pages Polish

**Goal**: Ensure Calendar, Analytics, Settings, and Meeting Detail all look correct in the new shell.

### Calendar page
- Remove top navbar, use `<AppShell activeHref="/calendar">`
- Calendar grid border colors → `--mofa-border-default`
- Today highlight → violet `#7C3AED` instead of current accent

### Analytics page
- Remove top navbar, use `<AppShell activeHref="/analytics">`
- Chart/card borders → `--mofa-border-default`

### Settings page
- Remove top navbar, use `<AppShell activeHref="/settings">`
- Tab/section borders → `--mofa-border-default`
- Integration connect buttons → violet primary

### Meeting Detail (Live room)
- The live meeting room uses a full-screen layout that hides the main nav — this is intentional and stays
- Update any hardcoded `bg-white` / `border-slate-*` colors inside the live room to match new tokens

### Meetings list page
- Remove top navbar, use `<AppShell activeHref="/meetings">`
- Filter bar, table rows → updated borders

### Deliverable
Every page is visually consistent. No leftover slate/white backgrounds.

---

## File Change Summary

| Phase | Files |
|---|---|
| 1 — Tokens | `globals.css`, `layout.tsx` |
| 2 — Shell | `AppSidebar.tsx` (new), `AppShell.tsx` (new), `PageContainer.tsx`, `DashboardView.tsx`, `MeetingsView.tsx`, `MeetingDetailClient.tsx`, calendar/analytics/settings pages |
| 3 — Home | `HeroBanner.tsx` (new), `RecentMeetingsSection.tsx` (new), `DashboardView.tsx`, `meetings.ts` service |
| 4 — Components | `Button.tsx`, `Card.tsx`, `MeetingCard.tsx`, `UpcomingMeetingItem.tsx`, `MeetingsPageClient.tsx` |
| 5 — Pages | calendar, analytics, settings, meeting detail (border/color cleanup only) |

---

## Implementation Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

Each phase is independently reviewable/deployable.
Phase 1 is the lowest risk (pure variable changes, nothing moves).
Phase 2 is the biggest structural change — do this before Phase 3 so the home redesign lands in the correct shell.

---

## Open Questions

1. **Sidebar collapse on mobile?** Current app has a responsive navbar. Sidebar on mobile = hamburger menu or bottom tab bar?
2. **User section at bottom of sidebar**: Show just avatar + name, or also notifications badge?
3. **Hero banner image**: Use the meeting photo from the reference (`/baseer-logo.png` area)? Or a gradient-only version?
4. **Completed meetings on home**: Show last 3? Or only if there are any in the last 7 days?
5. **Language switcher in sidebar**: Keep as a nav item or move to user section at bottom?

# MOFA Application Design System & Components

This document outlines the design tokens, core UI components, and domain-specific feature modules used throughout the MOFA Next.js application.

---

## 🎨 Design Tokens

Our design tokens are built using a mix of CSS root variables in `globals.css` and strictly enforced Tailwind CSS utility classes within the centralized UI components.

### 1. Global UI Colors
- **Primary Text:** `#414651` (`--mofa-text-primary`)
- **Subtle Borders & Dividers:** `#eeedf5` (`--mofa-border-subtle`)
- **Page Background:** `#ffffff` (White)
- **Card Backgrounds:** `#f3f3f7` / `#fdfcfc`

### 2. Buttons
**Primary Button (Skeuomorphic)**
Used for primary actions (e.g., "Create Role", "New Meeting").
- **Background:** `#48476e`
- **Border:** `#5a597d` (2px width)
- **Text:** `#ffffff`
- **Hover:** `#3f3e63`
- **Inner Glow/Shadow:** `shadow-[0_1px_2px_0_rgb(0_0_0_/_0.08),inset_0_1px_0_0_rgb(255_255_255_/_0.08)]`

**Secondary Button (Outline)**
Used for secondary actions, dropdowns, and exports (e.g., "Export CSV", "Accept/Decline", "Last 30 Days").
- **Background:** `#ffffff`
- **Border:** `#d5d7da` (`--mofa-btn-outline-border`)
- **Text:** `#414651`
- **Hover:** `#f3f3f7` (`--mofa-btn-outline-hover`)
- **Selected State:** `#eeeff6` (`--mofa-btn-outline-selected`)
- **Shadow:** `shadow-[0_1px_2px_0_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05)]`

### 3. Typography
- **Primary Font:** IBM Plex Sans (`--font-ibm-plex-sans`), falling back to `ui-sans-serif, system-ui, sans-serif`.

---

## 🧩 Reusable UI Components (`src/components/ui/`)

These are the "dumb" components. They strictly consume design tokens and accept standard HTML props. **No business logic or data fetching occurs here.**

- `<Button />`: The universal button component. Accepts `variant="primary"` or `variant="secondary"`.
- `<ButtonLink />`: An identical visual wrapper to `<Button />`, but renders a Next.js `<Link>` element for client-side routing.
- `<SelectDropdown />`: Standardized generic dropdown component (used for language selectors, USD selectors, and date ranges).
- `<Card />` / `<Card.Content />`: A wrapper component providing consistent padding, rounded corners, and structural backgrounds.
- `<Avatar />`: Standardized user profile image component with fallback initials generation.
- `<Badge />`: Small pill-shaped status indicator.
- `<Input />`: Standardized form text input wrapper.
- `<IconButton />`: Minimal button wrapper intended solely for square icon actions.

---

## 🏗️ Feature Architecture (`src/components/`)

These components map exactly to the pages and sections of the application. They are designed to be "smart" and easily wireable to actual API endpoints via the `src/lib/services/` layer.

### 1. Dashboard (`/dashboard/`)
- `DashboardView.tsx`: The main page layout containing the greeting, active meetings, and upcoming items.
- `GreetingSection.tsx`: Renders the user welcome and the "New Meeting" trigger.
- `MeetingCard.tsx`: The large card displaying the currently active meeting in progress.
- `UpcomingMeetingItem.tsx`: The list item component used for pending scheduled meetings (includes Accept/Decline actions).

### 2. Settings (`/settings/`)
- `SettingsView.tsx`: The core wrapper handling the left-hand tab navigation state.
- `ProfileSettingsPanel.tsx`: Form UI for user personal details and preferences.
- `RolesSettingsPanel.tsx`: RBAC table, permissions mapping, and "Create Role" trigger.
- `UsageCostsPanel.tsx`: The cost analytics tables and Recharts area charts.
- `UsersSettingsPanel.tsx`: The user management directory.

### 3. Analytics (`/analytics/`)
- `AnalyticsView.tsx`: The core page wrapper.
- `AnalyticsChartsClient.tsx`: A heavy client-side component handling the translation usage line charts, language doughnut charts, and total metrics cards.

### 4. Layout (`/layout/`)
- `Navbar.tsx`: The top-level application navigation, user menu, and language toggler.
- `PageContainer.tsx`: Standardized max-width and padding container for consistency across pages.

### 5. Meetings (`/meetings/`)
- `NewMeetingModal.tsx`: The popup dialog for scheduling a new translation session.
- `NewMeetingModalTrigger.tsx`: The button that controls the modal visibility state.

# UI Redesign: Refined Aesthetic + Modal Logging + Rich Leaderboard

**Date:** 2026-05-13  
**Status:** Approved  
**Author:** Claude

---

## Overview

Redesign the Mayhem Sprint tracker for a **refined, premium aesthetic** with:
- Elegant dark theme + gold accents (not bold/energetic)
- Separate pages for logging and leaderboard (no consolidation)
- Single unified "Log Activity" modal (replaces quick-tap buttons)
- Rich inline badges on leaderboard rows (streak, pace, MVP, conversion king)
- Support for both same-day and range-based logging

---

## Visual Direction: Refined & Premium

**Aesthetic principles:**
- Sophisticated dashboard feel (like luxury/financial UI)
- Elegant typography and spacing
- Subtle gradients and shadows
- Gold used sparingly for elegance, not energy
- Card-based, organized layouts
- Generous white space (breathing room)

**Color palette:**
- `brand-gold: #B18F32` (primary, used sparingly)
- `brand-gold-bright: #D4AF54` (interactive elements, buttons)
- `brand-black: #121212` (background)
- `brand-surface: #1A1A1A` (card backgrounds)
- `brand-muted: #888888` (text, secondary)
- `brand-success: #22C55E` (pace indicators, on-pace badges)
- `brand-danger: #EF4444` (off-pace, warnings)

---

## Pages

### 1. Home Page: Logging Hub

**Purpose:** Primary entry point for agents to log activity. Real-time view of team progress and recent activity.

**Layout:**
```
┌─────────────────────────────────────┐
│  MAYHEM SPRINT · 48 days to go      │   ← BrandHeader
│  Team total: 1,247 outreach · 38    │
├─────────────────────────────────────┤
│                                     │
│  Who's logging?                     │
│  [ 🎯 Jason O'Brien          ▾ ]    │   ← Agent selector
│                                     │
│  [  Log Activity  ]                 │   ← Single button
│                                     │
├─────────────────────────────────────┤
│  RECENT ACTIVITY                    │
│  • Selina · +5 outreach · 2m ago    │
│  • Mike · +3 outreach, +1 lead · 8m │
│  • Jason · backfilled 3 days · 1h   │
└─────────────────────────────────────┘
```

**Components:**
- **BrandHeader:** Sprint countdown, team totals (attempts + leads)
- **Agent Selector:** Dropdown showing active agents, persisted in localStorage
- **Log Activity Button:** Gold, full-width. Opens LogActivityModal
- **Recent Activity:** Live feed of latest entries, updates via Realtime

**Behavior:**
- Agent selection persists across sessions (localStorage)
- Real-time updates via Supabase Realtime subscription
- Toast confirmation after logging

---

### 2. LogActivityModal

**Purpose:** Unified interface for logging today or backfilling a range.

**Layout:**

```
┌─────────────────────────────────────┐
│  Log Activity                    [×] │
├─────────────────────────────────────┤
│                                     │
│  [● Today]  [○ Range]               │  ← Toggle
│                                     │
│  ┌─ Today's Activity ──────────┐   │
│  │ Date: May 13, 2026 (Today)   │   │
│  │                              │   │
│  │ Outreach Attempts            │   │
│  │ [ − ]  [  5  ]  [ + ]         │   │
│  │                              │   │
│  │ Leads Generated (optional)   │   │
│  │ [ − ]  [  0  ]  [ + ]         │   │
│  │                              │   │
│  │ [Cancel]  [Log 5 Attempts ▸] │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌─ Range Mode ──────────────────┐  │
│  │ Start Date:  [ May 6  📅 ]     │  │
│  │ End Date:    [ May 12 📅 ]     │  │
│  │ → 7 days                       │  │
│  │                              │  │
│  │ Total Outreach Attempts      │  │
│  │ [ − ]  [ 35  ]  [ + ]         │  │
│  │ (across 7 days)              │  │
│  │                              │  │
│  │ Total Leads (optional)       │  │
│  │ [ − ]  [  2  ]  [ + ]         │  │
│  │                              │  │
│  │ [Cancel]  [Log 35 ▸]          │  │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- **Toggle:** Segmented control for "Log Today's Activity" vs "Log for a Range"
- **Today mode:**
  - Date: Pre-filled with today's date (read-only in v1)
  - Attempts: Number stepper (− / input / +)
  - Leads: Optional number stepper
  - Button: "Log [N] Attempts" (dynamic label)

- **Range mode:**
  - Start Date: Date picker, must be ≥ sprint_start_date
  - End Date: Date picker, must be ≤ today, ≥ start date
  - Days display: "→ 7 days" (auto-calculated, read-only)
  - Attempts: Total across entire range (not per-day)
  - Leads: Optional total across entire range
  - Button: "Log [N] Attempts" (dynamic label)

**Validation:**
- Attempts + leads must be > 0 (client + server check constraint)
- Attempts must be 0–200
- Leads must be 0–50
- Range: start_date ≤ end_date, both within sprint window
- Cannot log to future dates

**Submission:**
- Insert one row per day in the range (today = 1 row, 3-day range = 3 rows)
- All rows inserted atomically (single query)
- After success: close modal, show toast, refresh Recent Activity via Realtime

---

### 3. Leaderboard Page

**Purpose:** Live rankings with multiple time windows and recognition badges.

**Layout:**
```
┌─────────────────────────────────────┐
│  MAYHEM SPRINT · 48 days to go      │   ← BrandHeader
│  Team total: 1,247 outreach · 38    │
├─────────────────────────────────────┤
│  Leaderboard                        │
│  Live rankings across the sprint    │
│                                     │
│  [Today] [This Week] [Sprint Total] │   ← Tabs
│                                     │
│  ┌─────────────────────────────┐   │
│  │ #1  🎯 Jason O'Brien    [🔥6]  │   ← Row with inline badges
│  │ 32 attempts · 4 leads · 12.5%   │
│  │ [On pace] [👑 MVP]              │
│  │                                 │
│  │ #2  ⚡ Selina              [🔥4]│
│  │ 28 attempts · 2 leads · 7.1%    │
│  │ [On pace]                       │
│  │                                 │
│  │ #3  💪 Mike                [🔥5]│
│  │ 25 attempts · 5 leads · 20.0%   │
│  │ [👑 Conversion King]            │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Tabs:**
- **Today:** Aggregates outreach from today only
- **This Week:** Aggregates from Monday–Sunday (current sprint week)
- **Sprint Total:** Aggregates from sprint start (2026-05-12) to today

**Leaderboard Row Structure:**

Each row displays (left to right):
1. **Rank:** `#1`, `#2`, etc.
2. **Agent:** Emoji + name (e.g., `🎯 Jason O'Brien`)
3. **Streak badge:** `🔥 6` (far right, always visible)
4. **Stats (below name):** Attempts · Leads · Conversion %
5. **Inline badges (below stats):**
   - **On pace:** Green badge, shown if agent ≥ expected cumulative attempts for this sprint week
   - **Off pace:** Red badge (optional, shown if <50% of goal) — can defer to v2
   - **MVP:** Gold badge, top agent *today* (refreshes daily)
   - **Conversion King:** Gold badge, highest attempts→leads % this week/sprint

**Styling:**
- Card background: `brand-surface (#1A1A1A)`
- Rank 1: Left border `3px brand-gold`
- Rank 2+: No border or subtle border
- Conversion % color: Green tint if ≥10%, neutral otherwise
- Badge styling: Small pill-shaped with appropriate background (transparent gold or green)

**Sorting:**
- Primary: by attempts (descending)
- Tiebreaker: by leads (descending)

**Realtime updates:**
- Subscribe to outreach inserts
- Update leaderboard row on the fly
- Rank may shift; animate or flash to highlight changes

---

## Logging Flow: Today vs Range

### Today's Activity (Single Day)

1. User taps "Log Activity"
2. Modal opens with **Today** tab selected
3. Date field shows today (read-only)
4. User enters attempts (e.g., 5) and leads (e.g., 0)
5. Submit creates 1 row: `{ agent_id, activity_date: today, attempts: 5, leads: 0 }`
6. Modal closes, toast shows: "Logged 5 outreach for Jason 🎯"

### Range Logging (Backfill)

1. User taps "Log Activity"
2. Modal opens, user clicks **Range** tab
3. User picks start date (e.g., May 6) and end date (e.g., May 12)
4. Display shows: "→ 7 days"
5. User enters total attempts (e.g., 35 for the whole range) and leads (e.g., 2)
6. Submit logic:
   - For each day in [start, end], create one row
   - Each row: same attempts/leads value (not divided)
   - Example: 7 rows, each with `attempts: 35, leads: 2`
   - **Note:** Queries sum these, so total = 35 × 7 = 245 (this is intentional; user is saying "I logged 35 attempts total across 7 days")
   - **Alternative:** Distribute evenly (35 / 7 = 5 per day). [User to clarify intent]
7. Modal closes, toast shows: "Logged 35 outreach for Jason across May 6–12 🎯"

**→ Clarification needed:** When a user logs 35 attempts across 7 days, should we:
- **A:** Store 35 per day (7 rows × 35 each = 245 total when summed)
- **B:** Distribute evenly (5 per day, 7 rows × 5 = 35 total when summed)

*Current assumption: **B** (even distribution). The user enters the total, we divide by the number of days.*

---

## Components to Build/Update

### New Components
- `LogActivityModal` — modal with today/range toggle, number steppers, date pickers
- `DateModeToggle` — segmented control (today vs range)
- `NumberStepper` — − / input / + control
- `BadgePill` — small badge renderer (on-pace, MVP, etc.)

### Update Existing
- `LeaderboardRow` — add inline badges section
- `LeaderboardTabs` — ensure tabs work with new row structure
- `BrandHeader` — no changes needed
- `RecentActivity` — no changes needed
- `QuickLogButtons` — **remove entirely** (replaced by modal)

### Data/Logic
- `buildLeaderboard()` — compute streak, pace status, MVP, conversion king
- `computeStreak()` — consecutive days ≥ 5 attempts
- `isPaceOnTrack()` — agent at expected cumulative attempts for this week
- `topAgentToday()` — agent with most attempts today
- `conversionKing()` — agent with highest attempts→leads % this week
- Realtime subscription in `LeaderboardTabs` — already exists, ensure it works

---

## Validation & Error Handling

### Client-side
- Attempts + leads > 0 (inform user with inline error)
- Attempts 0–200 (stepper clamps)
- Leads 0–50 (stepper clamps)
- Date range: start ≤ end, both within sprint window
- No future dates

### Server-side (RLS)
- Same checks (attempts, leads, date window)
- Table constraint: `attempts + leads > 0`
- Table constraint: `attempts between 0 and 200`, `leads between 0 and 50`

### Toast messages
- Success: "Logged [N] outreach for [Agent] 🎯" (today) or "Logged [N] outreach for [Agent] across [Start]–[End] 🎯" (range)
- Error: "Failed to log. Please try again."

---

## Realtime Behavior

- **Home page:** RecentActivity subscribes to outreach inserts, prepends new row
- **Leaderboard:** LeaderboardTabs subscribes to inserts, updates affected rows, re-ranks if needed
- **Animation:** Optional: fade-in or slide-in for new entries; highlight for rank changes

---

## Navigation

- Header or nav bar with links to:
  - Home (logging)
  - Leaderboard
  - Board (big screen, if visible in nav)
  - Admin (if applicable for this user)

---

## Out of Scope (v1)

- Edit/delete logging UI (handled in /admin)
- Per-day entry editing in range mode
- Lead detail tracking (name, source, status)
- Email/SMS notifications
- Offline support
- Dark/light theme toggle (always dark)

---

## Success Criteria

- ✓ Modal opens and closes cleanly
- ✓ Today/range toggle works
- ✓ Date pickers work (within sprint window)
- ✓ Number steppers work (bounds enforced)
- ✓ Submit creates correct rows (today = 1, range = N)
- ✓ Leaderboard shows all badges (streak, pace, MVP, conversion)
- ✓ Inline badges styled consistently
- ✓ Realtime updates work on both pages
- ✓ Toast messages appear on success
- ✓ No quick-tap buttons on home page
- ✓ Refined aesthetic throughout (colors, spacing, shadows)

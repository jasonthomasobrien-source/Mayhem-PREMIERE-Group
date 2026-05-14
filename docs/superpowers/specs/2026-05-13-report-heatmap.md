# Report Page: Calendar Heatmap

**Date:** 2026-05-13  
**Status:** Design approved, ready for implementation

---

## Overview

A new `/report` page shows outreach activity as a calendar heatmap. The heatmap visualizes daily attempts across the entire sprint (May 12 – June 30, 2026) with an agent dropdown to filter down to a single person's data.

**Why:** Provides at-a-glance visibility into team and personal consistency patterns. Darker days = more effort. Useful for spotting trends ("I always slack on Wednesdays") and celebrating momentum.

---

## Route & Navigation

- **Path:** `/report`
- **Menu placement:** Add "Report" to the main nav menu (between Leaderboard and Admin, or as you prefer)
- **Accessible from:** All pages via navigation

---

## Page Layout

```
┌─────────────────────────────────────┐
│  REPORT                             │
├─────────────────────────────────────┤
│                                     │
│  View:                              │
│  [ All Agents ▼ ]                   │
│                                     │
│  Calendar Heatmap                   │
│  May 2026                           │
│  ┌─────────────────────────────────┐│
│  │ Su Mo Tu We Th Fr Sa            ││
│  │                   1  2  3       ││
│  │  4  5  6  7  8  9  10          ││
│  │ 11 12 13 14 15 16 17           ││
│  │ 18 19 20 21 22 23 24           ││
│  │ 25 26 27 28 29 30 31           ││
│  └─────────────────────────────────┘│
│                                     │
│  Legend:                            │
│  □ No activity  ░ Light  ▓ Good █ Great
│                                     │
│  Stats:                             │
│  Total attempts this sprint: 347    │
│  Best day: May 13 (65 attempts)     │
│  Days logged: 28/50                 │
└─────────────────────────────────────┘
```

---

## Components & Behavior

### Agent Dropdown

- **Label:** "View:"
- **Default:** "All Agents"
- **Options:** All 12 agent names, sorted alphabetically
- **Behavior:** Selecting an agent recomputes the heatmap and stats instantly
- **State:** Not persisted (fresh page load always shows "All Agents")
- **Styling:** Match the agent selector on the home logger (shadcn Select)

### Calendar Heatmap

**Layout:**
- Monthly calendars (May, June) rendered side-by-side or stacked depending on screen width
- Standard calendar grid: Sun–Sat, 7 columns
- Show only dates within the sprint window (May 12 – June 30)
- Dates outside the sprint (May 1–11) shown but grayed out / non-interactive

**Color Intensity (Absolute Attempts):**

| Intensity | Individual Agent | Team (All 12) | Tailwind Class | Hex |
|-----------|-----------------|---------------|----------------|-----|
| None | 0 attempts | 0 attempts | `bg-gray-900` | #111827 |
| Light | 1–10 | 20–40 | `bg-yellow-900` | #713F12 |
| Medium | 11–25 | 41–80 | `bg-yellow-700` | #B45309 |
| Dark | 26+ | 80+ | `bg-yellow-600` (brand gold) | #D97706 |

Use Tailwind's `bg-yellow-*` shades to match the brand gold aesthetic. All cells have a subtle border (e.g., `border border-gray-800`).

**Hover Behavior:**
- Tooltip appears on hover showing:
  - Date (e.g., "May 13, 2026")
  - Attempts (e.g., "5 attempts" or "0 attempts")
  - Leads (e.g., "1 lead")
  - If filtering by agent, show agent's name

**Styling:**
- Each day cell is roughly square, sized to fit comfortably on mobile (at least 36px × 36px)
- Text is small and centered (day number only, no other text in the cell)
- Hover slightly enlarges or adds a border highlight for clarity

### Legend

Simple horizontal legend below the heatmap:
```
□ No activity  ░ Light  ▓ Good  █ Great
```

Maps to the color intensity buckets above. Keep it minimal.

### Stats Section

Three key metrics displayed below the heatmap:

1. **Total attempts this sprint:** Sum of all attempts from sprint start through today (or selected agent's total)
2. **Best day:** Date + attempt count of the highest single day
3. **Days logged:** Count of days with ≥1 attempt

**Format:**
```
Total attempts this sprint: 347
Best day: May 13 (65 attempts)
Days logged: 28/50
```

If filtering by agent and they have 0 attempts, show:
```
No activity logged yet.
```

---

## Data Flow

### All Agents View

```
SELECT 
  activity_date,
  SUM(attempts) as daily_total,
  SUM(leads) as daily_leads
FROM outreach
WHERE activity_date >= sprint_start AND activity_date <= today
GROUP BY activity_date
ORDER BY activity_date DESC;
```

Color each day by `daily_total`.

### Single Agent View

```
SELECT 
  activity_date,
  SUM(attempts) as daily_total,
  SUM(leads) as daily_leads
FROM outreach
WHERE agent_id = ? 
  AND activity_date >= sprint_start AND activity_date <= today
GROUP BY activity_date
ORDER BY activity_date DESC;
```

Color each day by `daily_total` for that agent.

---

## Components to Build

1. **`CalendarHeatmap.tsx`** (~200 lines)
   - Props: `data: { date: Date, attempts: number, leads: number }[]`, `agentId?: string`
   - Renders the monthly grids with color-coded cells
   - Handles hover tooltips (use shadcn Tooltip or custom div)
   - Computes color based on intensity thresholds

2. **`ReportPage` (src/app/report/page.tsx)** (~100 lines)
   - Fetches outreach data for all agents or selected agent
   - Renders agent dropdown
   - Renders `CalendarHeatmap`
   - Computes and displays stats (total, best day, days logged)
   - Handles dropdown changes

3. **Utility: `lib/queries.ts`** additions
   - `getOutreachByDateRange(agentId?: string)` — returns daily aggregates for the heatmap
   - `getBestDay(agentId?: string)` — returns the single day with most attempts
   - `getDaysLogged(agentId?: string)` — returns count of days with ≥1 attempt

---

## Realtime Updates

The heatmap should update live when new outreach is logged:

```ts
// In ReportPage or a custom hook
subscribeToOutreach((newRow) => {
  // Recompute heatmap data
  // Update the affected date's color
});
```

Use the existing `subscribeToOutreach()` pattern from `src/lib/realtime.ts`.

---

## Edge Cases & Validation

- **No data:** If agent has logged nothing, show "No activity logged yet" instead of an empty heatmap
- **Future dates:** Never show dates after today (even if they're within the sprint window)
- **Dates before sprint start:** Show grayed out, not clickable
- **Same-day duplicates:** Aggregates handle them (sum both rows)
- **Mobile responsiveness:** Ensure calendar grid is readable on phone (consider single-month layout on small screens)

---

## Success Criteria

- [ ] Heatmap renders correctly for all agents and individual agents
- [ ] Colors accurately reflect attempt intensity (threshold matching)
- [ ] Dropdown filters work instantly without lag
- [ ] Hover tooltips are clear and don't obscure content
- [ ] Stats below heatmap are computed correctly
- [ ] Realtime updates reflect new logs without page refresh
- [ ] Mobile layout is usable (cells are tappable, legend is readable)
- [ ] "Report" menu item is visible and clickable on all pages

---

## Out of Scope (v1)

- Exporting heatmap as image or PDF
- Comparing two agents side-by-side
- Weekly or monthly aggregation views
- Filtering by date range other than the full sprint

# Mayhem Sprint Tracker — Design Spec

**Date:** May 13, 2026  
**Scope:** Full-stack app for real-time outreach tracking & live leaderboard  
**North Star:** Zero-friction logging on mobile, live competition visible to all agents  

---

## Overview

Mayhem Sprint Tracker is a real-time leaderboard app for 12 agents competing to hit **5 outreach attempts per day (25/week) through June 30, 2026**. The app tracks attempts + leads, displays live rankings, and makes competition visible on personal progress pages and a cumulative team board.

**Key constraints:**
- Honor system, no authentication
- Mobile-first UX (375px+)
- Live leaderboard (Realtime updates, not polling)
- Admin interface for managing agents and correcting entries

---

## Architecture: Realtime-First (Approach B)

### Data Flow
1. **Client logs outreach** → Single or batched insert to `outreach` table via Supabase client
2. **Supabase Realtime** emits INSERT event to all connected clients
3. **All clients** merge the new row(s) into local state, re-compute aggregates
4. **UI updates** reflect new totals, rankings, streaks immediately

**No polling, no timers.** Changes arrive via Realtime or direct user action.

### Why Realtime-First
- Spec explicitly requires "Live leaderboard. Updates instantly across all clients when anyone logs."
- Competitive leaderboard is more engaging when you watch rankings shift in real-time
- Complexity is manageable with careful subscription management (subscribe on mount, unsubscribe on unmount)

---

## Data Model

### Tables

```sql
agents (12 seeded + editable via /admin)
├─ id (text, primary key) — slug, e.g. 'jason-obrien'
├─ name (text) — display name
├─ emoji (text, optional) — avatar emoji
├─ active (boolean) — soft-delete flag
└─ created_at (timestamptz)

outreach (one row per logged activity)
├─ id (uuid, primary key)
├─ agent_id (text, fk→agents)
├─ activity_date (date) — the day of activity
├─ attempts (int, 0–200)
├─ leads (int, 0–50)
├─ note (text, optional)
├─ logged_at (timestamptz)
└─ checks: attempts + leads > 0, both in range

sprint_config (singleton)
├─ id (int, 1)
├─ name (text)
├─ start_date (date) — May 12, 2026
├─ end_date (date) — June 30, 2026
├─ daily_goal (int) — 5
└─ weekly_goal (int) — 25
```

### Row Level Security
- **Anon key:** Read `agents`, `sprint_config`, `outreach`. Insert to `outreach` (with validation).
- **Service role key:** Full access for `/admin` agent management and corrections.
- **No client updates/deletes** on outreach (handled in `/admin` only).

### Realtime Configuration
- Publication `supabase_realtime` subscribed to `outreach` table (INSERT events only)
- All client pages listen to `postgres_changes.INSERT`

---

## State Management & Realtime Pattern

### On Every Live Page (home, leaderboard, board, personal)

```typescript
// Pseudo-code
const [outreachRows, setOutreachRows] = useState<OutreachRow[]>(initialData);

useEffect(() => {
  const unsubscribe = subscribeToOutreach((newRow) => {
    setOutreachRows((prev) => [...prev, newRow]);
    // Re-compute all aggregates from updated rows
    recomputeAggregates(outreachRows);
  });
  return unsubscribe;
}, []);
```

### Aggregate Functions (lib/queries.ts + lib/streaks.ts)

Given all `outreach` rows, compute:

- **Per-agent per-day total:** Sum attempts + leads for (agent, date)
- **Per-agent per-week total:** Filter by week (Mon–Sun), sum attempts
- **Per-agent sprint total:** Sum all attempts + leads
- **Conversion rate:** `leads / attempts` (guard against /0)
- **Streak:** Consecutive days where `attempts ≥ 5`
- **On-pace:** Boolean, true if this week's attempts ≥ 25
- **Leaderboard rank:** Sort by attempts (primary), leads (tiebreaker)

### Confetti Trigger

When local state updates via new Realtime row:
- Check if any agent's current week total just crossed 25 for the first time
- Fire confetti animation once per agent per week (track with a Set to avoid spam)
- No lead-based confetti (no lead goal)

### Timezone Convention
- All date math in `America/Detroit` (use `date-fns-tz`)
- "Today" is defined as the Detroit timezone date, not user-local time
- Date constraints: no logging before `sprint_config.start_date`, no future logging

---

## Pages & Routes

### Home (`/`)

**Purpose:** Primary logging interface. Agent logs today's outreach in <5 seconds, or backdates a week.

**Components:**
- **BrandHeader**
  - "MAYHEM SPRINT · 48 days to go"
  - Team total ticker: "1,247 outreach · 38 leads" (animated on Realtime insert)
- **Agent dropdown** (persisted in localStorage)
  - Remembers last-selected agent
  - Pre-populated on page return
- **Quick-log buttons** (today, one tap each)
  - +1 Outreach (gold, filled)
  - +5 Outreach (gold, outline)
  - +10 Outreach (gold, outline)
  - On tap: insert row, toast confirmation, team total animates
- **LogOutreachDialog**
  - Mode toggle: Single day (default) | Date range
  - **Single day:** Date picker (defaults to today)
  - **Range mode:** From–to date pickers, shows "→ 7 days", live math display
  - Attempts stepper (− [n] +), defaults to 5
  - Leads stepper (− [n] +), defaults to 0
  - Note text field (optional)
  - Validation: dates within sprint window, no future, from ≤ to
  - Submit: Batch insert one row per day in range
  - Post-submit: Close dialog, toast "Logged 35 outreach for Jason across May 6–12 🎯"
- **RecentActivity**
  - Live feed of last 10–15 logged entries
  - Format: "Jason · +5 outreach · 2m ago" / "Selina · +3 outreach, +1 lead · 8m ago"
  - Subscribed to Realtime, updates as events arrive
  - Shows agent emoji + name + activity summary + relative time

**Mobile-first:** Fully usable at 375px. Large tap targets, touch-friendly date picker.

**Optimistic updates:**
- Quick-log buttons: insert locally, toast immediately, reconcile via Realtime
- Team total ticker: increment optimistically, reconcile via Realtime

### Leaderboard (`/leaderboard`)

**Purpose:** Live rankings by time window (today, this week, sprint total).

**Layout:**
- Three tabs: Today | This Week | Sprint Total
- Leaderboard rows, sorted by attempts (desc), then leads (desc)

**Each row:**
```
#1  🎯 Jason O'Brien     32 attempts · 4 leads · 12.5%   🔥 6
#2  ⚡ Selina             28 attempts · 2 leads ·  7.1%   🔥 4
#3  💪 Mike               25 attempts · 5 leads · 20.0%   🔥 5
```

**Components:**
- **LeaderboardRow:** Rank, emoji, name, attempts, leads, conversion%, streak badge
- **ConversionPill:** "12.5%" with green tint if ≥10%, neutral otherwise
- **StreakBadge:** "🔥 6" — consecutive days ≥5 attempts
- **Today's MVP badge:** On the #1 row of the Today tab only

**Realtime updates:**
- Subscribed to `outreach` INSERTs
- On new row: re-compute leaderboard (resort, update aggregates)
- Animated transitions as ranks change

### Board (`/board`)

**Purpose:** Cumulative team view. Show progress toward 3,000 attempts, top 3, days remaining.

**Layout:**
- **Cumulative counter:** Big hero number, animated, tabular-nums font (e.g., "1,247")
  - Formatted with thousands separator
- **Days remaining:** Bold, e.g., "48 days to go" or "2 days left"
- **Top 3 agents:** Ranked list with emoji, name, attempts, conversion%
- **Team thermometer:** Horizontal bar, fills from 0 to 3,000 total attempts
  - Color: gold (#B18F32) when filling
  - Label: "1,247 of 3,000"
- **Projected finish:** Math-based projection (if pace continues, sprint ends on X date)

**Realtime updates:**
- Counter increments on Realtime INSERT
- Top 3 updates as rankings shift
- Thermometer fills as team total increases

### Personal Page (`/me/[agentId]`)

**Purpose:** Individual agent's sprint progress, converted to weekly heatmap + breakdown.

**Layout:**

**Weekly heatmap:**
- 8 rows (one per week of sprint, partial last week)
- Each cell colored by that week's attempts total
  - Green: ≥25 (on pace)
  - Yellow: 10–24
  - Red: <10
- Hover shows exact number ("May 12–18: 32 attempts")

**Week-by-week table:**
- Columns: Week, Attempts, Leads, Conversion%, Streak
- Sortable, latest week first

**Personal stats box:**
- Total sprint attempts
- Total sprint leads
- Overall conversion %
- Best week (highest attempts)
- Current streak

**Recent activity:**
- Last 20 logged entries for this agent
- Format: "May 13 · +5 outreach" / "May 6–12 · +25 outreach"

**Realtime updates:**
- Subscribed to Realtime, re-computes aggregates on new entries

### Admin Page (`/admin`)

**Purpose:** Manage agents, correct logged entries, export data.

**PIN gate:**
- Text input at top of page
- Checks against `ADMIN_PIN` env var (goalby11)
- If incorrect, shows "Incorrect PIN" error
- If correct, grants access to three tabs below

**Tab 1: Manage Agents**
- Table: ID | Name | Emoji | Active | Actions
- Add agent button (modal form: id, name, emoji)
- Edit button per row (inline or modal)
- Delete button per row (soft-delete, sets `active = false`)
- Changes reflected immediately in agent dropdown on home page

**Tab 2: Outreach Log**
- Full table: Agent | Date | Attempts | Leads | Note | Actions
- Sortable by any column (date default, desc)
- Filterable by agent
- Edit button: re-open the LogOutreachDialog to adjust
- Delete button: remove row (with confirmation)
- Useful for correcting fudged entries

**Tab 3: Export**
- Single button: "Export as CSV"
- Downloads file with columns: agent_id, agent_name, activity_date, attempts, leads, note
- Includes all sprint data

---

## Component Hierarchy

```
App (layout.tsx)
├─ BrandHeader (static, reused)
└─ Page-specific content
   ├─ / (home)
   │  ├─ AgentDropdown
   │  ├─ QuickLogButtons
   │  ├─ LogOutreachDialog
   │  │  ├─ DateModeToggle
   │  │  ├─ DatePicker (single or range)
   │  │  ├─ NumberStepper (attempts)
   │  │  ├─ NumberStepper (leads)
   │  │  └─ TextInput (note)
   │  └─ RecentActivity
   │
   ├─ /leaderboard
   │  ├─ TabControl (Today / This Week / Sprint Total)
   │  └─ LeaderboardRow[] (realtime-updated)
   │     ├─ ConversionPill
   │     └─ StreakBadge
   │
   ├─ /board
   │  ├─ CumulativeCounter (animated)
   │  ├─ DaysRemaining
   │  ├─ TopAgents (top 3 ranked list)
   │  ├─ Thermometer
   │  └─ ProjectedFinish
   │
   ├─ /me/[agentId]
   │  ├─ WeeklyHeatmap
   │  ├─ WeekBreakdownTable
   │  ├─ PersonalStats
   │  └─ RecentActivityForAgent
   │
   └─ /admin
      ├─ PINGate
      └─ (if authenticated)
         ├─ AgentManagementTab
         ├─ LogCorrectionTab
         └─ ExportTab
```

---

## Styling & Brand

**Color palette:**
- **Gold:** #B18F32 (primary CTA, accents)
- **Gold bright:** #D4AF54 (hover, active states)
- **Black:** #121212 (page background)
- **Surface:** #1A1A1A (card backgrounds, surfaces)
- **Muted:** #888888 (secondary text, timestamps)
- **Success:** #22C55E (on-pace indicator, green text)
- **Danger:** #EF4444 (off-pace indicator, red text)

**Typography (Poppins, weights 400/500/600/700/800):**
- Hero numbers (team total, cumulative counter): 800, tabular-nums
- Leaderboard counts, personal stats: 700, tabular-nums
- Section headings, agent names: 600
- Buttons, labels: 500, uppercase + tracking-wider for emphasis
- Body, notes, timestamps: 400

**Density:** NFL standings page aesthetic. Tight rows, hairline dividers, right-aligned numbers, minimal white space. Numbers feel like they matter.

**Mobile:** Full usability at 375px width. Large tap targets (44px+), touch-friendly pickers, single-column layout.

---

## Edge Cases & Validation

### Logging
- **Same-day repeats:** Allowed. Multiple rows per (agent, date) sum correctly.
- **Overlapping backfill:** Allowed. May 8 gets two rows if logged twice, aggregates sum.
- **Lead-only entry:** Valid. `attempts=0, leads=1` is allowed (guard constraint: attempts + leads > 0).
- **Empty submission:** Rejected. `attempts=0, leads=0` fails table constraint.
- **Future logging:** Not allowed. Date picker disables future dates.
- **Pre-sprint dates:** Not allowed. Date picker disables dates before sprint start.

### Streaks
- Streak = consecutive days where agent logged ≥5 attempts
- Logging 10 attempts on Monday doesn't count as two consecutive days
- Streak resets if agent logs <5 on any day

### Confetti
- Fires once per agent per week when crossing 25 total attempts
- Does not fire on subsequent logs that keep them ≥25
- No confetti for leads (no lead goal)

### Timezone
- All "today" calculations use America/Detroit timezone
- Date pickers and display use this timezone consistently
- User's local timezone is ignored

---

## Out of Scope (v1)

- Edit UI for logged entries (only /admin)
- Lead detail tracking (counts only)
- Email/SMS notifications
- CRM integration
- Call recording or dialer
- Authentication beyond PIN gate

---

## Success Criteria

1. ✅ Logging under 5 seconds on mobile (home page optimized)
2. ✅ Live leaderboard updates as agents log (Realtime, no polling)
3. ✅ Agent dropdown remembers selection (localStorage)
4. ✅ Backfill dialog works for date ranges (batch insert, live math)
5. ✅ Streak computation is correct (consecutive ≥5 days)
6. ✅ Conversion % displayed and color-coded (green ≥10%)
7. ✅ Admin PIN gate protects agent/entry management
8. ✅ CSV export includes all data for analysis
9. ✅ Brand colors and typography applied throughout (dark + gold aesthetic)
10. ✅ Mobile-first: 375px+ fully usable

---

## Next Steps

- Invoke writing-plans skill to create detailed implementation plan
- Build in order: scaffold → schema → queries → home → leaderboard → board → personal → admin → polish
- Deploy to Vercel with Supabase Marketplace integration

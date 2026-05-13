# Mayhem Sprint Tracker

A real-time outreach tracking and leaderboard app for the PREMIERE Group "Mayhem Sprint" — a team challenge to drive **5 outreach attempts per agent per day (25/week)** through **June 30, 2026**, with bonus credit for leads generated.

Built for 12 agents on the honor system. Ship fast, keep it fun, make the numbers visible.

> **Terminology:** "Outreach" = any contact attempt (call, text, email, DM). "Lead" = a qualified opportunity that resulted from outreach. Both are tracked per agent per day.

---

## Project Goals

- **Zero-friction logging.** An agent should be able to log today's outreach in under 5 seconds on a phone.
- **Easy backfill.** Forgot to log Monday? Log a whole week in one dialog.
- **Track conversion.** Outreach attempts → leads generated, visible on the leaderboard.
- **Live leaderboard.** Updates instantly across all clients when anyone logs.
- **Three views:** personal sprint progress, team leaderboard, and a cumulative "big board" for screen-sharing in team meetings.
- **Honor system, no login.** Name dropdown only — friction kills adoption.
- **Mobile-first.** Most logging happens between calls, on a phone.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Primitives | shadcn/ui (Button, Card, Dialog, Select, Calendar, Input, Toast) |
| Database | Supabase (Postgres + Realtime) via Vercel Marketplace |
| Hosting | Vercel |
| Fonts | Poppins (via `next/font/google`) |
| Icons | lucide-react |
| Dates | date-fns + date-fns-tz |

### Brand Tokens

Match the existing PREMIERE / jobrienhomes.com style:

```ts
// tailwind.config.ts (theme.extend.colors)
colors: {
  brand: {
    gold:         '#B18F32',
    'gold-bright':'#D4AF54',  // hover / accents
    black:        '#121212',
    surface:      '#1A1A1A',  // card backgrounds
    muted:        '#888888',
    success:      '#22C55E',  // on-pace, lead generated
    danger:       '#EF4444',  // off-pace
  }
}
```

The aesthetic is **dark + gold + competitive**. Think NFL standings page, not pastel SaaS dashboard.

---

## Data Model

Single Supabase project. Three tables:

```sql
-- One-time seed of the 12 agents
create table agents (
  id          text primary key,        -- slug, e.g. 'jason-obrien'
  name        text not null,           -- 'Jason O'Brien'
  emoji       text,                    -- optional avatar (🔥 ⚡ 🎯 etc)
  active      boolean default true,
  created_at  timestamptz default now()
);

-- One row per logged activity entry.
-- A single row represents one day's activity for one agent.
-- Backfilling a week = 7 rows inserted from one dialog submission.
create table outreach (
  id             uuid primary key default gen_random_uuid(),
  agent_id       text references agents(id) not null,
  activity_date  date not null,                          -- the day this activity happened
  attempts       int  not null default 0 check (attempts between 0 and 200),
  leads          int  not null default 0 check (leads between 0 and 50),
  note           text,                                   -- optional context
  logged_at      timestamptz default now(),              -- when the row was created
  check (attempts + leads > 0)                           -- no empty entries
);

-- Single-row config table for sprint params (editable without redeploy)
create table sprint_config (
  id            int  primary key default 1,
  name          text not null default 'Mayhem Sprint',
  start_date    date not null,
  end_date      date not null,
  daily_goal    int  not null default 5,
  weekly_goal   int  not null default 25,
  check (id = 1)  -- enforce singleton
);

-- Helpful indexes
create index outreach_agent_date_idx on outreach(agent_id, activity_date desc);
create index outreach_date_idx       on outreach(activity_date desc);
create index outreach_logged_idx     on outreach(logged_at desc);

-- Enable Realtime on outreach
alter publication supabase_realtime add table outreach;
```

**Note on the model:** We allow multiple rows per (agent, activity_date). An agent can submit twice on the same day (morning + afternoon) and queries will sum them. Don't enforce uniqueness; let aggregates handle it.

**Seed data:**

```sql
insert into sprint_config (name, start_date, end_date)
values ('Mayhem Sprint', '2026-05-12', '2026-06-30');

insert into agents (id, name, emoji) values
  ('jason-obrien', 'Jason O''Brien', '🎯'),
  ('agent-2',      'TBD',            '⚡'),
  -- ... fill in remaining 11 agents before launch
;
```

### Row Level Security

Honor system. Anon key with read + insert on `outreach`, read on `agents` and `sprint_config`. No updates or deletes from the client.

```sql
alter table outreach      enable row level security;
alter table agents        enable row level security;
alter table sprint_config enable row level security;

create policy "anon read outreach"   on outreach      for select using (true);
create policy "anon insert outreach" on outreach      for insert with check (
  attempts between 0 and 200
  and leads between 0 and 50
  and (attempts + leads) > 0
);
create policy "anon read agents"     on agents        for select using (true);
create policy "anon read config"     on sprint_config for select using (true);
```

---

## Routes / Pages

| Path | Purpose | Primary user |
|---|---|---|
| `/` | **Log outreach.** Agent dropdown, quick-tap buttons for today, "Log outreach…" opens full dialog for backdating + leads. Recent activity feed below. | Every agent, every day |
| `/leaderboard` | **Live rankings.** Today / This Week / Sprint Total tabs. Shows attempts, leads, and conversion %. Auto-updates via Realtime. | Every agent |
| `/board` | **Big screen.** Cumulative team total, days remaining, projected end-of-sprint, top 3 highlight, total leads. Designed for casting to a TV in the office. | Team meetings |
| `/me/[agentId]` | **Personal sprint page.** Daily streak, calendar heatmap, week-by-week breakdown, leads list. | Each agent reviewing progress |
| `/admin` | Manage agents, view/edit raw log, export CSV. Gated by `ADMIN_PIN`. | Jason |

---

## Logging UX — This Is The App

The home page is the entire reason this exists. Get it right.

### Home page layout

```
┌─────────────────────────────────────┐
│  MAYHEM SPRINT · 48 days to go      │   ← BrandHeader with countdown
│  Team total: 1,247 outreach · 38 leads │
├─────────────────────────────────────┤
│                                     │
│  Who's logging?                     │
│  [ Jason O'Brien 🎯          ▾ ]    │   ← persisted in localStorage
│                                     │
│  Quick log for today:               │
│  [   +1 Outreach   ]                │   ← gold, primary
│  [   +5 Outreach   ]                │   ← gold outline
│  [  +10 Outreach   ]                │   ← gold outline
│                                     │
│  [   Log outreach…   ]              │   ← opens full dialog
│  (different date, leads, or notes)  │
│                                     │
├─────────────────────────────────────┤
│  Recent activity                    │
│  • Selina · +5 outreach · 2m ago    │
│  • Mike · +3 outreach, +1 lead · 8m │
│  • Jason · backfilled 25 · 1h ago   │
└─────────────────────────────────────┘
```

### Quick-log buttons (today, one tap)

- Tap → insert one row: `{ agent_id, activity_date: today, attempts: N, leads: 0 }`
- Toast confirms: "Logged 5 outreach for Jason 🎯"
- Optimistic update on the team total ticker; reconcile via Realtime
- Same agent stays selected (likely the same person logging again)

### "Log outreach…" full dialog

The workhorse for any non-default case: backdating, ranges, leads, notes.

```
┌─────────────────────────────────────┐
│  Log Outreach                    [×]│
├─────────────────────────────────────┤
│                                     │
│  Agent                              │
│  [ Jason O'Brien 🎯           ▾ ]   │
│                                     │
│  Date                               │
│  [● Single day] [○ Date range]      │   ← segmented control
│                                     │
│  ┌─ Single day mode ─────────────┐  │
│  │ [ May 13, 2026     📅 ]        │  │
│  └────────────────────────────────┘  │
│                                     │
│  ┌─ Range mode ──────────────────┐  │
│  │ From: [ May 6  📅 ]            │  │
│  │ To:   [ May 12 📅 ]            │  │
│  │ → 7 days                        │  │
│  └────────────────────────────────┘  │
│                                     │
│  Outreach attempts                  │
│  [ − ]  [   5   ]  [ + ]            │
│  (in range mode: "per day")         │
│                                     │
│  Leads generated  (optional)        │
│  [ − ]  [   0   ]  [ + ]            │
│  (in range mode: "per day")         │
│                                     │
│  Note (optional)                    │
│  [____________________________]     │
│  e.g. "expired listings batch"      │
│                                     │
│  ──────────────────────────────     │
│  Total: 35 outreach across 7 days   │   ← live math when range
│                                     │
│           [ Cancel ]  [ Log 35 ▸ ]  │
└─────────────────────────────────────┘
```

### Dialog behavior

- **Default mode:** Single day = today.
- **Range mode:** Inclusive both ends. From-date must be ≤ to-date, both must fall within the sprint window. Show inline validation, not a toast, when these fail.
- **Date constraints:** Cannot pick dates before `sprint_config.start_date` or after `today` (no future-logging).
- **Per-day semantics:** In range mode, the `attempts` and `leads` values apply to *each* day. Show the math live: `"5 attempts × 7 days = 35 total"`.
- **Submit:** Inserts one row per day in the range (single-day mode = 1 row). Use a single batched `insert([...rows])` call so it's atomic.
- **After submit:** Close dialog, toast "Logged 35 outreach for Jason across May 6–12 🎯", animate the team counter.
- **Validation:** `attempts + leads > 0` (no empty rows). Enforced client-side and by the table check constraint.

### Edge cases

- **Same-day repeats.** Logging today twice creates two rows. Aggregates sum them. Fine.
- **Overlapping backfill.** Logging May 8 today, then May 6–10 tomorrow → May 8 ends up with two rows. Sums correctly.
- **Lead-only entry.** `attempts=0, leads=1, note="callback from last week's batch"` → totally valid.
- **Edits.** Not supported in v1. If an agent fudges a number, they DM Jason and he fixes it in `/admin`. Don't build edit UI for v1.

---

## Realtime Subscription Pattern

Every page that shows live data subscribes to `outreach` inserts:

```ts
// src/lib/realtime.ts
export function subscribeToOutreach(onInsert: (row: OutreachRow) => void) {
  const channel = supabase
    .channel('outreach-feed')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'outreach' },
      (payload) => onInsert(payload.new as OutreachRow)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
```

Used in `RecentActivity`, `LeaderboardRow`s, `CumulativeCounter` on `/board`. Keeps every screen in sync without polling.

---

## Sprint Math (lib/dates.ts)

Sprint runs **May 12, 2026 → June 30, 2026** (50 days).
Per-agent goals: 5 attempts/day, 25 attempts/week. Leads are tracked but not goaled (yet).

Helpful derived values:
- `daysElapsed`, `daysRemaining`
- `currentSprintWeek` (1–8, partial last week)
- `weekStart` / `weekEnd` (Monday–Sunday)
- `teamAttemptsGoalToDate` = `daysElapsed × 5 × 12`
- `teamAttemptsGoalTotal` = `50 × 5 × 12 = 3,000`
- `conversionRate(attempts, leads)` = `leads / attempts` (guard against /0)
- `projectedFinish(currentTotal, daysElapsed)` for `/board`

All date math in `America/Detroit` — use `date-fns-tz`. Don't rely on user-local time for "today."

---

## Leaderboard

Three tabs: **Today**, **This Week**, **Sprint Total**. Each row shows:

```
#1  🎯 Jason O'Brien     32 outreach · 4 leads · 12.5%   🔥 6
#2  ⚡ Selina             28 outreach · 2 leads ·  7.1%   🔥 4
#3  💪 Mike               25 outreach · 5 leads · 20.0%   🔥 5
...
```

- Conversion % gets a subtle color tint: green if ≥ 10%, neutral otherwise.
- Streak (🔥) = consecutive days hitting ≥5 attempts. Computed from `outreach` rows.
- "Today's MVP" badge on the top row of the **Today** tab.
- Sorting: by attempts (primary), leads (tiebreaker).

---

## File Structure

```
mayhem-sprint/
├── CLAUDE.md                       # This file
├── README.md                       # Setup steps for humans
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example
├── .env.local                      # gitignored
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql           # Tables + RLS + seed
│   └── README.md
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, Poppins, brand tokens
│   │   ├── page.tsx                # / — Logger home
│   │   ├── leaderboard/page.tsx
│   │   ├── board/page.tsx
│   │   ├── me/[agentId]/page.tsx
│   │   └── admin/page.tsx
│   ├── components/
│   │   ├── BrandHeader.tsx         # Logo + countdown + team total ticker
│   │   ├── QuickLogButtons.tsx     # +1 / +5 / +10 today buttons
│   │   ├── LogOutreachDialog.tsx   # The full dialog spec'd above
│   │   ├── DateModeToggle.tsx      # Single-day / range segmented control
│   │   ├── NumberStepper.tsx       # − [n] + control
│   │   ├── RecentActivity.tsx      # Live ticker of latest entries
│   │   ├── LeaderboardRow.tsx
│   │   ├── ProgressRing.tsx        # Circular progress to weekly goal
│   │   ├── StreakBadge.tsx         # 🔥 + consecutive ≥5 days
│   │   ├── CumulativeCounter.tsx   # Big animated number for /board
│   │   ├── DaysRemaining.tsx
│   │   └── ConversionPill.tsx      # "12.5%" with color tint
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts           # For /admin
│   │   ├── queries.ts              # All Supabase queries here
│   │   ├── realtime.ts
│   │   ├── dates.ts                # Sprint week math
│   │   ├── streaks.ts              # Streak computation
│   │   └── types.ts                # DB row types
│   └── styles/
│       └── globals.css
└── public/
    ├── favicon.ico
    └── og.png
```

---

## Gamification Hooks (build in this order)

1. **🔥 Streak counter** — consecutive days an agent hit ≥5 attempts.
2. **Today's MVP** — top of the Today leaderboard, with a small badge.
3. **Pace indicator** — green/yellow/red dot showing on-pace for 25/week.
4. **Conversion king** — agent with best attempts→leads % this week. Different from the volume leader.
5. **Confetti** when an agent crosses 25/week or logs their 5th lead.
6. **Team thermometer** on `/board` — fills toward 3,000 attempts.

Ship 1–3 day one. Add 4–6 based on what the team actually responds to.

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-side only, for /admin
ADMIN_PIN=...                         # 6-digit pin for /admin
```

The first two are auto-injected when you provision Supabase via the Vercel Marketplace.

---

## Setup Steps (humans)

1. `npx create-next-app@latest mayhem-sprint --typescript --tailwind --app`
2. `cd mayhem-sprint && npm i @supabase/supabase-js lucide-react date-fns date-fns-tz canvas-confetti`
3. `npx shadcn@latest init` → add `button card dialog select input toast calendar popover`
4. Push to GitHub.
5. On Vercel: Import the repo → **Storage** tab → add **Supabase** Marketplace integration. Env vars auto-injected.
6. In Supabase dashboard: run `supabase/migrations/0001_init.sql`.
7. Edit the seed SQL with real agent names, run it.
8. Deploy. Share the URL in the team Slack.

---

## Conventions

- **Server components by default.** `'use client'` only for interactive components (logger, dialog, leaderboard, board).
- **All Supabase queries in `src/lib/queries.ts`.** No inline queries in components.
- **Tailwind only.** No external CSS beyond `globals.css`.
- **Toast on every successful action.** Silent success feels broken.
- **No login screen, ever.** If you find yourself adding one, stop.

---

## Out of Scope (don't build unless asked)

- Authentication / accounts
- Email or SMS notifications
- Call recording or dialer integration
- CRM sync (Lofty, GHL, etc.)
- Edit / delete UI for logged entries (handled in /admin only)
- Lead detail tracking (name, source, status — just counts for v1)
- Reporting beyond the built-in views

Sprint ends June 30. This app's job is to make 50 days fun and visible.

---

## Post-Sprint

On July 1:
- Lock writes (RLS policy → `insert with check (false)`).
- Export final CSV from `/admin`: total attempts, total leads, conversion %, top streak, MVP.
- Archive the project. Don't delete — the data is the story of the sprint.

To run it again: bump `sprint_config` dates, reopen writes. Everything else carries over.

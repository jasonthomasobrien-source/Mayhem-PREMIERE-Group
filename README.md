# Mayhem Sprint Tracker

A real-time outreach tracking and leaderboard app for the **PREMIERE Group "Mayhem Sprint"** — a team challenge to drive **5 outreach attempts per agent per day (25/week)** through **June 30, 2026**, with bonus credit for leads generated.

Built for 12 agents on the honor system. Ship fast, keep it fun, make the numbers visible.

> **Terminology:** "Outreach" = any contact attempt (call, text, email, DM). "Lead" = a qualified opportunity that resulted from outreach. Both are tracked per agent per day.

---

## Features

- **Zero-friction logging** — Log today's outreach in under 5 seconds on a phone.
- **Easy backfill** — Forgot to log Monday? Log a whole week in one dialog.
- **Track conversion** — Outreach attempts → leads generated, visible on the leaderboard.
- **Live leaderboard** — Updates instantly across all clients when anyone logs (via Supabase Realtime).
- **Three views** — Personal sprint progress, team leaderboard, and a cumulative "big board" for screen-sharing.
- **Honor system, no login** — Name dropdown only — friction kills adoption.
- **Mobile-first** — Most logging happens between calls, on a phone.
- **Dark + gold aesthetic** — Competitive, sharp, designed like an NFL standings page.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | Supabase (Postgres + Realtime) |
| Hosting | Vercel |
| Fonts | Poppins (via `next/font/google`) |
| Icons | lucide-react |
| Dates | date-fns + date-fns-tz |

---

## Local Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd mayhem-sprint
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up or log in.
2. Create a new project (e.g., "mayhem-sprint").
3. Wait for the project to initialize (2–3 minutes).

### 4. Create `.env.local`

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your Supabase credentials:

```bash
# Find these in Supabase > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Find this in Supabase > Settings > API > Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Set an admin PIN (e.g., 6-digit number or phrase)
ADMIN_PIN=goalby11
```

### 5. Run the Supabase migration

1. Go to the Supabase dashboard for your project.
2. Navigate to the **SQL Editor**.
3. Create a **New query**.
4. Copy the entire contents of `supabase/migrations/0001_init.sql` and paste it into the editor.
5. Click **Run** and verify success (green checkmark).

This creates all tables, indexes, RLS policies, and seeds the agent list.

### 6. Edit the agent list

In the Supabase dashboard, go to **Table Editor** → **agents** table and update the 12 rows with real agent names and emojis. Alternatively, you can do this in the app later via `/admin`.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Test all routes

- **`/`** — Home page with agent dropdown, quick-log buttons, and full dialog
- **`/leaderboard`** — Three tabs: Today, This Week, Sprint Total
- **`/board`** — Big screen with cumulative counter, thermometer, top 3
- **`/me/jason-obrien`** — Personal page with heatmap and stats (try with any agent ID)
- **`/admin`** — PIN-gated admin interface (default PIN: `goalby11`)

---

## Deployment to Vercel

### 1. Push to GitHub

Ensure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "feat: initial release"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New** → **Project**.
3. Select your GitHub repository.
4. Click **Import**.

### 3. Add Supabase via Vercel Marketplace

1. In the Vercel project dashboard, go to the **Storage** tab.
2. Click **Browse Marketplace**.
3. Search for **Supabase** and click it.
4. Follow the prompts to:
   - Create a new Supabase project (or connect existing)
   - This auto-injects `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Add remaining environment variables

In Vercel project settings → **Environment Variables**, add:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PIN=goalby11
```

### 5. Run Supabase migration on production

1. Go to your production Supabase project.
2. In the **SQL Editor**, run `supabase/migrations/0001_init.sql` again.
3. Verify tables are created.

### 6. Deploy

Vercel auto-deploys on `git push`. Monitor the deployment at vercel.com/dashboard. Once complete, your app is live.

---

## Environment Variables

| Variable | Purpose | Where to find |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API endpoint | Supabase dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key for client-side queries | Supabase dashboard → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key for admin operations | Supabase dashboard → Settings → API → Service Role Key |
| `ADMIN_PIN` | PIN to gate `/admin` page | You set this (e.g., "goalby11") |

---

## Routes

| Path | Purpose | User |
|---|---|---|
| `/` | Log outreach for today or backfill past days | Every agent |
| `/leaderboard` | Live rankings: Today, This Week, Sprint Total | Every agent |
| `/board` | Big screen: cumulative counter, thermometer, top 3 | Team meetings |
| `/me/[agentId]` | Personal sprint page: heatmap, stats, week breakdown | Each agent |
| `/admin` | PIN-gated: manage agents, fix logs, export CSV | Jason |

---

## How to Log

### Quick log (today only)

1. Select your name from the **Who's logging?** dropdown.
2. Tap **+1 Outreach**, **+5 Outreach**, or **+10 Outreach**.
3. Toast confirms: "Logged 5 outreach for Jason 🎯".

### Full dialog (any date, leads, notes)

1. Select your name.
2. Tap **Log outreach…**.
3. Choose **Single day** or **Date range**.
4. Enter attempts and (optionally) leads.
5. Add a note if helpful (e.g., "expired listings batch").
6. Tap **Log** — one row is inserted per day in the range.

### Examples

- **Today, quick:** Tap **+5 Outreach** → logged instantly.
- **Backfill last week:** Open dialog → **Date range** May 6–12 → **5 attempts per day** → **Log 35**.
- **Lead-only entry:** Open dialog → **1 attempt, 2 leads** (you made 2 conversions from 1 contact) → **Log**.

---

## Admin Interface (`/admin`)

Access `/admin` and enter PIN **`goalby11`** (or your custom PIN).

### Agents tab

- View, add, edit, or deactivate agents.
- Changes take effect immediately.

### Log Corrections tab

- Search and view any logged entry.
- Edit attempts, leads, or notes.
- Delete entries if needed.

### Export tab

- Export all outreach data as CSV.
- Use for analysis, team reports, or sprint retrospectives.

---

## Tips

### Logging late

If you forget to log, just open the dialog, pick the date(s), and backfill. The app handles multi-row inserts atomically.

### Oops, wrong number?

Go to `/admin` → **Log Corrections** → find the entry → edit or delete it. No client-side edit UI in v1, but admin can fix anything.

### Export data

At any time, go to `/admin` → **Export** to download a CSV of all activity. Great for weekly or sprint-end reports.

### Emojis

Each agent has an optional emoji avatar (🔥 ⚡ 💪 etc.). Edit in Supabase `agents` table or `/admin`.

---

## Troubleshooting

### "Can't connect to Supabase"

**Symptom:** Page loads but no data appears; toast says "Failed to fetch."

**Fix:**
1. Check `.env.local` is filled in correctly.
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your project.
3. Restart dev server: `npm run dev`.

### "Admin PIN incorrect"

**Symptom:** Entering PIN on `/admin` doesn't work.

**Fix:**
1. Check `.env.local` → `ADMIN_PIN` matches what you entered.
2. Restart dev server.
3. If Vercel deployment, check Vercel **Environment Variables** include `ADMIN_PIN`.

### "Date range invalid"

**Symptom:** Dialog says "From date must be before To date."

**Fix:**
- Ensure **From** ≤ **To**.
- Both dates must fall between sprint start (`2026-05-12`) and today.
- Can't log future dates.

### "Insert failed" or blank leaderboard

**Symptom:** Clicking **Log** does nothing or shows an error.

**Fix:**
1. Check Supabase RLS policies are enabled:
   - Go to **SQL Editor** → run `ALTER PUBLICATION supabase_realtime ADD TABLE outreach;`
2. Verify `attempts + leads > 0` (can't log empty entries).
3. Check Supabase project is not in read-only mode (Supabase dashboard → Project → Status).

### Mobile responsiveness broken

**Symptom:** Page has horizontal scroll on phone.

**Fix:**
1. Clear browser cache.
2. Check `tailwind.config.ts` includes responsive utilities.
3. Test at 375px width in Chrome DevTools.

### "Route not found" (404 on `/board`)

**Symptom:** `/board` gives 404 error.

**Fix:**
1. Ensure build succeeded: `npm run build` (no errors).
2. Restart dev server: `npm run dev`.
3. Check `src/app/board/page.tsx` exists.

---

## Architecture

### Data Model

Three tables in Supabase:

- **`agents`** — 12 team members (id, name, emoji, active status)
- **`outreach`** — All logged activity (agent_id, activity_date, attempts, leads, note, logged_at)
- **`sprint_config`** — Single-row config (start_date, end_date, daily_goal, weekly_goal)

### Realtime Updates

All pages subscribe to `outreach` inserts via Supabase Realtime. When one agent logs, all clients update instantly.

### RLS (Row Level Security)

Honor system: anon key can read all data and insert (with validation), but no updates or deletes from client. Admins fix errors via `/admin` (requires service role key, gated by PIN).

### Date Handling

All dates are in **America/Detroit** timezone using `date-fns-tz`. "Today" is computed server-side to avoid user-local time skew.

---

## Sprint Timeline

- **Sprint Start:** May 12, 2026
- **Sprint End:** June 30, 2026
- **Duration:** 50 days
- **Per-agent goal:** 5 attempts/day, 25/week
- **Team goal:** 3,000 total attempts (50 days × 5 attempts × 12 agents)

---

## Post-Sprint

On July 1, 2026:

1. Lock writes: Update RLS to `INSERT with check (false)`.
2. Export final CSV from `/admin`.
3. Archive the project (keep the data — it's the story).

To run another sprint:
- Update `sprint_config` table (new dates).
- Update `agents` table (edit names/emojis as needed).
- Re-enable writes.
- Everything else carries over.

---

## Contributing

This is a closed sprint app for PREMIERE Group. No external contributions, but feel free to fork and adapt for your own team challenge.

---

## License

Proprietary — PREMIERE Group internal use only.

---

## Support

Questions or issues? Contact Jason O'Brien (jason@joissellingwestmichigan.com).
# Mayhem-PREMIERE-Group

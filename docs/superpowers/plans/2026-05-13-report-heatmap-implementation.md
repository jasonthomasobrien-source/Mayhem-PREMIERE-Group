# Report Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/report` page with a calendar heatmap showing daily outreach activity (all agents or filtered to one), plus add "Report" to the navigation menu.

**Architecture:** The Report page fetches outreach data on load, aggregates daily totals (team-wide or single-agent), and renders a calendar heatmap component that recomputes when the agent dropdown changes. Realtime updates trigger re-fetches of the heatmap data. The component uses Tailwind's yellow palette (`bg-yellow-900` to `bg-yellow-600`) to match brand gold and intensity-code attempts per day.

**Tech Stack:** Next.js 15 (client component), TypeScript, Tailwind CSS, shadcn Select, date-fns utilities, Supabase Realtime

---

## File Structure

**Files to create:**
- `src/components/CalendarHeatmap.tsx` — Renders monthly calendar grid with color-coded cells
- `src/app/report/page.tsx` — Report page (fetches data, manages dropdown, displays heatmap + stats)

**Files to modify:**
- `src/components/Navigation.tsx` — Add "Report" link to menu
- `src/lib/queries.ts` — Add `getOutreachByDateRange(agentId?: string)` for heatmap data

---

## Task 1: Add Report Navigation Link

**Files:**
- Modify: `src/components/Navigation.tsx:45-62` (desktop) and `76-97` (mobile)

- [ ] **Step 1: Open Navigation.tsx and locate the link for /leaderboard**

At line 54–61 you'll find the desktop leaderboard link. After that link, add a new link for `/report`.

- [ ] **Step 2: Add Report link to desktop menu**

```tsx
<Link
  href="/report"
  className={`text-sm font-medium transition-colors ${
    isActive('/report') ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-white hover:text-brand-gold-bright'
  }`}
>
  Report
</Link>
```

Insert this after the Leaderboard link (after line 61, before the closing `</div>`).

- [ ] **Step 3: Add Report link to mobile menu**

At line 88–96, you'll find the mobile leaderboard link. After that link, add the same Report link:

```tsx
<Link
  href="/report"
  onClick={closeMenu}
  className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
    isActive('/report') ? 'bg-brand-gold text-brand-black' : 'text-white hover:bg-brand-black'
  }`}
>
  Report
</Link>
```

Insert this after the mobile Leaderboard link (after line 96, before the closing `</div>`).

- [ ] **Step 4: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat: add Report link to navigation menu"
```

---

## Task 2: Add Query for Daily Outreach Aggregates

**Files:**
- Modify: `src/lib/queries.ts` (add new export at the end)

- [ ] **Step 1: Open queries.ts and scroll to the end**

- [ ] **Step 2: Add new query function for daily aggregates**

Add this function after the last export (after line 204):

```ts
// Get daily outreach totals (team-wide or by agent)
export async function getOutreachDailyAggregates(
  agentId?: string
): Promise<{ date: string; attempts: number; leads: number }[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('outreach')
    .select('activity_date, attempts, leads')

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { data, error } = await query.order('activity_date', { ascending: true })

  if (error) {
    console.error('Error fetching daily aggregates:', error)
    return []
  }

  // Aggregate by date
  const aggregated: Record<string, { attempts: number; leads: number }> = {}
  ;(data || []).forEach((row) => {
    if (!aggregated[row.activity_date]) {
      aggregated[row.activity_date] = { attempts: 0, leads: 0 }
    }
    aggregated[row.activity_date].attempts += row.attempts
    aggregated[row.activity_date].leads += row.leads
  })

  return Object.entries(aggregated).map(([date, { attempts, leads }]) => ({
    date,
    attempts,
    leads,
  }))
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: add getOutreachDailyAggregates query for heatmap data"
```

---

## Task 3: Create CalendarHeatmap Component

**Files:**
- Create: `src/components/CalendarHeatmap.tsx`

- [ ] **Step 1: Create the component file**

Create a new file at `src/components/CalendarHeatmap.tsx` with the following content:

```tsx
'use client'

import { useMemo } from 'react'
import { eachDayOfInterval, parseISO, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

interface HeatmapData {
  date: string // ISO format YYYY-MM-DD
  attempts: number
  leads: number
}

interface CalendarHeatmapProps {
  data: HeatmapData[]
  sprintStart: Date
  sprintEnd: Date
  agentName?: string // optional, for tooltip context
}

export function CalendarHeatmap({ data, sprintStart, sprintEnd, agentName }: CalendarHeatmapProps) {
  // Create a map of dates to data for fast lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, HeatmapData>()
    data.forEach((d) => map.set(d.date, d))
    return map
  }, [data])

  // Get color based on attempts (intensity)
  const getCellColor = (attempts: number, isOutOfSprint: boolean): string => {
    if (isOutOfSprint) return 'bg-gray-900'
    if (attempts === 0) return 'bg-gray-900'
    if (attempts >= 26) return 'bg-yellow-600' // Dark gold (brand gold)
    if (attempts >= 11) return 'bg-yellow-700' // Medium gold
    if (attempts >= 1) return 'bg-yellow-900' // Light gold
    return 'bg-gray-900'
  }

  // Determine if date is within sprint
  const isWithinSprint = (date: Date): boolean => {
    return date >= sprintStart && date <= sprintEnd
  }

  // Generate calendar months (May, June)
  const months = useMemo(() => {
    const result = []
    const current = new Date(sprintStart)

    while (current <= sprintEnd) {
      const monthStart = startOfMonth(current)
      const monthEnd = endOfMonth(current)
      const calendarStart = startOfWeek(monthStart)
      const calendarEnd = endOfWeek(monthEnd)

      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

      result.push({
        month: format(monthStart, 'MMMM yyyy'),
        days,
      })

      current.setMonth(current.getMonth() + 1)
    }

    return result
  }, [sprintStart, sprintEnd])

  // Compute stats
  const stats = useMemo(() => {
    const validData = data.filter((d) => {
      const date = parseISO(d.date)
      return isWithinSprint(date)
    })

    const totalAttempts = validData.reduce((sum, d) => sum + d.attempts, 0)
    const daysLogged = validData.filter((d) => d.attempts > 0).length

    let bestDay = { date: '', attempts: 0 }
    validData.forEach((d) => {
      if (d.attempts > bestDay.attempts) {
        bestDay = { date: d.date, attempts: d.attempts }
      }
    })

    return { totalAttempts, daysLogged, bestDay }
  }, [data, sprintStart, sprintEnd])

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-brand-muted text-sm">No activity logged yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <div className="space-y-8">
        {months.map((month) => (
          <div key={month.month} className="space-y-3">
            <h3 className="text-sm font-semibold text-white">{month.month}</h3>

            {/* Week grid */}
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs text-brand-muted font-semibold h-6 flex items-center justify-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {month.days.map((day, idx) => {
                  const dateISO = format(day, 'yyyy-MM-dd')
                  const dayData = dataMap.get(dateISO)
                  const attempts = dayData?.attempts ?? 0
                  const leads = dayData?.leads ?? 0
                  const isOutOfSprint = !isWithinSprint(day)
                  const bgColor = getCellColor(attempts, isOutOfSprint)
                  const isDifferentMonth = day.getMonth() !== months[0].days[0].getMonth()

                  return (
                    <div
                      key={idx}
                      className={`
                        relative
                        h-9 w-9
                        flex items-center justify-center
                        rounded
                        border border-gray-800
                        text-xs font-semibold
                        transition-all
                        hover:ring-2 hover:ring-brand-gold
                        cursor-default
                        group
                        ${bgColor}
                        ${isDifferentMonth ? 'opacity-40' : 'text-white'}
                      `}
                      title={`${format(day, 'MMM dd')} · ${attempts} attempts${leads > 0 ? ` · ${leads} lead${leads > 1 ? 's' : ''}` : ''}`}
                    >
                      {format(day, 'd')}

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-700 z-10">
                        {format(day, 'MMM dd')} · {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
                        {leads > 0 && ` · ${leads} ${leads === 1 ? 'lead' : 'leads'}`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-brand-muted pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-900 border border-gray-700" />
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-900" />
          <span>1–10</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-700" />
          <span>11–25</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-600" />
          <span>26+</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-3 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-brand-muted text-xs mb-1">Total attempts</p>
            <p className="text-xl font-bold text-white">{stats.totalAttempts}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs mb-1">Best day</p>
            <p className="text-xl font-bold text-white">{stats.bestDay.attempts}</p>
            <p className="text-xs text-brand-muted">{stats.bestDay.date ? format(parseISO(stats.bestDay.date), 'MMM d') : '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs mb-1">Days logged</p>
            <p className="text-xl font-bold text-white">{stats.daysLogged}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CalendarHeatmap.tsx
git commit -m "feat: add CalendarHeatmap component for sprint visualization"
```

---

## Task 4: Create Report Page

**Files:**
- Create: `src/app/report/page.tsx`

- [ ] **Step 1: Create report directory**

```bash
mkdir -p src/app/report
```

- [ ] **Step 2: Create the report page component**

Create a new file at `src/app/report/page.tsx` with the following content:

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { CalendarHeatmap } from '@/components/CalendarHeatmap'
import { getOutreachDailyAggregates } from '@/lib/queries'
import { fetchAgents } from '@/lib/queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { parseISO } from 'date-fns'
import { Agent } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface HeatmapData {
  date: string
  attempts: number
  leads: number
}

const SPRINT_START = new Date('2026-05-12')
const SPRINT_END = new Date('2026-06-30')

export default function ReportPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Fetch agents on mount
  useEffect(() => {
    async function loadAgents() {
      const agentList = await fetchAgents()
      setAgents(agentList)
    }

    loadAgents()
  }, [])

  // Fetch heatmap data when selectedAgentId changes
  useEffect(() => {
    async function loadHeatmapData() {
      setLoading(true)
      const agentId = selectedAgentId === 'all' ? undefined : selectedAgentId
      const data = await getOutreachDailyAggregates(agentId)
      setHeatmapData(data)
      setLoading(false)
    }

    loadHeatmapData()
  }, [selectedAgentId])

  // Subscribe to realtime updates and refetch when new data arrives
  useEffect(() => {
    const unsubscribe = subscribeToOutreach(() => {
      // Refetch heatmap data when new outreach is logged
      const agentId = selectedAgentId === 'all' ? undefined : selectedAgentId
      getOutreachDailyAggregates(agentId).then(setHeatmapData)
    })

    return () => unsubscribe()
  }, [selectedAgentId])

  const selectedAgentName =
    selectedAgentId === 'all'
      ? 'All Agents'
      : agents.find((a) => a.id === selectedAgentId)?.name || 'Unknown'

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <BrandHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Report</h1>
            <p className="text-sm text-brand-muted">
              Sprint activity heatmap by day
            </p>
          </div>

          {/* Agent Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">View:</label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="w-full max-w-xs bg-brand-surface border-brand-surface text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-brand-surface border-brand-surface text-white">
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.emoji} {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Heatmap */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-brand-muted">Loading...</p>
            </div>
          ) : (
            <div className="bg-brand-surface rounded-lg p-6 border border-gray-800">
              <CalendarHeatmap
                data={heatmapData}
                sprintStart={SPRINT_START}
                sprintEnd={SPRINT_END}
                agentName={selectedAgentName}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verify shadcn Select exists**

Run:
```bash
ls src/components/ui/select.tsx
```

If it doesn't exist, install it:
```bash
npx shadcn-ui@latest add select
```

- [ ] **Step 4: Commit**

```bash
git add src/app/report/page.tsx
git commit -m "feat: add report page with calendar heatmap"
```

---

## Task 5: Test the Report Page

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to /report**

Open http://localhost:3000/report in your browser.

- [ ] **Step 3: Verify the page loads**

- [ ] **Step 4: Test agent dropdown**

- Change the dropdown from "All Agents" to individual agents
- Heatmap should update instantly

- [ ] **Step 5: Verify heatmap rendering**

- Calendar should show months (May and June 2026)
- Days outside sprint should be slightly grayed out
- Days with activity should be color-coded (yellow/gold)
- Hover should show tooltip with date and attempt/lead counts

- [ ] **Step 6: Verify stats section**

Below the heatmap, you should see:
- Total attempts (sum across all logged days)
- Best day (highest single day)
- Days logged (count of days with ≥1 attempt)

- [ ] **Step 7: Verify navigation link**

"Report" should appear in both desktop and mobile menus and be active when on `/report`.

- [ ] **Step 8: Test realtime updates (optional but recommended)**

- Open `/` (home logger) in another tab
- Log some activity
- Switch back to `/report` — heatmap should update without page refresh

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "test: report page functional and styled correctly"
```

---

## Rollout Checklist

- [ ] All navigation links are in place
- [ ] Agent dropdown works and persists selection across page reloads? (No, by design — defaults to "All")
- [ ] Heatmap displays all days in May and June
- [ ] Color intensity matches spec (0=gray, 1-10=light gold, 11-25=medium, 26+=dark)
- [ ] Hover tooltips appear and show correct data
- [ ] Stats below heatmap are accurate
- [ ] Realtime updates work (optional for v1 but recommended)
- [ ] Mobile layout is readable (cells are at least 36px × 36px)
- [ ] No console errors

---

## Success Criteria

✅ Report page is live at `/report`  
✅ Calendar heatmap displays daily aggregates for all agents and individual agents  
✅ Agent dropdown filters instantly  
✅ Stats (total, best day, days logged) are computed correctly  
✅ "Report" menu item is visible and active  
✅ Realtime updates refresh heatmap without page reload  
✅ Mobile layout is usable

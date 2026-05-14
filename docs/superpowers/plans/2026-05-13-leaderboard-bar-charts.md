# Leaderboard Bar Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current tabular leaderboard with horizontal bar charts showing agent rankings by outreach attempts and leads generated.

**Architecture:** Refactor `LeaderboardTabs` component to use two new chart components (`OutreachBarChart` and `LeadsBarChart`). Each chart renders agents ranked by their metric (highest first), with bars proportional to actual values. Outreach chart includes a target line at 175 (35 days × 5/day). Leads chart is a pure ranking with no target. Both charts respect the active tab (Today/Week/Sprint) and update live via Realtime.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui, Realtime subscriptions

---

## Task 1: Create OutreachBarChart Component

**Files:**
- Create: `src/components/OutreachBarChart.tsx`

- [ ] **Step 1: Create the component file with structure**

```typescript
'use client'

import { Agent, OutreachRow, LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { buildLeaderboard } from '@/lib/aggregates'

interface OutreachBarChartProps {
  agents: Agent[]
  rows: OutreachRow[]
  activeTab: 'today' | 'week' | 'sprint'
  sprintStartDate: string
}

export function OutreachBarChart({
  agents,
  rows,
  activeTab,
  sprintStartDate,
}: OutreachBarChartProps) {
  // Build leaderboard data
  const leaderboard = buildLeaderboard(agents, rows, activeTab, sprintStartDate)

  // Calculate target based on active tab
  const getTarget = (tab: 'today' | 'week' | 'sprint'): number => {
    if (tab === 'today') return 5
    if (tab === 'week') return 25
    return 175 // 35 days × 5/day for sprint
  }

  const target = getTarget(activeTab)

  // Find max attempts to scale bars (use target as minimum max)
  const maxAttempts = Math.max(
    target,
    Math.max(...leaderboard.map((row) => row.sprintAttempts), 0)
  )

  // Get attempts for current tab
  const getAttempts = (row: LeaderboardRowType): number => {
    if (activeTab === 'today') return row.todayAttempts
    if (activeTab === 'week') return row.weekAttempts
    return row.sprintAttempts
  }

  return (
    <div className="space-y-6">
      <div className="chart-title text-18 font-600 text-brand-gold mb-6">
        Outreach Attempts
      </div>

      <div className="space-y-4">
        {leaderboard.map((row) => {
          const attempts = getAttempts(row)
          const barWidthPercent = (attempts / maxAttempts) * 100
          const targetWidthPercent = (target / maxAttempts) * 100
          const isBeyondTarget = attempts > target

          return (
            <div key={row.agent.id} className="flex items-center gap-4">
              {/* Rank */}
              <span
                className={`font-bold min-w-8 text-right text-sm ${
                  row.rank === 1 ? 'text-brand-gold' : 'text-brand-muted'
                }`}
              >
                #{row.rank}
              </span>

              {/* Agent Info */}
              <div className="min-w-36 flex items-center gap-2">
                <span className="text-lg">{row.agent.emoji || '👤'}</span>
                <span className="font-medium text-sm truncate">{row.agent.name}</span>
              </div>

              {/* Bar Container */}
              <div className="flex-1 relative h-8 bg-brand-surface rounded border border-brand-muted/20">
                {/* Target line */}
                {activeTab !== 'today' && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-brand-gold/40 z-10"
                    style={{ left: `${targetWidthPercent}%` }}
                  />
                )}

                {/* Bar */}
                <div
                  className={`h-full rounded flex items-center justify-end pr-3 transition-all ${
                    isBeyondTarget
                      ? 'bg-gradient-to-r from-brand-success to-brand-success/80'
                      : 'bg-gradient-to-r from-brand-gold-bright to-brand-gold'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                >
                  <span className="text-white text-sm font-600 whitespace-nowrap">
                    {attempts}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify component exports and imports are correct**

Check that the file has no syntax errors by looking at the import statements. The component should import `Agent`, `OutreachRow`, `LeaderboardRow as LeaderboardRowType` from `@/lib/types` and `buildLeaderboard` from `@/lib/aggregates`.

---

## Task 2: Create LeadsBarChart Component

**Files:**
- Create: `src/components/LeadsBarChart.tsx`

- [ ] **Step 1: Create the component file with structure**

```typescript
'use client'

import { Agent, OutreachRow, LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { buildLeaderboard } from '@/lib/aggregates'

interface LeadsBarChartProps {
  agents: Agent[]
  rows: OutreachRow[]
  activeTab: 'today' | 'week' | 'sprint'
  sprintStartDate: string
}

export function LeadsBarChart({
  agents,
  rows,
  activeTab,
  sprintStartDate,
}: LeadsBarChartProps) {
  // Build leaderboard data
  const leaderboard = buildLeaderboard(agents, rows, activeTab, sprintStartDate)

  // Get leads for current tab
  const getLeads = (row: LeaderboardRowType): number => {
    if (activeTab === 'today') return row.todayLeads
    if (activeTab === 'week') return row.weekLeads
    return row.sprintLeads
  }

  // Find max leads to scale bars
  const maxLeads = Math.max(...leaderboard.map((row) => getLeads(row)), 1)

  return (
    <div className="space-y-6">
      <div className="chart-title text-18 font-600 text-brand-gold mb-6">
        Leads Generated
      </div>

      <div className="space-y-4">
        {leaderboard.map((row) => {
          const leads = getLeads(row)
          const barWidthPercent = (leads / maxLeads) * 100

          return (
            <div key={row.agent.id} className="flex items-center gap-4">
              {/* Rank */}
              <span
                className={`font-bold min-w-8 text-right text-sm ${
                  row.rank === 1 ? 'text-brand-gold' : 'text-brand-muted'
                }`}
              >
                #{row.rank}
              </span>

              {/* Agent Info */}
              <div className="min-w-36 flex items-center gap-2">
                <span className="text-lg">{row.agent.emoji || '👤'}</span>
                <span className="font-medium text-sm truncate">{row.agent.name}</span>
              </div>

              {/* Bar Container */}
              <div className="flex-1 relative h-8 bg-brand-surface rounded border border-brand-muted/20">
                {/* Bar */}
                <div
                  className="h-full rounded flex items-center justify-end pr-3 transition-all bg-gradient-to-r from-brand-gold-bright to-brand-gold"
                  style={{ width: `${barWidthPercent}%` }}
                >
                  <span className="text-white text-sm font-600 whitespace-nowrap">
                    {leads}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify component structure**

Check that the file compiles with no errors. The component should match the structure of `OutreachBarChart` but without the target line logic.

---

## Task 3: Update LeaderboardTabs to Use Bar Charts

**Files:**
- Modify: `src/components/LeaderboardTabs.tsx`

- [ ] **Step 1: Update imports to include new chart components**

At the top of the file, add imports for the two new chart components:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { fetchAgents, fetchOutreach } from '@/lib/client-queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { Agent, OutreachRow } from '@/lib/types'
import { LoadingSpinner } from './LoadingSpinner'
import { OutreachBarChart } from './OutreachBarChart'
import { LeadsBarChart } from './LeadsBarChart'
```

Remove the old imports for `LeaderboardRow`, `BadgePill`, `buildLeaderboard`, and the badge logic functions (`getStreak`, etc.).

- [ ] **Step 2: Simplify state to remove unused data**

Replace the old state with simplified state that only tracks agents, outreach rows, loading, and active tab:

```typescript
export function LeaderboardTabs() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [rows, setRows] = useState<OutreachRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'sprint'>('today')
```

- [ ] **Step 3: Keep the existing data loading and realtime subscription logic**

The `useEffect` for loading data and the Realtime subscription should remain exactly as they are. Do not modify them.

- [ ] **Step 4: Replace the leaderboard rendering with new chart components**

Replace the entire return statement with:

```typescript
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-2 border-b border-brand-muted/20">
        {(['today', 'week', 'sprint'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-brand-gold text-brand-gold'
                : 'text-brand-muted hover:text-white border-b-2 border-transparent'
            }`}
          >
            {tab === 'today' && 'Today'}
            {tab === 'week' && 'This Week'}
            {tab === 'sprint' && 'Sprint Total'}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-12">
        <OutreachBarChart
          agents={agents}
          rows={rows}
          activeTab={activeTab}
          sprintStartDate="2026-05-12"
        />
        <LeadsBarChart
          agents={agents}
          rows={rows}
          activeTab={activeTab}
          sprintStartDate="2026-05-12"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify the component compiles**

Check that there are no TypeScript errors in the file and that all imports resolve correctly.

---

## Task 4: Update globals.css to Remove Old Leaderboard Styles

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Remove old LeaderboardRow styles if they exist**

Search for any `.leaderboard-row`, `.badge-pill`, or similar classes that were specific to the old leaderboard implementation. Delete them if found. Keep any global styles that might be used elsewhere.

- [ ] **Step 2: Verify no broken references**

Run the dev server and check the leaderboard page to ensure no console errors about missing styles.

---

## Task 5: Test Bar Chart Rendering

**Files:**
- No new files (integration test)

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/jasonobrien/Documents/MayHem\ Tracker
npm run dev
```

Expected: Server starts on `http://localhost:3000`

- [ ] **Step 2: Navigate to the leaderboard page**

Open `http://localhost:3000/leaderboard` in your browser.

- [ ] **Step 3: Verify Today tab renders correctly**

Check:
- Two charts are visible (Outreach and Leads)
- Agents are ranked top-to-bottom by their metric
- Bars are proportional to values
- Numbers display at the end of each bar
- No console errors

- [ ] **Step 4: Click through tabs**

Switch between **Today**, **This Week**, and **Sprint Total**. Verify:
- Rankings change based on the active metric
- Bars resize appropriately
- On "This Week" and "Sprint Total", the target line appears on the Outreach chart
- Leads chart has no target line on any tab

- [ ] **Step 5: Test real-time updates**

Open the app in two browser windows side-by-side:
1. One on `/leaderboard`
2. One on `/` (home page)

Log some outreach in the home window. Verify:
- The bar charts update live in the leaderboard window
- Rankings change if needed
- No flicker or layout shift

- [ ] **Step 6: Test on mobile**

Resize browser to mobile width (375px). Verify:
- Bars scale properly
- Agent names don't overflow
- Numbers stay readable
- Rank badges are visible

---

## Task 6: Commit Changes

**Files:**
- `src/components/OutreachBarChart.tsx` (new)
- `src/components/LeadsBarChart.tsx` (new)
- `src/components/LeaderboardTabs.tsx` (modified)

- [ ] **Step 1: Stage all changes**

```bash
git add src/components/OutreachBarChart.tsx src/components/LeadsBarChart.tsx src/components/LeaderboardTabs.tsx
```

- [ ] **Step 2: Commit with descriptive message**

```bash
git commit -m "feat: replace tabular leaderboard with horizontal bar charts

- Add OutreachBarChart component showing agents ranked by attempts
- Add LeadsBarChart component showing agents ranked by leads
- Update LeaderboardTabs to render both charts
- Outreach chart includes target line (175 for sprint, 25 for week, 5 for today)
- Both charts update live via Realtime subscription
- Charts respect Today/Week/Sprint tabs"
```

---

## Summary

This plan creates two new bar chart components and refactors the leaderboard to use them. The charts are fully responsive, support real-time updates, and provide a cleaner visual ranking of agents. The implementation follows existing patterns in the codebase and uses Tailwind for styling.

**Next:** Start with Task 1 to create the OutreachBarChart component.

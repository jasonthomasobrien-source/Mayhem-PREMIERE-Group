# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Mayhem Sprint app with a refined aesthetic, unified logging modal, and rich leaderboard badges.

**Architecture:** Build new components (LogActivityModal, DateModeToggle, NumberStepper, BadgePill) alongside updated badge logic (streak, pace, MVP, conversion king). Replace quick-tap buttons with a single modal that handles both same-day and range-based logging. Update LeaderboardRow to show inline badges.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase Realtime

---

## File Structure

**New Components:**
- `src/components/LogActivityModal.tsx` — modal with mode toggle, date/range pickers, number steppers, validation
- `src/components/DateModeToggle.tsx` — segmented control (today vs range)
- `src/components/NumberStepper.tsx` — − / input / + component
- `src/components/BadgePill.tsx` — badge renderer (on-pace, MVP, conversion king, streak)

**Updated Components:**
- `src/components/LeaderboardRow.tsx` — add inline badges section
- `src/app/page.tsx` — replace QuickLogButtons with LogActivityModal, clean up UI
- `src/components/LeaderboardTabs.tsx` — integrate new badges into buildLeaderboard

**Utilities & Logic:**
- `src/lib/badge-logic.ts` — new file for badge computation (streak, pace, MVP, conversion king)
- `src/lib/date-utils.ts` — helper for sprint week, pace calculations (may already exist)
- `src/lib/range-distribution.ts` — algorithm to distribute range attempts/leads evenly

**Remove:**
- `src/components/QuickLogButtons.tsx` — delete entirely

---

## Tasks

### Task 1: Create NumberStepper Component

**Files:**
- Create: `src/components/NumberStepper.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  disabled?: boolean
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 200,
  label,
  disabled = false,
}: NumberStepperProps) {
  const decrement = () => {
    const newValue = Math.max(min, value - 1)
    onChange(newValue)
  }

  const increment = () => {
    const newValue = Math.min(max, value + 1)
    onChange(newValue)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    if (input === '') {
      onChange(min)
      return
    }
    const num = parseInt(input, 10)
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)))
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={decrement}
        disabled={disabled || value <= min}
        className="h-9 w-9 p-0 border-brand-gold text-brand-gold hover:bg-brand-surface"
      >
        −
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInput}
        disabled={disabled}
        min={min}
        max={max}
        className="h-9 w-16 text-center border-brand-muted/30 bg-brand-surface text-white"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={increment}
        disabled={disabled || value >= max}
        className="h-9 w-9 p-0 border-brand-gold text-brand-gold hover:bg-brand-surface"
      >
        +
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Test the component manually in storybook or browser**

Open the app and create a simple test page with the NumberStepper to ensure increment/decrement/input work correctly.

- [ ] **Step 3: Commit**

```bash
git add src/components/NumberStepper.tsx
git commit -m "feat: add NumberStepper component for modal input"
```

---

### Task 2: Create DateModeToggle Component

**Files:**
- Create: `src/components/DateModeToggle.tsx`

- [ ] **Step 1: Write the component**

```tsx
interface DateModeToggleProps {
  mode: 'today' | 'range'
  onChange: (mode: 'today' | 'range') => void
}

export function DateModeToggle({ mode, onChange }: DateModeToggleProps) {
  return (
    <div className="flex gap-2 rounded-lg bg-brand-surface p-1">
      <button
        onClick={() => onChange('today')}
        className={`flex-1 rounded px-4 py-2 font-semibold text-sm transition-colors ${
          mode === 'today'
            ? 'bg-brand-gold-bright text-brand-black'
            : 'bg-transparent text-brand-muted hover:text-white'
        }`}
      >
        Log Today's Activity
      </button>
      <button
        onClick={() => onChange('range')}
        className={`flex-1 rounded px-4 py-2 font-semibold text-sm transition-colors ${
          mode === 'range'
            ? 'bg-brand-gold-bright text-brand-black'
            : 'bg-transparent text-brand-muted hover:text-white'
        }`}
      >
        Log for a Range
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DateModeToggle.tsx
git commit -m "feat: add DateModeToggle segmented control"
```

---

### Task 3: Create BadgePill Component

**Files:**
- Create: `src/components/BadgePill.tsx`

- [ ] **Step 1: Write the component**

```tsx
interface BadgePillProps {
  type: 'streak' | 'on-pace' | 'off-pace' | 'mvp' | 'conversion'
  value?: string | number
  icon?: string
}

export function BadgePill({ type, value, icon }: BadgePillProps) {
  const styles: Record<string, string> = {
    streak: 'bg-brand-gold/20 text-brand-gold',
    'on-pace': 'bg-brand-success/20 text-brand-success',
    'off-pace': 'bg-brand-danger/20 text-brand-danger',
    mvp: 'bg-brand-gold/20 text-brand-gold',
    conversion: 'bg-brand-gold/20 text-brand-gold',
  }

  const labels: Record<string, string> = {
    streak: '',
    'on-pace': 'On pace',
    'off-pace': 'Off pace',
    mvp: '👑 MVP',
    conversion: '👑 Conversion',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${styles[type]}`}>
      {icon && <span>{icon}</span>}
      {type === 'streak' && value ? (
        <>
          <span>🔥</span>
          <span>{value}</span>
        </>
      ) : (
        labels[type]
      )}
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BadgePill.tsx
git commit -m "feat: add BadgePill component for leaderboard badges"
```

---

### Task 4: Create Range Distribution Utility

**Files:**
- Create: `src/lib/range-distribution.ts`

- [ ] **Step 1: Write the utility function**

```ts
/**
 * Distribute total attempts and leads evenly across a date range.
 * Remainder is assigned to the last day(s).
 *
 * Example: 35 attempts across 7 days = [5, 5, 5, 5, 5, 5, 5]
 * Example: 36 attempts across 7 days = [5, 5, 5, 5, 5, 5, 6]
 */
export function distributeAcrossDays(
  totalAttempts: number,
  totalLeads: number,
  numDays: number
): Array<{ attempts: number; leads: number }> {
  const perDay = Math.floor(totalAttempts / numDays)
  const attemptsRemainder = totalAttempts % numDays

  const leadsPerDay = Math.floor(totalLeads / numDays)
  const leadsRemainder = totalLeads % numDays

  const result: Array<{ attempts: number; leads: number }> = []

  for (let i = 0; i < numDays; i++) {
    const isLastDay = i === numDays - 1
    const attempts = perDay + (isLastDay ? attemptsRemainder : 0)
    const leads = leadsPerDay + (isLastDay ? leadsRemainder : 0)

    result.push({ attempts, leads })
  }

  return result
}
```

- [ ] **Step 2: Write test**

Create `src/lib/__tests__/range-distribution.test.ts`:

```ts
import { distributeAcrossDays } from '../range-distribution'

describe('distributeAcrossDays', () => {
  it('distributes evenly', () => {
    const result = distributeAcrossDays(35, 0, 7)
    expect(result).toHaveLength(7)
    expect(result.every((r) => r.attempts === 5)).toBe(true)
    expect(result.reduce((sum, r) => sum + r.attempts, 0)).toBe(35)
  })

  it('handles remainder by adding to last day', () => {
    const result = distributeAcrossDays(36, 2, 7)
    expect(result).toHaveLength(7)
    expect(result.slice(0, 6).every((r) => r.attempts === 5)).toBe(true)
    expect(result[6].attempts).toBe(6)
    expect(result.reduce((sum, r) => sum + r.attempts, 0)).toBe(36)
  })

  it('handles single day', () => {
    const result = distributeAcrossDays(10, 2, 1)
    expect(result).toEqual([{ attempts: 10, leads: 2 }])
  })
})
```

- [ ] **Step 3: Run test**

```bash
npm run test src/lib/__tests__/range-distribution.test.ts
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/range-distribution.ts src/lib/__tests__/range-distribution.test.ts
git commit -m "feat: add range distribution utility"
```

---

### Task 5: Create Badge Logic Utility

**Files:**
- Create: `src/lib/badge-logic.ts`

- [ ] **Step 1: Write the utility**

```ts
import { Agent, OutreachRow } from '@/lib/types'
import { getSprintStartDate, getWeekRange, getTodayDate } from '@/lib/dates'

export type BadgeType = 'streak' | 'on-pace' | 'mvp' | 'conversion'

export interface AgentBadges {
  streak: number
  onPace: boolean
  isMVP: boolean
  isConversionKing: boolean
}

/**
 * Compute consecutive days of ≥5 attempts, ending today (or most recent day)
 */
export function computeStreak(rows: OutreachRow[], agentId: string): number {
  const agentRows = rows
    .filter((r) => r.agent_id === agentId)
    .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())

  if (agentRows.length === 0) return 0

  const today = getTodayDate()
  let streak = 0
  let currentDate = new Date(today)

  // Iterate backwards from today, counting consecutive days ≥5
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayTotal = agentRows
      .filter((r) => r.activity_date === dateStr)
      .reduce((sum, r) => sum + r.attempts, 0)

    if (dayTotal >= 5) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Check if agent is on pace for this sprint week.
 * Expected attempts = daysElapsed × 5
 */
export function isPaceOnTrack(
  rows: OutreachRow[],
  agentId: string,
  currentTab: 'today' | 'week' | 'sprint'
): boolean {
  const agentRows = rows.filter((r) => r.agent_id === agentId)
  const totalAttempts = agentRows.reduce((sum, r) => sum + r.attempts, 0)

  // For simplicity, show "on pace" if ≥5 for today, ≥25 for week, proportional for sprint
  // This can be refined later with more sophisticated calculation
  if (currentTab === 'today') {
    const todayStr = getTodayDate().toISOString().split('T')[0]
    const todayAttempts = agentRows
      .filter((r) => r.activity_date === todayStr)
      .reduce((sum, r) => sum + r.attempts, 0)
    return todayAttempts >= 5
  }

  if (currentTab === 'week') {
    return totalAttempts >= 25
  }

  // Sprint: compute expected based on days elapsed
  const sprintStart = getSprintStartDate()
  const today = getTodayDate()
  const daysElapsed = Math.floor(
    (today.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1
  const expectedAttempts = daysElapsed * 5
  return totalAttempts >= expectedAttempts
}

/**
 * Get the agent with the most attempts today
 */
export function getTopAgentToday(rows: OutreachRow[], agents: Agent[]): Agent | null {
  const todayStr = getTodayDate().toISOString().split('T')[0]

  const agentTotals = new Map<string, number>()
  rows
    .filter((r) => r.activity_date === todayStr)
    .forEach((r) => {
      agentTotals.set(r.agent_id, (agentTotals.get(r.agent_id) || 0) + r.attempts)
    })

  if (agentTotals.size === 0) return null

  let topAgentId = ''
  let topAttempts = 0
  agentTotals.forEach((attempts, agentId) => {
    if (attempts > topAttempts) {
      topAttempts = attempts
      topAgentId = agentId
    }
  })

  return agents.find((a) => a.id === topAgentId) || null
}

/**
 * Get the agent with the highest conversion % (leads / attempts) for the given tab
 */
export function getConversionKing(
  rows: OutreachRow[],
  agents: Agent[],
  currentTab: 'today' | 'week' | 'sprint'
): Agent | null {
  let filteredRows = rows

  if (currentTab === 'today') {
    const todayStr = getTodayDate().toISOString().split('T')[0]
    filteredRows = rows.filter((r) => r.activity_date === todayStr)
  } else if (currentTab === 'week') {
    const { start, end } = getWeekRange()
    filteredRows = rows.filter((r) => r.activity_date >= start && r.activity_date <= end)
  }
  // sprint uses all rows

  const agentStats = new Map<string, { attempts: number; leads: number }>()
  filteredRows.forEach((r) => {
    const current = agentStats.get(r.agent_id) || { attempts: 0, leads: 0 }
    agentStats.set(r.agent_id, {
      attempts: current.attempts + r.attempts,
      leads: current.leads + r.leads,
    })
  })

  let kingAgentId = ''
  let bestRate = 0
  agentStats.forEach(({ attempts, leads }, agentId) => {
    if (attempts === 0) return
    const rate = leads / attempts
    if (rate > bestRate) {
      bestRate = rate
      kingAgentId = agentId
    }
  })

  return kingAgentId ? agents.find((a) => a.id === kingAgentId) || null : null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/badge-logic.ts
git commit -m "feat: add badge computation utilities"
```

---

### Task 6: Create LogActivityModal Component

**Files:**
- Create: `src/components/LogActivityModal.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DateModeToggle } from './DateModeToggle'
import { NumberStepper } from './NumberStepper'
import { useToast } from '@/components/ui/use-toast'
import { insertOutreach } from '@/lib/queries'
import { distributeAcrossDays } from '@/lib/range-distribution'
import { getSprintStartDate, getTodayDate } from '@/lib/dates'

interface LogActivityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
  agentName: string
  agentEmoji: string
}

export function LogActivityModal({
  open,
  onOpenChange,
  agentId,
  agentName,
  agentEmoji,
}: LogActivityModalProps) {
  const [mode, setMode] = useState<'today' | 'range'>('today')
  const [attempts, setAttempts] = useState(5)
  const [leads, setLeads] = useState(0)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const today = getTodayDate()
  const sprintStart = getSprintStartDate()

  // Initialize dates on mount
  useMemo(() => {
    const todayStr = today.toISOString().split('T')[0]
    const sprintStartStr = sprintStart.toISOString().split('T')[0]
    if (!startDate) setStartDate(todayStr)
    if (!endDate) setEndDate(todayStr)
  }, [open, startDate, endDate, today, sprintStart])

  const numDays = useMemo(() => {
    if (mode === 'today') return 1
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }, [mode, startDate, endDate])

  const validate = (): boolean => {
    setError('')

    if (attempts + leads === 0) {
      setError('Attempts + leads must be greater than 0')
      return false
    }

    if (mode === 'range') {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const todayDate = getTodayDate()

      if (start < sprintStart) {
        setError(`Start date cannot be before sprint start (${sprintStart.toDateString()})`)
        return false
      }

      if (end > todayDate) {
        setError('End date cannot be in the future')
        return false
      }

      if (start > end) {
        setError('Start date must be before or equal to end date')
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const rowsToInsert: Array<{ agent_id: string; activity_date: string; attempts: number; leads: number }> = []

      if (mode === 'today') {
        const todayStr = today.toISOString().split('T')[0]
        rowsToInsert.push({
          agent_id: agentId,
          activity_date: todayStr,
          attempts,
          leads,
        })
      } else {
        const distribution = distributeAcrossDays(attempts, leads, numDays)
        const start = new Date(startDate)

        for (let i = 0; i < numDays; i++) {
          const date = new Date(start)
          date.setDate(date.getDate() + i)
          const dateStr = date.toISOString().split('T')[0]
          const { attempts: dayAttempts, leads: dayLeads } = distribution[i]

          rowsToInsert.push({
            agent_id: agentId,
            activity_date: dateStr,
            attempts: dayAttempts,
            leads: dayLeads,
          })
        }
      }

      await insertOutreach(rowsToInsert)

      const toastMsg =
        mode === 'today'
          ? `Logged ${attempts} outreach for ${agentEmoji} ${agentName}`
          : `Logged ${attempts} outreach for ${agentEmoji} ${agentName} across ${startDate}–${endDate}`

      toast({
        title: 'Success',
        description: toastMsg,
      })

      onOpenChange(false)
      setAttempts(5)
      setLeads(0)
    } catch (err) {
      setError('Failed to log activity. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const todayStr = today.toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-brand-surface border-brand-muted/20">
        <DialogHeader>
          <DialogTitle className="text-white">Log Activity</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <DateModeToggle mode={mode} onChange={setMode} />

          {/* Today Mode */}
          {mode === 'today' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Date</label>
                <div className="bg-brand-black border border-brand-muted/20 rounded px-3 py-2 text-sm text-white">
                  {today.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  (Today)
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Outreach Attempts</label>
                <NumberStepper value={attempts} onChange={setAttempts} max={200} />
              </div>

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Leads Generated (optional)</label>
                <NumberStepper value={leads} onChange={setLeads} max={50} />
              </div>
            </div>
          )}

          {/* Range Mode */}
          {mode === 'range' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={sprintStart.toISOString().split('T')[0]}
                  max={todayStr}
                  className="bg-brand-black border-brand-muted/20 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || sprintStart.toISOString().split('T')[0]}
                  max={todayStr}
                  className="bg-brand-black border-brand-muted/20 text-white"
                />
              </div>

              {numDays > 0 && (
                <div className="text-xs text-brand-muted">→ {numDays} days</div>
              )}

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Total Outreach Attempts</label>
                <NumberStepper value={attempts} onChange={setAttempts} max={200} />
                <p className="text-xs text-brand-muted mt-1">(across {numDays} days)</p>
              </div>

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Total Leads (optional)</label>
                <NumberStepper value={leads} onChange={setLeads} max={50} />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="text-sm text-brand-danger">{error}</div>}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 border-brand-muted/20 text-brand-muted hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-brand-gold-bright text-brand-black hover:bg-brand-gold"
            >
              {loading ? 'Logging...' : `Log ${attempts} Attempts`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LogActivityModal.tsx
git commit -m "feat: add LogActivityModal component"
```

---

### Task 7: Update Home Page (Replace QuickLogButtons with Modal)

**Files:**
- Modify: `src/app/page.tsx`
- Delete: `src/components/QuickLogButtons.tsx`

- [ ] **Step 1: Update page.tsx**

Replace the QuickLogButtons import and usage with LogActivityModal:

```tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { LogActivityModal } from '@/components/LogActivityModal'
import { RecentActivity } from '@/components/RecentActivity'
import {
  Select,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { fetchAgents, fetchOutreach } from '@/lib/client-queries'
import { computeTeamTotals } from '@/lib/aggregates'
import { Agent, OutreachRow } from '@/lib/types'

export const dynamic = 'force-dynamic'

const AGENT_STORAGE_KEY = 'mayhem-selected-agent'

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teamAttempts, setTeamAttempts] = useState(0)
  const [teamLeads, setTeamLeads] = useState(0)

  // Load agents and restore selected agent from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentsData, outreachData] = await Promise.all([
          fetchAgents(),
          fetchOutreach(),
        ])

        setAgents(agentsData.filter((a) => a.active))

        // Restore selected agent from localStorage, or default to first
        const savedAgentId = localStorage.getItem(AGENT_STORAGE_KEY)
        if (savedAgentId && agentsData.find((a) => a.id === savedAgentId)) {
          setSelectedAgentId(savedAgentId)
        } else if (agentsData.length > 0) {
          setSelectedAgentId(agentsData[0].id)
          localStorage.setItem(AGENT_STORAGE_KEY, agentsData[0].id)
        }

        // Calculate team totals
        const totals = computeTeamTotals(outreachData)
        setTeamAttempts(totals.attempts)
        setTeamLeads(totals.leads)
      } catch (error) {
        console.error('Error loading agents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId)
    localStorage.setItem(AGENT_STORAGE_KEY, agentId)
  }

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-surface border-t-brand-gold mx-auto mb-4" />
          <p className="text-brand-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <Suspense fallback={null}>
        <BrandHeader
          initialAttempts={teamAttempts}
          initialLeads={teamLeads}
        />
      </Suspense>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Agent Selector */}
          <div>
            <label className="text-sm font-medium text-brand-muted block mb-2">
              Who's logging?
            </label>
            <Select value={selectedAgentId} onValueChange={handleAgentChange}>
              {selectedAgentId === '' && <SelectItem value="">Select an agent</SelectItem>}
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.emoji} {agent.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Log Activity Button */}
          {selectedAgent && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="w-full bg-brand-gold-bright text-brand-black hover:bg-brand-gold font-semibold py-6 text-base"
            >
              Log Activity
            </Button>
          )}

          {/* Modal */}
          {selectedAgent && (
            <LogActivityModal
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              agentId={selectedAgent.id}
              agentName={selectedAgent.name}
              agentEmoji={selectedAgent.emoji}
            />
          )}

          {/* Recent Activity */}
          <div className="border-t border-brand-muted/20 pt-6">
            <Suspense fallback={<div className="text-center py-4 text-brand-muted">Loading activity...</div>}>
              <RecentActivity />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Discrete Footer */}
      <footer className="text-center py-4 mt-12 border-t border-brand-muted/10">
        <a
          href="/admin"
          className="text-xs text-brand-muted/40 hover:text-brand-muted/60 transition-colors"
        >
          admin
        </a>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Delete QuickLogButtons**

```bash
rm src/components/QuickLogButtons.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git rm src/components/QuickLogButtons.tsx
git commit -m "feat: replace quick buttons with Log Activity modal"
```

---

### Task 8: Update LeaderboardRow to Show Inline Badges

**Files:**
- Modify: `src/components/LeaderboardRow.tsx`

- [ ] **Step 1: Read the current file to understand structure**

```bash
head -50 src/components/LeaderboardRow.tsx
```

- [ ] **Step 2: Update LeaderboardRow to include badges**

Replace with:

```tsx
'use client'

import { LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { BadgePill } from './BadgePill'

interface LeaderboardRowProps {
  row: LeaderboardRowType
  isMVP?: boolean
  isConversionKing?: boolean
  streak: number
  onPace: boolean
}

export function LeaderboardRow({
  row,
  isMVP = false,
  isConversionKing = false,
  streak,
  onPace,
}: LeaderboardRowProps) {
  const conversionPercent = row.attempts > 0 ? ((row.leads / row.attempts) * 100).toFixed(1) : '0.0'

  return (
    <div
      className={`bg-brand-surface rounded-lg p-4 transition-all ${
        row.rank === 1 ? 'border-l-4 border-l-brand-gold' : ''
      }`}
    >
      {/* Header: Rank + Name + Streak */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${row.rank === 1 ? 'text-brand-gold' : 'text-brand-muted'}`}>
            #{row.rank}
          </span>
          <span className="font-semibold">
            {row.agent.emoji} {row.agent.name}
          </span>
        </div>
        {streak > 0 && <BadgePill type="streak" value={streak} />}
      </div>

      {/* Stats: Attempts · Leads · Conversion % */}
      <div className="text-sm text-brand-muted mb-3">
        {row.attempts} attempts · {row.leads} leads ·{' '}
        <span className={conversionPercent >= '10.0' ? 'text-brand-success' : ''}>
          {conversionPercent}%
        </span>
      </div>

      {/* Badges: On pace, MVP, Conversion King */}
      <div className="flex gap-2 flex-wrap">
        {onPace && <BadgePill type="on-pace" />}
        {isMVP && <BadgePill type="mvp" />}
        {isConversionKing && <BadgePill type="conversion" />}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LeaderboardRow.tsx
git commit -m "feat: update LeaderboardRow to show inline badges"
```

---

### Task 9: Update LeaderboardTabs to Compute and Pass Badges

**Files:**
- Modify: `src/components/LeaderboardTabs.tsx`

- [ ] **Step 1: Import badge logic**

Add imports at the top:

```tsx
import { computeStreak, isPaceOnTrack, getTopAgentToday, getConversionKing } from '@/lib/badge-logic'
```

- [ ] **Step 2: Update the leaderboard rendering**

In the map where LeaderboardRow is rendered, add badge computation:

```tsx
leaderboard.map((row) => {
  const streak = computeStreak(rows, row.agent.id)
  const onPace = isPaceOnTrack(rows, row.agent.id, activeTab)
  const topToday = getTopAgentToday(agents, rows)
  const conversionKing = getConversionKing(rows, agents, activeTab)

  return (
    <LeaderboardRow
      key={row.agent.id}
      row={row}
      streak={streak}
      onPace={onPace}
      isMVP={activeTab === 'today' && topToday?.id === row.agent.id}
      isConversionKing={conversionKing?.id === row.agent.id}
    />
  )
})
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LeaderboardTabs.tsx
git commit -m "feat: integrate badge logic into leaderboard"
```

---

### Task 10: Update insertOutreach Query to Accept Multiple Rows

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Check current insertOutreach signature**

Look for the current implementation and update it:

```ts
export async function insertOutreach(
  rows: Array<{ agent_id: string; activity_date: string; attempts: number; leads: number }>
): Promise<void> {
  const { error } = await supabase
    .from('outreach')
    .insert(rows)

  if (error) throw error
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: update insertOutreach to handle multiple rows"
```

---

### Task 11: Manual Testing

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test home page**

- Navigate to `/`
- Select an agent
- Tap "Log Activity"
- Verify modal opens with "Log Today's Activity" selected
- Enter 5 attempts, 0 leads
- Submit
- Verify toast appears and modal closes

- [ ] **Step 3: Test range mode**

- Tap "Log Activity" again
- Switch to "Log for a Range"
- Pick start and end dates (e.g., May 6 to May 12)
- Verify "→ 7 days" appears
- Enter 35 attempts, 2 leads
- Submit
- Verify toast appears with correct message

- [ ] **Step 4: Test leaderboard**

- Navigate to `/leaderboard`
- Verify leaderboard shows inline badges (streak, on pace, MVP, conversion king)
- Switch tabs (Today, This Week, Sprint Total)
- Verify badges update appropriately

- [ ] **Step 5: Test realtime updates**

- Log activity on home page
- Switch to leaderboard tab
- Verify new entry appears and leaderboard updates
- Verify streaks and badges update

---

### Task 12: Final Commit

- [ ] **Step 1: Verify all changes**

```bash
git status
```

- [ ] **Step 2: Final commit (if any uncommitted changes)**

```bash
git add .
git commit -m "feat: complete UI redesign — refined aesthetic, modal logging, inline badges"
```

---

## Success Criteria Checklist

- ✓ Modal opens and closes cleanly
- ✓ Today/range toggle works
- ✓ Date pickers work (within sprint window)
- ✓ Number steppers work (bounds enforced)
- ✓ Submit creates correct rows (today = 1, range = N with even distribution)
- ✓ Leaderboard shows all badges (streak, pace, MVP, conversion)
- ✓ Inline badges styled consistently
- ✓ Realtime updates work on both pages
- ✓ Toast messages appear on success
- ✓ No quick-tap buttons on home page
- ✓ Refined aesthetic throughout (colors, spacing, shadows)

---

## Notes

- If `insertOutreach` already exists and works differently, adapt the signature to accept an array of rows
- `getTopAgentToday` should take both rows and agents; currently takes only rows — adjust import in LeaderboardTabs
- `date-fns` and `date-fns-tz` should already be available; if not, they're listed in package.json
- All Tailwind classes use `brand-*` custom color tokens from tailwind.config.ts

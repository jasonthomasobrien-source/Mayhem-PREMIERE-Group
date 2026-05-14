import { Agent, OutreachRow } from '@/lib/types'
import {
  dateToISO,
  todayDetroit,
  getCurrentSprintWeek,
  conversionRate,
} from '@/lib/dates'
import { computeStreak } from '@/lib/streaks'

export type BadgeType = 'streak' | 'on-pace' | 'mvp' | 'conversion'

export interface AgentBadges {
  streak: number
  onPace: boolean
  isMVP: boolean
  isConversionKing: boolean
}

/**
 * Compute consecutive days of ≥5 attempts (delegates to streaks.ts)
 */
export function getStreak(rows: OutreachRow[], agentId: string): number {
  return computeStreak(agentId, rows)
}

/**
 * Check if agent is on pace for the given period.
 * - today: ≥5 attempts
 * - week: ≥25 attempts in current sprint week
 * - sprint: proportional to days elapsed
 */
export function isOnPace(
  rows: OutreachRow[],
  agentId: string,
  period: 'today' | 'week' | 'sprint'
): boolean {
  const agentRows = rows.filter((r) => r.agent_id === agentId)
  const todayISO = dateToISO(todayDetroit())

  if (period === 'today') {
    const todayAttempts = agentRows
      .filter((r) => r.activity_date === todayISO)
      .reduce((sum, r) => sum + r.attempts, 0)
    return todayAttempts >= 5
  }

  if (period === 'week') {
    const currentWeek = getCurrentSprintWeek()
    const weekStart = new Date('2026-05-10')
    weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekStartISO = dateToISO(weekStart)
    const weekEndISO = dateToISO(weekEnd)

    const weekAttempts = agentRows
      .filter((r) => r.activity_date >= weekStartISO && r.activity_date <= weekEndISO)
      .reduce((sum, r) => sum + r.attempts, 0)
    return weekAttempts >= 25
  }

  // Sprint: compute expected based on days elapsed
  const sprintStart = new Date('2026-05-10')
  const today = todayDetroit()
  const daysElapsed = Math.floor(
    (today.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1
  const expectedAttempts = daysElapsed * 5
  const totalAttempts = agentRows.reduce((sum, r) => sum + r.attempts, 0)
  return totalAttempts >= expectedAttempts
}

/**
 * Get the agent with the most attempts in the given period
 */
export function getTopAgentForPeriod(
  rows: OutreachRow[],
  agents: Agent[],
  period: 'today' | 'week' | 'sprint'
): Agent | null {
  const todayISO = dateToISO(todayDetroit())
  let filteredRows = rows

  if (period === 'today') {
    filteredRows = rows.filter((r) => r.activity_date === todayISO)
  } else if (period === 'week') {
    const currentWeek = getCurrentSprintWeek()
    const weekStart = new Date('2026-05-10')
    weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekStartISO = dateToISO(weekStart)
    const weekEndISO = dateToISO(weekEnd)

    filteredRows = rows.filter((r) => r.activity_date >= weekStartISO && r.activity_date <= weekEndISO)
  }
  // sprint uses all rows

  const agentTotals = new Map<string, number>()
  filteredRows.forEach((r) => {
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
 * Get the agent with the highest conversion % (leads / attempts) for the given period
 */
export function getConversionKing(
  rows: OutreachRow[],
  agents: Agent[],
  period: 'today' | 'week' | 'sprint'
): Agent | null {
  const todayISO = dateToISO(todayDetroit())
  let filteredRows = rows

  if (period === 'today') {
    filteredRows = rows.filter((r) => r.activity_date === todayISO)
  } else if (period === 'week') {
    const currentWeek = getCurrentSprintWeek()
    const weekStart = new Date('2026-05-10')
    weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekStartISO = dateToISO(weekStart)
    const weekEndISO = dateToISO(weekEnd)

    filteredRows = rows.filter((r) => r.activity_date >= weekStartISO && r.activity_date <= weekEndISO)
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
    const rate = conversionRate(attempts, leads)
    if (rate > bestRate) {
      bestRate = rate
      kingAgentId = agentId
    }
  })

  return kingAgentId ? agents.find((a) => a.id === kingAgentId) || null : null
}

/**
 * Compute all badges for an agent in a given period
 */
export function computeAgentBadges(
  rows: OutreachRow[],
  agents: Agent[],
  agentId: string,
  period: 'today' | 'week' | 'sprint'
): AgentBadges {
  const topAgent = getTopAgentForPeriod(rows, agents, period)
  const kingAgent = getConversionKing(rows, agents, period)

  return {
    streak: getStreak(rows, agentId),
    onPace: isOnPace(rows, agentId, period),
    isMVP: topAgent?.id === agentId,
    isConversionKing: kingAgent?.id === agentId,
  }
}

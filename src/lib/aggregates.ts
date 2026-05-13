import { Agent, OutreachRow, AgentStats, LeaderboardRow } from './types'
import { computeStreak } from './streaks'
import {
  dateToISO,
  conversionRate,
  getSprintWeekNumber,
  getCurrentSprintWeek,
  getDaysElapsed,
} from './dates'

// Sum attempts and leads for an agent across a date range
export function sumByDateRange(
  agentId: string,
  rows: OutreachRow[],
  startDate: string,
  endDate: string
): { attempts: number; leads: number } {
  const filtered = rows.filter(
    (r) =>
      r.agent_id === agentId &&
      r.activity_date >= startDate &&
      r.activity_date <= endDate
  )
  return {
    attempts: filtered.reduce((sum, r) => sum + r.attempts, 0),
    leads: filtered.reduce((sum, r) => sum + r.leads, 0),
  }
}

// Get today's date in ISO format (Detroit timezone)
function todayISO(): string {
  const now = new Date()
  return dateToISO(new Date(now.getTime() + now.getTimezoneOffset() * 60000 - 4 * 60 * 60 * 1000))
}

// Compute stats for a single agent across all data
export function computeAgentStats(
  agent: Agent,
  allRows: OutreachRow[],
  sprintStartISO: string
): AgentStats {
  // All-sprint totals
  const sprintTotals = sumByDateRange(agent.id, allRows, sprintStartISO, '2026-06-30')

  // Current week boundaries
  const currentWeek = getCurrentSprintWeek()
  const weekStart = new Date('2026-05-12')
  weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const weekTotals = sumByDateRange(
    agent.id,
    allRows,
    dateToISO(weekStart),
    dateToISO(weekEnd)
  )

  const conversion = conversionRate(sprintTotals.attempts, sprintTotals.leads)
  const streak = computeStreak(agent.id, allRows)

  return {
    agent,
    totalAttempts: sprintTotals.attempts,
    totalLeads: sprintTotals.leads,
    conversionRate: conversion,
    streak,
    currentWeekAttempts: weekTotals.attempts,
    onPace: weekTotals.attempts >= 25,
  }
}

// Compute stats for all agents
export function computeAllAgentStats(
  agents: Agent[],
  allRows: OutreachRow[],
  sprintStartISO: string
): AgentStats[] {
  return agents.map((agent) => computeAgentStats(agent, allRows, sprintStartISO))
}

// Build leaderboard for a specific period (today / week / sprint)
export function buildLeaderboard(
  agents: Agent[],
  allRows: OutreachRow[],
  period: 'today' | 'week' | 'sprint',
  sprintStartISO: string
): LeaderboardRow[] {
  const now = new Date()
  const todayISO = dateToISO(now)
  const currentWeek = getCurrentSprintWeek()
  const weekStart = new Date('2026-05-12')
  weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  // Compute stats for each agent based on period
  const rows = agents.map((agent) => {
    const allStats = computeAgentStats(agent, allRows, sprintStartISO)

    let periodAttempts = 0
    let periodLeads = 0

    if (period === 'today') {
      const todayData = sumByDateRange(agent.id, allRows, todayISO, todayISO)
      periodAttempts = todayData.attempts
      periodLeads = todayData.leads
    } else if (period === 'week') {
      const weekData = sumByDateRange(
        agent.id,
        allRows,
        dateToISO(weekStart),
        dateToISO(weekEnd)
      )
      periodAttempts = weekData.attempts
      periodLeads = weekData.leads
    } else {
      periodAttempts = allStats.totalAttempts
      periodLeads = allStats.totalLeads
    }

    return {
      ...allStats,
      rank: 0, // will be assigned after sorting
      todayAttempts: 0, // populated if needed
      todayLeads: 0,
      weekAttempts: allStats.currentWeekAttempts,
      weekLeads: 0, // computed separately if needed
      sprintAttempts: allStats.totalAttempts,
      sprintLeads: allStats.totalLeads,
    }
  })

  // Sort by period attempts (primary), then by leads (tiebreaker)
  rows.sort((a, b) => {
    if (period === 'today') {
      if (a.todayAttempts !== b.todayAttempts) return b.todayAttempts - a.todayAttempts
      return b.todayLeads - a.todayLeads
    } else if (period === 'week') {
      if (a.weekAttempts !== b.weekAttempts) return b.weekAttempts - a.weekAttempts
      return b.weekLeads - a.weekLeads
    } else {
      if (a.sprintAttempts !== b.sprintAttempts) return b.sprintAttempts - a.sprintAttempts
      return b.sprintLeads - a.sprintLeads
    }
  })

  // Assign ranks
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }))
}

// Compute team totals
export function computeTeamTotals(allRows: OutreachRow[]): {
  attempts: number
  leads: number
  conversion: number
} {
  const attempts = allRows.reduce((sum, r) => sum + r.attempts, 0)
  const leads = allRows.reduce((sum, r) => sum + r.leads, 0)
  const conversion = conversionRate(attempts, leads)
  return { attempts, leads, conversion }
}

// Get today's team activity
export function getTodayTeamActivity(allRows: OutreachRow[]): {
  attempts: number
  leads: number
} {
  const now = new Date()
  const todayISO = dateToISO(now)
  const todayRows = allRows.filter((r) => r.activity_date === todayISO)
  return {
    attempts: todayRows.reduce((sum, r) => sum + r.attempts, 0),
    leads: todayRows.reduce((sum, r) => sum + r.leads, 0),
  }
}

// Get recent activity (last N inserts)
export function getRecentActivity(allRows: OutreachRow[], limit: number = 10): OutreachRow[] {
  return allRows.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()).slice(0, limit)
}

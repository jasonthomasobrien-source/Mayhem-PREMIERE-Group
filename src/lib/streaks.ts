import { OutreachRow } from './types'
import { dateToISO, parseDate } from './dates'

// Compute longest current streak (consecutive days >= 5 attempts)
export function computeStreak(agentId: string, rows: OutreachRow[]): number {
  const agentRows = rows
    .filter((r) => r.agent_id === agentId)
    .sort((a, b) => new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime())

  if (agentRows.length === 0) return 0

  // Group by date, sum attempts
  const dailyAttempts: Record<string, number> = {}
  agentRows.forEach((r) => {
    dailyAttempts[r.activity_date] = (dailyAttempts[r.activity_date] || 0) + r.attempts
  })

  const sortedDates = Object.keys(dailyAttempts).sort()

  let currentStreak = 0
  let maxStreak = 0

  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i])
    const attempts = dailyAttempts[sortedDates[i]]

    if (attempts >= 5) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}

// Check if agent hit >= 5 attempts on a specific date
export function hitDailyGoal(agentId: string, date: string, rows: OutreachRow[]): boolean {
  const dayTotal = rows
    .filter((r) => r.agent_id === agentId && r.activity_date === date)
    .reduce((sum, r) => sum + r.attempts, 0)
  return dayTotal >= 5
}

'use client'

import { OutreachRow } from '@/lib/types'
import { getWeekBounds, dateToISO, formatConversion } from '@/lib/dates'
import { sumByDateRange, computeStreak } from '@/lib/aggregates'

interface WeekBreakdownTableProps {
  agentId: string
  rows: OutreachRow[]
}

export function WeekBreakdownTable({ agentId, rows }: WeekBreakdownTableProps) {
  const weeks = Array.from({ length: 8 }, (_, i) => i + 1).reverse() // Latest week first

  const weekData = weeks.map((weekNum) => {
    const { start, end } = getWeekBounds(weekNum)
    const { attempts, leads } = sumByDateRange(
      agentId,
      rows,
      dateToISO(start),
      dateToISO(end)
    )

    // Check if this week had a streak
    const weekRows = rows.filter(
      (r) =>
        r.agent_id === agentId &&
        r.activity_date >= dateToISO(start) &&
        r.activity_date <= dateToISO(end)
    )

    // Simple streak check for the week
    const streak =
      weekRows.length > 0 &&
      weekRows.some((r) => r.attempts >= 5)
        ? 1
        : 0

    return {
      weekNum,
      attempts,
      leads,
      conversion: formatConversion(attempts, leads),
      streak,
    }
  })

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white">Week-by-week breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-semibold text-brand-muted border-b border-brand-muted/20">
              <th className="text-left py-2">Week</th>
              <th className="text-right py-2">Attempts</th>
              <th className="text-right py-2">Leads</th>
              <th className="text-right py-2">Conversion</th>
              <th className="text-center py-2">Streak</th>
            </tr>
          </thead>
          <tbody>
            {weekData.map((week) => (
              <tr
                key={week.weekNum}
                className="border-b border-brand-muted/10 hover:bg-brand-surface/50 transition-colors"
              >
                <td className="py-3 font-medium text-white">W{week.weekNum}</td>
                <td className="text-right py-3 text-white font-semibold">
                  {week.attempts}
                </td>
                <td className="text-right py-3 text-white font-semibold">
                  {week.leads}
                </td>
                <td className="text-right py-3 text-brand-muted">
                  {week.conversion}%
                </td>
                <td className="text-center py-3">
                  {week.streak > 0 ? (
                    <span className="text-lg">🔥</span>
                  ) : (
                    <span className="text-brand-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

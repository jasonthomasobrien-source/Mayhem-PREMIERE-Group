'use client'

import { Agent, OutreachRow, LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { buildLeaderboard } from '@/lib/aggregates'
import { getStreak } from '@/lib/badge-logic'
import { conversionRate } from '@/lib/dates'

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
          const attempts = activeTab === 'today' ? row.todayAttempts : activeTab === 'week' ? row.weekAttempts : row.sprintAttempts
          const barWidthPercent = (leads / maxLeads) * 100
          const streak = getStreak(rows, row.agent.id)
          const conversion = attempts > 0 ? conversionRate(attempts, leads) : 0
          const conversionPercent = (conversion * 100).toFixed(1)
          const isMVP = activeTab === 'today' && row.rank === 1

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

              {/* Badges: MVP, Conversion %, Streak */}
              <div className="flex gap-2 ml-2 flex-shrink-0 min-w-fit">
                {isMVP && (
                  <span className="text-xs font-bold bg-brand-gold text-brand-black px-2 py-1 rounded whitespace-nowrap">
                    Today's MVP
                  </span>
                )}
                <span
                  className={`text-xs font-semibold ${
                    parseFloat(conversionPercent) >= 10
                      ? 'text-brand-success'
                      : 'text-brand-muted'
                  }`}
                >
                  {conversionPercent}%
                </span>
                {streak > 0 && (
                  <span className="text-sm font-semibold whitespace-nowrap">
                    🔥 {streak}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

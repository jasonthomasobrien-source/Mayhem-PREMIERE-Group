'use client'

import { Agent, OutreachRow, LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { buildLeaderboard } from '@/lib/aggregates'
import { getStreak } from '@/lib/badge-logic'

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
          const streak = getStreak(rows, row.agent.id)
          const goalPercent = attempts > 0 ? (attempts / target) * 100 : 0
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

              {/* Badges: MVP, Goal %, Streak */}
              <div className="flex gap-2 ml-2 flex-shrink-0 min-w-fit">
                {isMVP && (
                  <span className="text-xs font-bold bg-brand-gold text-brand-black px-2 py-1 rounded whitespace-nowrap">
                    Today's MVP
                  </span>
                )}
                <span
                  className={`text-xs font-semibold ${
                    goalPercent >= 100
                      ? 'text-brand-success'
                      : 'text-brand-muted'
                  }`}
                >
                  {goalPercent.toFixed(1)}%
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

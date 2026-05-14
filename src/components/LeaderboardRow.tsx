'use client'

import { LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { BadgePill } from './BadgePill'

interface LeaderboardRowProps {
  row: LeaderboardRowType
  isMVP?: boolean
  isConversionKing?: boolean
  streak: number
  onPace: boolean
  period: 'today' | 'week' | 'sprint'
}

export function LeaderboardRow({
  row,
  isMVP = false,
  isConversionKing = false,
  streak,
  onPace,
  period,
}: LeaderboardRowProps) {
  // Determine which attempts/leads to show based on period
  let attempts = row.sprintAttempts
  let leads = row.sprintLeads
  let goalPercent = 0

  if (period === 'today') {
    attempts = row.todayAttempts
    leads = row.todayLeads
    goalPercent = attempts > 0 ? (attempts / 5) * 100 : 0
  } else if (period === 'week') {
    attempts = row.weekAttempts
    leads = row.weekLeads
    goalPercent = attempts > 0 ? (attempts / 25) * 100 : 0
  } else {
    attempts = row.sprintAttempts
    leads = row.sprintLeads
    goalPercent = attempts > 0 ? (attempts / 175) * 100 : 0
  }

  const conversionPercent = attempts > 0 ? ((leads / attempts) * 100).toFixed(1) : '0.0'

  return (
    <div
      className={`bg-brand-surface rounded-lg p-4 shadow-sm transition-all ${
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
            {row.agent.emoji || '👤'} {row.agent.name}
          </span>
        </div>
        {streak > 0 && <BadgePill type="streak" value={streak} />}
      </div>

      {/* Stats: Attempts · Goal % */}
      <div className="text-sm text-brand-muted mb-3">
        {attempts} attempts ·{' '}
        <span className={goalPercent >= 100 ? 'text-brand-success' : ''}>
          {goalPercent.toFixed(0)}%
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

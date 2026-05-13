'use client'

import { LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { BadgePill } from './BadgePill'
import { ConversionPill } from './ConversionPill'

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
  // Determine which attempts/leads to show based on context
  const attempts = row.todayAttempts > 0 ? row.todayAttempts :
                   row.weekAttempts > 0 ? row.weekAttempts :
                   row.sprintAttempts

  const leads = row.todayLeads > 0 ? row.todayLeads :
                row.weekLeads > 0 ? row.weekLeads :
                row.sprintLeads

  const conversionPercent = attempts > 0 ? ((leads / attempts) * 100).toFixed(1) : '0.0'

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
            {row.agent.emoji || '👤'} {row.agent.name}
          </span>
        </div>
        {streak > 0 && <BadgePill type="streak" value={streak} />}
      </div>

      {/* Stats: Attempts · Leads · Conversion % */}
      <div className="text-sm text-brand-muted mb-3">
        {attempts} attempts · {leads} leads ·{' '}
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

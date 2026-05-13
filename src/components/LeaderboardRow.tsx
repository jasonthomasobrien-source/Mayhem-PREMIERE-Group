'use client'

import { LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { ConversionPill } from './ConversionPill'
import { StreakBadge } from './StreakBadge'

interface LeaderboardRowProps {
  row: LeaderboardRowType
  isMVP?: boolean
}

export function LeaderboardRow({ row, isMVP = false }: LeaderboardRowProps) {
  // Determine which attempts/leads to show based on context
  const attempts = row.todayAttempts > 0 ? row.todayAttempts :
                   row.weekAttempts > 0 ? row.weekAttempts :
                   row.sprintAttempts

  const leads = row.todayLeads > 0 ? row.todayLeads :
                row.weekLeads > 0 ? row.weekLeads :
                row.sprintLeads

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-brand-surface border border-brand-muted/20 hover:border-brand-gold/50 transition-colors">
      {/* Rank and Agent */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="text-lg font-bold text-brand-gold min-w-[28px]">
          #{row.rank}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{row.agent.emoji || '👤'}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {row.agent.name}
            </p>
            {isMVP && (
              <p className="text-xs text-brand-gold font-semibold">TODAY'S MVP</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-white">{attempts}</p>
          <p className="text-xs text-brand-muted">outreach</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-white">{leads}</p>
          <p className="text-xs text-brand-muted">leads</p>
        </div>

        <ConversionPill attempts={attempts} leads={leads} />

        {row.streak > 0 && <StreakBadge streak={row.streak} />}
      </div>
    </div>
  )
}

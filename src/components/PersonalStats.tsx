'use client'

import { Agent, OutreachRow } from '@/lib/types'
import { computeAgentStats } from '@/lib/aggregates'
import { formatConversion } from '@/lib/dates'

interface PersonalStatsProps {
  agent: Agent
  rows: OutreachRow[]
}

export function PersonalStats({ agent, rows }: PersonalStatsProps) {
  const stats = computeAgentStats(agent, rows, '2026-05-10')
  const conversionStr = formatConversion(stats.totalAttempts, stats.totalLeads)

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-brand-surface rounded-lg p-4 border border-brand-muted/20">
        <p className="text-xs font-medium text-brand-muted mb-1">Total attempts</p>
        <p className="text-3xl font-bold text-brand-gold">
          {stats.totalAttempts}
        </p>
      </div>

      <div className="bg-brand-surface rounded-lg p-4 border border-brand-muted/20">
        <p className="text-xs font-medium text-brand-muted mb-1">Total leads</p>
        <p className="text-3xl font-bold text-brand-success">
          {stats.totalLeads}
        </p>
      </div>

      <div className="bg-brand-surface rounded-lg p-4 border border-brand-muted/20">
        <p className="text-xs font-medium text-brand-muted mb-1">Conversion</p>
        <p className="text-3xl font-bold text-white">{conversionStr}%</p>
      </div>

      <div className="bg-brand-surface rounded-lg p-4 border border-brand-muted/20">
        <p className="text-xs font-medium text-brand-muted mb-1">Best streak</p>
        <p className="text-3xl font-bold text-brand-danger flex items-center gap-1">
          {stats.streak}
          {stats.streak > 0 && <span>🔥</span>}
        </p>
      </div>
    </div>
  )
}

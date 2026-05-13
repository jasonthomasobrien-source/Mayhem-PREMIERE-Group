'use client'

import { OutreachRow } from '@/lib/types'
import { getWeekBounds, dateToISO } from '@/lib/dates'
import { sumByDateRange } from '@/lib/aggregates'

interface WeeklyHeatmapProps {
  agentId: string
  rows: OutreachRow[]
}

export function WeeklyHeatmap({ agentId, rows }: WeeklyHeatmapProps) {
  const weeks = Array.from({ length: 8 }, (_, i) => i + 1)

  const getCellColor = (attempts: number): string => {
    if (attempts >= 25) return 'bg-brand-success'
    if (attempts >= 10) return 'bg-yellow-500'
    return 'bg-brand-danger'
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white">Weekly heatmap</h3>
      <div className="grid grid-cols-8 gap-1">
        {weeks.map((weekNum) => {
          const { start, end } = getWeekBounds(weekNum)
          const { attempts } = sumByDateRange(
            agentId,
            rows,
            dateToISO(start),
            dateToISO(end)
          )

          return (
            <div key={weekNum} className="text-center">
              <div
                className={`h-12 rounded flex items-center justify-center text-xs font-bold text-white mb-1 ${getCellColor(attempts)}`}
              >
                {attempts}
              </div>
              <p className="text-xs text-brand-muted">W{weekNum}</p>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 text-xs text-brand-muted pt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-brand-success" />
          <span>25+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>10-24</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-brand-danger" />
          <span>0-9</span>
        </div>
      </div>
    </div>
  )
}

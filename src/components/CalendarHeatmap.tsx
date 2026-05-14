'use client'

import { useMemo } from 'react'
import { eachDayOfInterval, parseISO, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

interface HeatmapData {
  date: string // ISO format YYYY-MM-DD
  attempts: number
  leads: number
}

interface CalendarHeatmapProps {
  data: HeatmapData[]
  sprintStart: Date
  sprintEnd: Date
  agentName?: string // optional, for tooltip context
}

export function CalendarHeatmap({ data, sprintStart, sprintEnd, agentName }: CalendarHeatmapProps) {
  // Create a map of dates to data for fast lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, HeatmapData>()
    data.forEach((d) => map.set(d.date, d))
    return map
  }, [data])

  // Get color based on attempts (intensity)
  const getCellColor = (attempts: number, isOutOfSprint: boolean): string => {
    if (isOutOfSprint) return 'bg-gray-900'
    if (attempts === 0) return 'bg-gray-900'
    if (attempts >= 26) return 'bg-yellow-600' // Dark gold (brand gold)
    if (attempts >= 11) return 'bg-yellow-700' // Medium gold
    if (attempts >= 1) return 'bg-yellow-900' // Light gold
    return 'bg-gray-900'
  }

  // Determine if date is within sprint
  const isWithinSprint = (date: Date): boolean => {
    return date >= sprintStart && date <= sprintEnd
  }

  // Generate calendar months (May, June)
  const months = useMemo(() => {
    const result = []
    const current = new Date(sprintStart)

    while (current <= sprintEnd) {
      const monthStart = startOfMonth(current)
      const monthEnd = endOfMonth(current)
      const calendarStart = startOfWeek(monthStart)
      const calendarEnd = endOfWeek(monthEnd)

      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

      result.push({
        month: format(monthStart, 'MMMM yyyy'),
        days,
      })

      current.setMonth(current.getMonth() + 1)
    }

    return result
  }, [sprintStart, sprintEnd])

  // Compute stats
  const stats = useMemo(() => {
    const validData = data.filter((d) => {
      const date = parseISO(d.date)
      return isWithinSprint(date)
    })

    const totalAttempts = validData.reduce((sum, d) => sum + d.attempts, 0)
    const daysLogged = validData.filter((d) => d.attempts > 0).length

    let bestDay = { date: '', attempts: 0 }
    validData.forEach((d) => {
      if (d.attempts > bestDay.attempts) {
        bestDay = { date: d.date, attempts: d.attempts }
      }
    })

    return { totalAttempts, daysLogged, bestDay }
  }, [data, sprintStart, sprintEnd])

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-brand-muted text-sm">No activity logged yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <div className="space-y-8">
        {months.map((month) => (
          <div key={month.month} className="space-y-3">
            <h3 className="text-sm font-semibold text-white">{month.month}</h3>

            {/* Week grid */}
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs text-brand-muted font-semibold h-6 flex items-center justify-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {month.days.map((day, idx) => {
                  const dateISO = format(day, 'yyyy-MM-dd')
                  const dayData = dataMap.get(dateISO)
                  const attempts = dayData?.attempts ?? 0
                  const leads = dayData?.leads ?? 0
                  const isOutOfSprint = !isWithinSprint(day)
                  const bgColor = getCellColor(attempts, isOutOfSprint)
                  const isDifferentMonth = day.getMonth() !== months[0].days[0].getMonth()

                  return (
                    <div key={idx} className="relative w-9 h-9 group/day">
                      <div
                        className={`
                          absolute inset-0
                          flex items-center justify-center
                          rounded
                          border border-gray-800
                          text-xs font-semibold
                          transition-all
                          hover:border-brand-gold
                          cursor-default
                          ${bgColor}
                          ${isDifferentMonth ? 'opacity-40' : 'text-white'}
                        `}
                      >
                        {format(day, 'd')}
                      </div>
                      {attempts > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/day:block z-50 pointer-events-none">
                          <div style={{ backgroundColor: '#000000', color: '#FFFFFF' }} className="text-xs rounded px-2 py-1 whitespace-nowrap border border-brand-gold font-normal">
                            {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
                            {leads > 0 && ` · ${leads} ${leads === 1 ? 'lead' : 'leads'}`}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-brand-muted pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-900 border border-gray-700" />
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-900" />
          <span>1–10</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-700" />
          <span>11–25</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-600" />
          <span>26+</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-3 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-brand-muted text-xs mb-1">Total attempts</p>
            <p className="text-xl font-bold text-white">{stats.totalAttempts}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs mb-1">Best day</p>
            <p className="text-xl font-bold text-white">{stats.bestDay.attempts}</p>
            <p className="text-xs text-brand-muted">{stats.bestDay.date ? format(parseISO(stats.bestDay.date), 'MMM d') : '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs mb-1">Days logged</p>
            <p className="text-xl font-bold text-white">{stats.daysLogged}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

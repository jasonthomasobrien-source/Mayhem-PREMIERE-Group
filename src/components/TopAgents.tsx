'use client'

import { useEffect, useState } from 'react'
import { fetchAgents, fetchOutreach } from '@/lib/client-queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { buildLeaderboard } from '@/lib/aggregates'
import { Agent, OutreachRow } from '@/lib/types'
import { LoadingSpinner } from './LoadingSpinner'
import { LeaderboardRow } from './LeaderboardRow'
import { getStreak, isOnPace } from '@/lib/badge-logic'

export function TopAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [rows, setRows] = useState<OutreachRow[]>([])
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentData, outreachData] = await Promise.all([
          fetchAgents(),
          fetchOutreach(),
        ])

        setAgents(agentData.filter((a) => a.active))
        setRows(outreachData)
      } catch (error) {
        console.error('Error loading top agents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToOutreach((newRow: OutreachRow) => {
      setRows((prev) => {
        const exists = prev.some((r) => r.id === newRow.id)
        if (exists) return prev
        return [newRow, ...prev]
      })
    })

    return unsubscribe
  }, [])

  const leaderboard = buildLeaderboard(agents, rows, 'sprint', '2026-05-12')
  const topThree = leaderboard.slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Top performers</h3>
      <div className="space-y-3">
        {topThree.length === 0 ? (
          <p className="text-center py-8 text-brand-muted">
            No activity yet
          </p>
        ) : (
          topThree.map((row) => {
            const streak = getStreak(rows, row.agent.id)
            const onPace = isOnPace(rows, row.agent.id, 'sprint')
            return (
              <LeaderboardRow
                key={row.agent.id}
                row={row}
                streak={streak}
                onPace={onPace}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

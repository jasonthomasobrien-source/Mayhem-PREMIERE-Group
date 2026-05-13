'use client'

import { useEffect, useState } from 'react'
import { fetchAgents, fetchOutreach } from '@/lib/queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { buildLeaderboard } from '@/lib/aggregates'
import { Agent, OutreachRow, LeaderboardRow as LeaderboardRowType } from '@/lib/types'
import { LoadingSpinner } from './LoadingSpinner'
import { LeaderboardRow } from './LeaderboardRow'
import { Button } from './ui/button'

export function LeaderboardTabs() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [rows, setRows] = useState<OutreachRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'sprint'>('today')

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
        console.error('Error loading leaderboard data:', error)
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
        // Check if this entry already exists
        const exists = prev.some((r) => r.id === newRow.id)
        if (exists) return prev
        return [newRow, ...prev]
      })
    })

    return unsubscribe
  }, [])

  // Build leaderboard based on active tab
  const leaderboard = buildLeaderboard(agents, rows, activeTab, '2026-05-12')
  const topRow = leaderboard[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-2 border-b border-brand-muted/20">
        {(['today', 'week', 'sprint'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-brand-gold text-brand-gold'
                : 'text-brand-muted hover:text-white border-b-2 border-transparent'
            }`}
          >
            {tab === 'today' && 'Today'}
            {tab === 'week' && 'This Week'}
            {tab === 'sprint' && 'Sprint Total'}
          </button>
        ))}
      </div>

      {/* Leaderboard Rows */}
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-center py-8 text-brand-muted">
            No activity yet. Keep pushing!
          </p>
        ) : (
          leaderboard.map((row) => (
            <LeaderboardRow
              key={row.agent.id}
              row={row}
              isMVP={activeTab === 'today' && row.rank === 1}
            />
          ))
        )}
      </div>
    </div>
  )
}

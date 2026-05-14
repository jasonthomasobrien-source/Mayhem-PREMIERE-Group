'use client'

import { useEffect, useState } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { CalendarHeatmap } from '@/components/CalendarHeatmap'
import { fetchAgents, fetchOutreach, fetchOutreachDailyAggregates } from '@/lib/client-queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { computeTeamTotals } from '@/lib/aggregates'
import { Agent } from '@/lib/types'

interface HeatmapData {
  date: string
  attempts: number
  leads: number
}

const SPRINT_START = new Date('2026-05-12')
const SPRINT_END = new Date('2026-06-30')

export default function ReportPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [teamAttempts, setTeamAttempts] = useState(0)
  const [teamLeads, setTeamLeads] = useState(0)

  // Fetch agents and team totals on mount
  useEffect(() => {
    Promise.all([fetchAgents(), fetchOutreach()])
      .then(([agentList, outreachData]) => {
        setAgents(agentList)
        const totals = computeTeamTotals(outreachData)
        setTeamAttempts(totals.attempts)
        setTeamLeads(totals.leads)
        setReady(true)
      })
      .catch((err) => {
        console.error('Error loading data:', err)
        setReady(true)
      })
  }, [])

  // Fetch heatmap data when selectedAgentId changes
  useEffect(() => {
    const agentId = selectedAgentId === 'all' ? undefined : selectedAgentId
    fetchOutreachDailyAggregates(agentId)
      .then((data) => {
        setHeatmapData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading heatmap:', err)
        setLoading(false)
      })
  }, [selectedAgentId])

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToOutreach(() => {
      const agentId = selectedAgentId === 'all' ? undefined : selectedAgentId
      fetchOutreachDailyAggregates(agentId).then(setHeatmapData)
    })
    return () => unsubscribe()
  }, [selectedAgentId])

  const selectedAgentName =
    selectedAgentId === 'all'
      ? 'All Agents'
      : agents.find((a) => a.id === selectedAgentId)?.name || 'Unknown'

  if (!ready) {
    return null
  }

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <BrandHeader
        initialAttempts={teamAttempts}
        initialLeads={teamLeads}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Report</h1>
            <p className="text-sm text-brand-muted">Sprint activity heatmap by day</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">View:</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="flex h-10 w-full max-w-xs appearance-none rounded-md border border-brand-muted bg-brand-surface px-3 py-2 text-sm text-white placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Agents</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.emoji} {agent.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-brand-muted">Loading...</p>
            </div>
          ) : (
            <div className="bg-brand-surface rounded-lg p-6 border border-gray-800">
              <CalendarHeatmap
                data={heatmapData}
                sprintStart={SPRINT_START}
                sprintEnd={SPRINT_END}
                agentName={selectedAgentName}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

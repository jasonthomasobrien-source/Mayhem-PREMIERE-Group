'use client'

import { useEffect, useState, useCallback } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { CalendarHeatmap } from '@/components/CalendarHeatmap'
import { getOutreachDailyAggregates } from '@/lib/queries'
import { fetchAgents } from '@/lib/queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { parseISO } from 'date-fns'
import { Agent } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

  // Fetch agents on mount
  useEffect(() => {
    async function loadAgents() {
      const agentList = await fetchAgents()
      setAgents(agentList)
    }

    loadAgents()
  }, [])

  // Fetch heatmap data when selectedAgentId changes
  useEffect(() => {
    async function loadHeatmapData() {
      setLoading(true)
      const agentId = selectedAgentId === 'all' ? undefined : selectedAgentId
      const data = await getOutreachDailyAggregates(agentId)
      setHeatmapData(data)
      setLoading(false)
    }

    loadHeatmapData()
  }, [selectedAgentId])

  // Subscribe to realtime updates and refetch when new data arrives
  useEffect(() => {
    const unsubscribe = subscribeToOutreach(() => {
      // Refetch heatmap data when new outreach is logged
      const agentId = selectedAgentId === 'all' ? undefined : selectedAgentId
      getOutreachDailyAggregates(agentId).then(setHeatmapData)
    })

    return () => unsubscribe()
  }, [selectedAgentId])

  const selectedAgentName =
    selectedAgentId === 'all'
      ? 'All Agents'
      : agents.find((a) => a.id === selectedAgentId)?.name || 'Unknown'

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <BrandHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Report</h1>
            <p className="text-sm text-brand-muted">
              Sprint activity heatmap by day
            </p>
          </div>

          {/* Agent Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">View:</label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="w-full max-w-xs bg-brand-surface border-brand-surface text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-brand-surface border-brand-surface text-white">
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.emoji} {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Heatmap */}
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

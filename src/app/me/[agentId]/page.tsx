'use client'

import { useEffect, useState } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { WeeklyHeatmap } from '@/components/WeeklyHeatmap'
import { WeekBreakdownTable } from '@/components/WeekBreakdownTable'
import { PersonalStats } from '@/components/PersonalStats'
import { fetchAgents, fetchOutreachByAgent } from '@/lib/client-queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { Agent, OutreachRow } from '@/lib/types'

interface PersonalPageProps {
  params: {
    agentId: string
  }
}

export default function PersonalPage({ params }: PersonalPageProps) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [rows, setRows] = useState<OutreachRow[]>([])
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agents, agentRows] = await Promise.all([
          fetchAgents(),
          fetchOutreachByAgent(params.agentId),
        ])

        const foundAgent = agents.find((a) => a.id === params.agentId)
        setAgent(foundAgent || null)
        setRows(agentRows)
      } catch (error) {
        console.error('Error loading personal data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.agentId])

  // Subscribe to realtime updates for this agent
  useEffect(() => {
    const unsubscribe = subscribeToOutreach((newRow: OutreachRow) => {
      if (newRow.agent_id === params.agentId) {
        setRows((prev) => {
          const exists = prev.some((r) => r.id === newRow.id)
          if (exists) return prev
          return [newRow, ...prev]
        })
      }
    })

    return unsubscribe
  }, [params.agentId])

  if (loading || !agent) {
    return (
      <div className="min-h-screen bg-brand-black text-white">
        <BrandHeader />
        <main className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <BrandHeader />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <span className="text-4xl">{agent.emoji || '👤'}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
              <p className="text-sm text-brand-muted">Sprint progress</p>
            </div>
          </div>

          {/* Stats Grid */}
          <PersonalStats agent={agent} rows={rows} />

          {/* Weekly Heatmap */}
          <div className="bg-brand-surface rounded-lg p-6 border border-brand-muted/20">
            <WeeklyHeatmap agentId={agent.id} rows={rows} />
          </div>

          {/* Week Breakdown */}
          <div className="bg-brand-surface rounded-lg p-6 border border-brand-muted/20">
            <WeekBreakdownTable agentId={agent.id} rows={rows} />
          </div>
        </div>
      </main>
    </div>
  )
}

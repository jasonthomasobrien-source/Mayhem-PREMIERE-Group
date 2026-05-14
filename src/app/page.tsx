'use client'

import { useEffect, useState, Suspense } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { LogActivityModal } from '@/components/LogActivityModal'
import { AgentSearchSelector } from '@/components/AgentSearchSelector'
import { RecentActivity } from '@/components/RecentActivity'
import { fetchAgents, fetchOutreach } from '@/lib/client-queries'
import { computeTeamTotals } from '@/lib/aggregates'
import { Agent, OutreachRow } from '@/lib/types'
import { AGENT_STORAGE_KEY } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teamAttempts, setTeamAttempts] = useState(0)
  const [teamLeads, setTeamLeads] = useState(0)

  // Load agents and restore selected agent from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentsData, outreachData] = await Promise.all([
          fetchAgents(),
          fetchOutreach(),
        ])

        setAgents(agentsData.filter((a) => a.active))

        // Restore selected agent from localStorage
        const savedAgentId = localStorage.getItem(AGENT_STORAGE_KEY)
        if (savedAgentId && agentsData.find((a) => a.id === savedAgentId)) {
          setSelectedAgentId(savedAgentId)
        }

        // Calculate team totals
        const totals = computeTeamTotals(outreachData)
        setTeamAttempts(totals.attempts)
        setTeamLeads(totals.leads)
      } catch (error) {
        console.error('Error loading agents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId)
    localStorage.setItem(AGENT_STORAGE_KEY, agentId)
  }

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-surface border-t-brand-gold mx-auto mb-4" />
          <p className="text-brand-muted">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <Suspense fallback={null}>
        <BrandHeader
          initialAttempts={teamAttempts}
          initialLeads={teamLeads}
        />
      </Suspense>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Card: Agent Selector + Log Activity */}
          <div className="bg-brand-surface rounded-xl p-6 shadow-sm border border-brand-muted/10">
            {/* Agent Selector */}
            <div className="mb-4">
              <label className="text-sm font-medium text-brand-muted block mb-2">
                Who&apos;s logging?
              </label>
              <AgentSearchSelector
                agents={agents}
                selectedAgentId={selectedAgentId}
                onAgentChange={handleAgentChange}
              />
            </div>

            {/* Log Activity Button */}
            {selectedAgent && (
              <button
                onClick={() => setDialogOpen(true)}
                className="w-full bg-brand-gold-bright hover:bg-brand-gold text-brand-black font-bold py-4 px-6 rounded-lg text-base transition-colors"
              >
                Log Activity
              </button>
            )}
          </div>

          {/* Modal */}
          {selectedAgent && (
            <LogActivityModal
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              agentId={selectedAgent.id}
              agentName={selectedAgent.name}
              agentEmoji={selectedAgent.emoji || '👤'}
            />
          )}

          {/* Recent Activity */}
          <div className="border-t border-brand-muted/20 pt-6">
            <Suspense fallback={<div className="text-center py-4 text-brand-muted">Loading activity...</div>}>
              <RecentActivity />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Discrete Footer */}
      <footer className="text-center py-4 mt-12 border-t border-brand-muted/10">
        <a
          href="/admin"
          className="text-xs text-brand-muted/40 hover:text-brand-muted/60 transition-colors"
        >
          admin
        </a>
      </footer>
    </div>
  )
}

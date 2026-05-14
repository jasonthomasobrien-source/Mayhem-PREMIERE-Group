'use client'

import { useEffect, useState } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { LeaderboardTabs } from '@/components/LeaderboardTabs'
import { fetchOutreach } from '@/lib/client-queries'
import { computeTeamTotals } from '@/lib/aggregates'

export default function LeaderboardPage() {
  const [teamAttempts, setTeamAttempts] = useState(0)
  const [teamLeads, setTeamLeads] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchOutreach()
      .then((data) => {
        const totals = computeTeamTotals(data)
        setTeamAttempts(totals.attempts)
        setTeamLeads(totals.leads)
        setReady(true)
      })
      .catch((err) => {
        console.error('Error loading team totals:', err)
        setReady(true)
      })
  }, [])

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
            <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-sm text-brand-muted">
              Live rankings across the sprint
            </p>
          </div>

          <LeaderboardTabs />
        </div>
      </main>
    </div>
  )
}

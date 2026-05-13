'use client'

import { useEffect, useState } from 'react'
import { getDaysRemaining } from '@/lib/dates'
import { subscribeToOutreach } from '@/lib/realtime'
import { computeTeamTotals } from '@/lib/aggregates'
import { OutreachRow } from '@/lib/types'

interface BrandHeaderProps {
  initialAttempts?: number
  initialLeads?: number
}

export function BrandHeader({ initialAttempts = 0, initialLeads = 0 }: BrandHeaderProps) {
  const [teamAttempts, setTeamAttempts] = useState(initialAttempts)
  const [teamLeads, setTeamLeads] = useState(initialLeads)
  const daysRemaining = getDaysRemaining()

  useEffect(() => {
    // Subscribe to new outreach entries
    const unsubscribe = subscribeToOutreach((newRow: OutreachRow) => {
      // Update team totals optimistically
      setTeamAttempts((prev) => prev + newRow.attempts)
      setTeamLeads((prev) => prev + newRow.leads)
    })

    return unsubscribe
  }, [])

  return (
    <div className="w-full bg-gradient-to-b from-brand-surface to-brand-black border-b-2 border-brand-gold/20 px-6 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-brand-gold tracking-widest uppercase">
                MAYHEM SPRINT
              </h1>
              <p className="text-xs sm:text-sm text-brand-muted mt-1">
                {daysRemaining} days remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-brand-muted uppercase tracking-wide">Team total</p>
              <p className="text-2xl sm:text-3xl font-bold text-brand-gold-bright mt-1">
                {teamAttempts}
              </p>
              <p className="text-xs text-brand-success mt-1">
                {teamLeads} leads
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

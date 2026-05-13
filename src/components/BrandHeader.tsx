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
    <div className="w-full bg-brand-black border-b border-brand-muted/20 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                MAYHEM SPRINT
              </h1>
              <p className="text-xs sm:text-sm text-brand-muted">
                {daysRemaining} days remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-brand-muted">Team total</p>
              <p className="text-lg sm:text-2xl font-bold text-brand-gold">
                {teamAttempts} outreach
              </p>
              <p className="text-xs sm:text-sm text-brand-success">
                {teamLeads} leads
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

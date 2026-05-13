'use client'

import { useEffect, useState } from 'react'
import { fetchOutreach } from '@/lib/client-queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { computeTeamTotals } from '@/lib/aggregates'
import { getTeamGoalTotal } from '@/lib/dates'
import { OutreachRow } from '@/lib/types'

export function Thermometer() {
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(true)

  const goalTotal = getTeamGoalTotal()
  const percentage = Math.min((attempts / goalTotal) * 100, 100)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const outreachData = await fetchOutreach()
        const totals = computeTeamTotals(outreachData)
        setAttempts(totals.attempts)
      } catch (error) {
        console.error('Error loading outreach:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToOutreach((newRow: OutreachRow) => {
      setAttempts((prev) => prev + newRow.attempts)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="h-12 bg-brand-surface rounded-full animate-pulse" />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-brand-muted">Sprint progress</p>
        <p className="text-sm font-semibold text-white">
          {attempts.toLocaleString()} of {goalTotal.toLocaleString()}
        </p>
      </div>
      <div className="h-4 bg-brand-surface rounded-full overflow-hidden border border-brand-muted/20">
        <div
          className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-bright transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-right text-brand-muted">
        {Math.round(percentage)}% complete
      </p>
    </div>
  )
}

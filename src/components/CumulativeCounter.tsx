'use client'

import { useEffect, useState } from 'react'
import { fetchOutreach } from '@/lib/queries'
import { subscribeToOutreach } from '@/lib/realtime'
import { computeTeamTotals } from '@/lib/aggregates'
import { OutreachRow } from '@/lib/types'

export function CumulativeCounter() {
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="text-center">
      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-surface border-t-brand-gold" />
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-brand-muted mb-2">Team total</p>
          <p className="text-7xl font-black text-brand-gold tabular-nums">
            {attempts.toLocaleString()}
          </p>
          <p className="text-sm font-medium text-brand-muted mt-2">outreach</p>
        </>
      )}
    </div>
  )
}

'use client'

import { getDaysRemaining } from '@/lib/dates'

export function DaysRemaining() {
  const daysRemaining = getDaysRemaining()

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-brand-muted mb-2">Days remaining</p>
      <p className="text-5xl font-black text-brand-gold tabular-nums">
        {daysRemaining}
      </p>
      <p className="text-sm font-medium text-brand-muted mt-2">days</p>
    </div>
  )
}

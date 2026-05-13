'use client'

import { CumulativeCounter } from '@/components/CumulativeCounter'
import { DaysRemaining } from '@/components/DaysRemaining'
import { Thermometer } from '@/components/Thermometer'
import { TopAgents } from '@/components/TopAgents'

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* Top Row: Counter and Days */}
          <div className="grid grid-cols-2 gap-8">
            <CumulativeCounter />
            <DaysRemaining />
          </div>

          {/* Thermometer */}
          <div className="bg-brand-surface rounded-lg p-6 border border-brand-muted/20">
            <Thermometer />
          </div>

          {/* Top Agents */}
          <div className="bg-brand-surface rounded-lg p-6 border border-brand-muted/20">
            <TopAgents />
          </div>
        </div>
      </main>
    </div>
  )
}

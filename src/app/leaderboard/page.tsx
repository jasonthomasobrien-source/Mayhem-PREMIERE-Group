'use client'

import { BrandHeader } from '@/components/BrandHeader'
import { LeaderboardTabs } from '@/components/LeaderboardTabs'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white">
      <BrandHeader />

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

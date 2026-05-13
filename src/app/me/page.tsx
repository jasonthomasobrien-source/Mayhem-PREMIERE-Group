'use client'

import { BrandHeader } from '@/components/BrandHeader'

export default function MePage() {
  return (
    <div className="min-h-screen bg-brand-black text-white">
      <BrandHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p>Select an agent from the home page to view their progress.</p>
      </main>
    </div>
  )
}

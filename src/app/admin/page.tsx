'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PINGate } from '@/components/PINGate'
import { AgentManagementTab } from '@/components/AgentManagementTab'
import { LogCorrectionTab } from '@/components/LogCorrectionTab'
import { ExportTab } from '@/components/ExportTab'
import { BrandHeader } from '@/components/BrandHeader'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'agents' | 'logs' | 'export'>(
    'agents'
  )

  if (!authenticated) {
    return <PINGate onSuccess={() => setAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-brand-black text-white">
      <BrandHeader />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-sm text-brand-muted">
                Manage agents, correct logs, and export data
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-gold hover:text-brand-gold-bright transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-brand-muted/20">
            {(['agents', 'logs', 'export'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-brand-gold text-brand-gold'
                    : 'text-brand-muted hover:text-white border-b-2 border-transparent'
                }`}
              >
                {tab === 'agents' && 'Agents'}
                {tab === 'logs' && 'Logs'}
                {tab === 'export' && 'Export'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="py-6">
            {activeTab === 'agents' && <AgentManagementTab />}
            {activeTab === 'logs' && <LogCorrectionTab />}
            {activeTab === 'export' && <ExportTab />}
          </div>
        </div>
      </main>
    </div>
  )
}

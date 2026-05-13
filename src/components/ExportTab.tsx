'use client'

import { useEffect, useState } from 'react'
import { OutreachRow, Agent } from '@/lib/types'
import { fetchAllOutreachAdmin, fetchAgents } from '@/lib/client-queries'
import { Button } from './ui/button'
import { LoadingSpinner } from './LoadingSpinner'
import { toast } from '@/lib/toast'

export function ExportTab() {
  const [rows, setRows] = useState<OutreachRow[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [outreachData, agentData] = await Promise.all([
          fetchAllOutreachAdmin(),
          fetchAgents(),
        ])

        setRows(outreachData)
        setAgents(agentData)
      } catch (error) {
        console.error('Error loading export data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleExport = async () => {
    setExporting(true)

    try {
      // Build CSV
      const agentMap = agents.reduce(
        (acc, agent) => {
          acc[agent.id] = agent.name
          return acc
        },
        {} as Record<string, string>
      )

      const headers = [
        'agent_id',
        'agent_name',
        'activity_date',
        'attempts',
        'leads',
        'note',
      ]

      const csvRows = rows.map((row) => [
        row.agent_id,
        agentMap[row.agent_id] || row.agent_id,
        row.activity_date,
        row.attempts,
        row.leads,
        row.note ? `"${row.note.replace(/"/g, '""')}"` : '',
      ])

      const csv = [
        headers.join(','),
        ...csvRows.map((row) => row.join(',')),
      ].join('\n')

      // Download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mayhem-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast('CSV exported successfully', 'success')
    } catch (error) {
      console.error('Error exporting:', error)
      toast('Error exporting CSV', 'error')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-brand-surface rounded-lg p-6 border border-brand-muted/20">
        <h3 className="text-lg font-semibold text-white mb-2">Export Sprint Data</h3>
        <p className="text-sm text-brand-muted mb-4">
          Download all outreach logs as CSV: {rows.length} entries
        </p>

        <div className="space-y-2 text-xs text-brand-muted mb-4">
          <p>Includes:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Agent ID and name</li>
            <li>Activity date</li>
            <li>Attempts and leads</li>
            <li>Optional notes</li>
          </ul>
        </div>

        <Button onClick={handleExport} disabled={exporting || rows.length === 0}>
          {exporting ? 'Exporting...' : 'Download CSV'}
        </Button>
      </div>
    </div>
  )
}
